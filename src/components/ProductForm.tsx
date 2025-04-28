import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
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
import { loadStorageConfig } from "@/lib/config";

const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  type: z.string().min(1, { message: "Informe o tipo de produto" }),
  ingredients: z.string().optional(),
  manufacturer: z.string().min(1, { message: "Informe o fabricante" }),
  location: z.string().min(1, { message: "Informe a localização" }),
  fair: z.string().optional(),
  seals: z.string().optional(),
  variations: z.string().optional(),
  observations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Função para salvar imagem localmente (simulação)
const saveImageLocally = async (
    file: File,
    productId: string,
    index: number,
) => {
    try {
        // Em um ambiente real, aqui você usaria APIs como FileSystem em Node.js
        // ou IndexedDB no navegador para salvar localmente
        // Como estamos em um ambiente de navegador sem acesso ao sistema de arquivos,
        // vamos simular o salvamento local usando localStorage

        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const base64Data = reader.result as string;
                    // Salvar referência da imagem no localStorage
                    const localImages = JSON.parse(
                        localStorage.getItem("localImages") || "{}",
                    );
                    if (!localImages[productId]) {
                        localImages[productId] = [];
                    }

                    // Armazenar apenas o nome e referência, não o base64 completo para não sobrecarregar
                    const imageRef = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        timestamp: new Date().toISOString(),
                        path: `local_storage/${productId}/${index}_${file.name}`,
                    };

                    localImages[productId].push(imageRef);
                    localStorage.setItem("localImages", JSON.stringify(localImages));

                    // Em um caso real, retornaríamos o caminho do arquivo local
                    resolve(`local_storage/${productId}/${index}_${file.name}`);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error("Erro ao salvar imagem localmente:", error);
        throw error;
    }
};

const ProductForm = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{[key: number]: number;  }>({});

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

      // Remover progresso de upload se existir
      setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[index];
          return newProgress;
      });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    setUploadProgress({});

    try {
      const sealsArray = data.seals
        ? data.seals.split(",").map((seal) => seal.trim())
        : [];

      let { data: productData, error: productError } = await supabase
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

      const productId = productData[0].id;

      // Get storage config
      const storageConfig = loadStorageConfig();
      let bucketName = storageConfig.bucketName || "products";
      let imagePath = storageConfig.imagePath || "uploads";

        // Verificar se o bucket existe e criar se não existir
        try {
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
            // Tentar criar com outro nome se falhar
            bucketName = "product-images";
            await supabase.storage.createBucket(bucketName, { public: true });
        }
            }
        } catch (bucketError) {
            console.error("Erro ao verificar/criar bucket:", bucketError);
            // Usar um bucket padrão se falhar
            bucketName = "product-images";
      }

        const imageUrls: string[] = [];
        const localImagePaths: string[] = [];

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split(".").pop();
          const fileName = `${productId}_${i}.${fileExt}`;
          const filePath = `${imagePath}/${productId}/${fileName}`;

          setUploadProgress((prev) => ({
              ...prev,
              [i]: 10, // Iniciando upload
          }));

          try {
              // 1. Salvar localmente (redundância)
              const localPath = await saveImageLocally(file, productId, i);
              localImagePaths.push(localPath);

              setUploadProgress((prev) => ({
                  ...prev,
                  [i]: 40, // Salvo localmente
              }));

              // 2. Upload para o Supabase Storage
              const { error: uploadError, data: uploadData } =
                  await supabase.storage.from(bucketName).upload(filePath, file, {
                      cacheControl: "3600",
                      upsert: true,
                  });

              setUploadProgress((prev) => ({
                  ...prev,
                  [i]: 70, // Upload concluído
              }));

        if (uploadError) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData?.publicUrl;
              if (publicUrl) {
        imageUrls.push(publicUrl);

        // 4. Salvar referência da imagem no banco
            await supabase.from("product_images").insert([
              {
                    product_id: productId,
                    image_path: filePath,
                    public_url: publicUrl,
                    local_path: localPath,
                    display_order: i,
              },
            ]);

              }

              setUploadProgress((prev) => ({
                  ...prev,
                  [i]: 100, // Processo completo
              }));
          } catch (imgError) {
              console.error(`Erro ao processar imagem ${i}:`, imgError);
        }
      }

        // Atualizar produto com URLs das imagens
      if (imageUrls.length > 0) {
          await supabase
          .from("products")
          .update({
            images: imageUrls,
            local_images: localImagePaths,
          })
          .eq("id", productId);
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
                      <FormControl>
                        <Input
                          placeholder="Ex: alimento, bebida, cosmético"
                          {...field}
                        />
                      </FormControl>
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
                            {uploadProgress[index] !== undefined &&
                                uploadProgress[index] < 100 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                                        Progresso: {uploadProgress[index]}%
                                    </div>
                                )}
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
