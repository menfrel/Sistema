import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { AspectRatio } from "./ui/aspect-ratio";
import { X, Upload, Image as ImageIcon, ArrowLeft } from "lucide-react";
import supabase from "@/lib/supabase";

const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  type: z.string().min(1, { message: "Selecione um tipo de produto" }),
  ingredients: z.string().optional(),
  manufacturer: z.string().min(1, { message: "Informe o fabricante" }),
  location: z.string().min(1, { message: "Informe a localização" }),
  fair: z.string().optional(),
  seals: z.string().optional(),
  variations: z.string().optional(),
  observations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ProductForm = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "",
      ingredients: "",
      manufacturer: "",
      location: "",
      fair: "",
      seals: "",
      variations: "",
      observations: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = images.length + newFiles.length;

      if (totalImages > 6) {
        alert("Você pode enviar no máximo 6 imagens");
        return;
      }

      setImages((prevImages) => [...prevImages, ...newFiles]);

      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setImageUrls((prevUrls) => [...prevUrls, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));

    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const sealsArray = data.seals
        ? data.seals.split(",").map((seal) => seal.trim())
        : [];

      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert([
          {
            title: data.title,
            type: data.type,
            ingredients: data.ingredients,
            manufacturer: data.manufacturer,
            location: data.location,
            fair: data.fair,
            seals: sealsArray,
            variations: data.variations,
            observations: data.observations,
          },
        ])
        .select();

      if (productError) {
        if (productError.message && productError.message.includes("fair")) {
          const { data: retryData, error: retryError } = await supabase
            .from("products")
            .insert([
              {
                title: data.title,
                type: data.type,
                ingredients: data.ingredients,
                manufacturer: data.manufacturer,
                location: data.location,
                seals: sealsArray,
                variations: data.variations,
                observations: data.observations,
              },
            ])
            .select();

          if (retryError) throw retryError;
          if (retryData) productData = retryData;
        } else {
          throw productError;
        }
      }

      if (!productData || productData.length === 0) {
        throw new Error("Falha ao criar produto. Nenhum dado retornado.");
      }

      if (images.length > 0 && productData && productData.length > 0) {
        const productId = productData[0].id;

        const storageConfig = localStorage.getItem("storageConfig");
        let bucketName = "produtos";
        let imagePath = "products";

        if (storageConfig) {
          try {
            const parsedConfig = JSON.parse(storageConfig);
            bucketName = parsedConfig.bucketName || bucketName;
            imagePath = parsedConfig.imagePath || imagePath;
          } catch (err) {
            console.error(
              "Erro ao carregar configurações de armazenamento:",
              err,
            );
          }
        }

        // Verificar se o bucket existe, se não, criar
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(
          (bucket) => bucket.name === bucketName,
        );

        if (!bucketExists) {
          const { error: createBucketError } =
            await supabase.storage.createBucket(bucketName, {
              public: true,
            });
          if (createBucketError) {
            console.error("Erro ao criar bucket:", createBucketError);
          }
        }

        // Array para armazenar URLs públicas das imagens
        const imageUrls = [];

        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${productId}_${i}.${fileExt}`;
          const filePath = `${imagePath}/${productId}/${fileName}`;

          // Verificar se o diretório existe
          try {
            // Tentar fazer upload diretamente
            const { data: uploadData, error: uploadError } =
              await supabase.storage.from(bucketName).upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
              });

            if (uploadError) {
              console.error("Erro ao fazer upload da imagem:", uploadError);
              continue;
            }

            // Obter URL pública da imagem
            const { data: publicUrlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(filePath);

            const publicUrl = publicUrlData?.publicUrl;
            imageUrls.push(publicUrl);

            // Salvar referência da imagem no banco de dados
            try {
              const { error: imageRefError } = await supabase
                .from("product_images")
                .insert([
                  {
                    product_id: productId,
                    image_path: filePath,
                    public_url: publicUrl,
                    display_order: i,
                  },
                ]);

              if (imageRefError) {
                console.error(
                  "Erro ao salvar referência da imagem:",
                  imageRefError,
                );
              }
            } catch (imgErr) {
              console.error("Erro ao processar referência da imagem:", imgErr);
            }
          } catch (err) {
            console.error("Erro ao processar upload:", err);
          }
        }

        // Atualizar o produto com as URLs das imagens
        if (imageUrls.length > 0) {
          const { error: updateError } = await supabase
            .from("products")
            .update({ images: imageUrls })
            .eq("id", productId);

          if (updateError) {
            console.error(
              "Erro ao atualizar produto com URLs de imagens:",
              updateError,
            );
          }
        }
      }

      form.reset();
      setImages([]);
      setImageUrls([]);
      setSubmitSuccess(true);

      setTimeout(() => {
        navigate("/products");
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);
      setSubmitError(
        `Ocorreu um erro ao cadastrar o produto: ${error.message || "Tente novamente"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-background">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          className="mr-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Home
        </Button>
        <h1 className="text-2xl font-bold">Cadastro de Produto</h1>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Cadastro de Produto</CardTitle>
          <CardDescription>
            Preencha os dados do produto e faça upload das imagens (até 6
            imagens).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="alimento">Alimento</SelectItem>
                          <SelectItem value="bebida">Bebida</SelectItem>
                          <SelectItem value="cosmético">Cosmético</SelectItem>
                          <SelectItem value="artesanato">Artesanato</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabricante*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do fabricante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização*</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade/Estado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fair"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feira</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome da feira (opcional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selos</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Selos separados por vírgula (ex: Orgânico, Vegano)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Separe os selos por vírgula
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredientes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Liste os ingredientes (opcional)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva as variações disponíveis (opcional)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações adicionais (opcional)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="images">Imagens do Produto (até 6)</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("images")?.click()}
                      disabled={images.length >= 6}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Imagens
                    </Button>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={images.length >= 6}
                    />
                    <p className="text-sm text-gray-500">
                      {images.length} de 6 imagens selecionadas
                    </p>
                  </div>
                </div>

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <AspectRatio ratio={4 / 3} className="bg-muted">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="rounded-md object-cover w-full h-full"
                          />
                        </AspectRatio>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {imageUrls.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-12 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 text-sm text-gray-500">
                      Nenhuma imagem selecionada
                    </div>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  Produto cadastrado com sucesso! Redirecionando...
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/products")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Produto"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
