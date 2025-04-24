import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Factory,
  Calendar,
  Tag,
  Truck,
  FileText,
  Save,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockProducts = [
  {
    id: "1",
    title: "Café Orgânico",
    type: "Alimento",
    ingredients: "Grãos de café 100% arábica, cultivados sem agrotóxicos.",
    manufacturer: "Fazenda Boa Vista",
    location: "Serra do Caparaó, MG",
    fair: "Feira do Produtor Rural",
    seals: ["Orgânico", "Comércio Justo"],
    variations: "Moagem fina, média e grossa",
    exportOptions: true,
    observations: "Produto premiado na categoria café especial em 2022.",
    createdAt: "2023-05-15",
    images: [
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    ],
  },
  {
    id: "2",
    title: "Mel Silvestre",
    type: "Alimento",
    ingredients: "Mel puro de abelhas silvestres.",
    manufacturer: "Apiário Flor do Campo",
    location: "Vale do Ribeira, SP",
    fair: "Feira de Orgânicos",
    seals: ["Orgânico"],
    variations: "Pote 250g, 500g e 1kg",
    exportOptions: false,
    observations: "Mel coletado em área de preservação ambiental.",
    createdAt: "2023-06-22",
    images: [
      "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=800&q=80",
    ],
  },
  {
    id: "3",
    title: "Sabonete de Lavanda",
    type: "Cosmético",
    ingredients:
      "Óleo de coco, óleo de oliva, manteiga de karité, óleo essencial de lavanda.",
    manufacturer: "Ervas e Essências",
    location: "Gramado, RS",
    fair: "Feira de Artesanato",
    seals: ["Vegano", "Cruelty-free"],
    variations: "Barra 90g e 120g",
    exportOptions: false,
    observations: "Produzido artesanalmente em pequenos lotes.",
    createdAt: "2023-04-10",
    images: [
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&q=80",
      "https://images.unsplash.com/photo-1600857544398-d1e0b16d27e8?w=800&q=80",
      "https://images.unsplash.com/photo-1600857544352-25c03a07f1ad?w=800&q=80",
    ],
  },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    const searchParams = new URLSearchParams(window.location.search);
    const shouldEdit = searchParams.get("edit") === "true";

    setTimeout(() => {
      const foundProduct = mockProducts.find((p) => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setEditedProduct(foundProduct);
        if (shouldEdit) {
          setIsEditing(true);
        }
      } else {
        setError("Produto não encontrado");
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleDelete = () => {
    navigate("/products");
  };

  const handleSaveChanges = async () => {
    if (!editedProduct) return;

    setIsSaving(true);

    try {
      const productToUpdate = {
        title: editedProduct.title,
        type: editedProduct.type,
        ingredients: editedProduct.ingredients,
        manufacturer: editedProduct.manufacturer,
        location: editedProduct.location,
        // fair: editedProduct.fair, // Removido pois a coluna não existe no banco
        variations: editedProduct.variations,
        observations: editedProduct.observations,
      };

      if (typeof editedProduct.seals === "string") {
        productToUpdate.seals = editedProduct.seals
          .split(",")
          .map((seal) => seal.trim());
      } else {
        productToUpdate.seals = editedProduct.seals;
      }

      const { error } = await supabase
        .from("products")
        .update(productToUpdate)
        .eq("id", editedProduct.id);

      if (error) throw error;

      setProduct({ ...editedProduct, seals: productToUpdate.seals });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Erro ao atualizar produto:", error);
      alert(`Erro ao atualizar produto: ${error.message || "Tente novamente"}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <p>Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a lista
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-destructive">
                {error || "Produto não encontrado"}
              </p>
              <Button onClick={() => navigate("/")} className="mt-4 mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Home
              </Button>
              <Button onClick={() => navigate("/products")} className="mt-4">
                Voltar para a lista de produtos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Produto</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o produto "{product.title}"?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Imagens</CardTitle>
          </CardHeader>
          <CardContent>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                {product.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="rounded-md overflow-hidden border"
                  >
                    <img
                      src={image}
                      alt={`${product.title} - Imagem ${index + 1}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">Sem imagens disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{product.title}</CardTitle>
                <CardDescription className="mt-2">
                  <Badge variant="outline" className="mr-2">
                    {product.type}
                  </Badge>
                  {product.seals &&
                    product.seals.map((seal: string) => (
                      <Badge key={seal} className="mr-2">
                        {seal}
                      </Badge>
                    ))}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  ID: {product.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cadastrado em:{" "}
                  {new Date(product.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Informações Básicas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={editedProduct?.title || ""}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={editedProduct?.type || ""}
                        onValueChange={(value) =>
                          setEditedProduct({ ...editedProduct, type: value })
                        }
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alimento">Alimento</SelectItem>
                          <SelectItem value="bebida">Bebida</SelectItem>
                          <SelectItem value="cosmético">Cosmético</SelectItem>
                          <SelectItem value="artesanato">Artesanato</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="ingredients">Ingredientes</Label>
                    <Textarea
                      id="ingredients"
                      value={editedProduct?.ingredients || ""}
                      onChange={(e) =>
                        setEditedProduct({
                          ...editedProduct,
                          ingredients: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Informações de Origem
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Fabricante</Label>
                      <Input
                        id="manufacturer"
                        value={editedProduct?.manufacturer || ""}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct,
                            manufacturer: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Local</Label>
                      <Input
                        id="location"
                        value={editedProduct?.location || ""}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fair">Feira</Label>
                      <Input
                        id="fair"
                        value={editedProduct?.fair || ""}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct,
                            fair: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Informações Adicionais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="variations">Variações</Label>
                      <Input
                        id="variations"
                        value={editedProduct?.variations || ""}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct,
                            variations: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seals">Selos</Label>
                      <Input
                        id="seals"
                        value={editedProduct?.seals?.join(", ") || ""}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct,
                            seals: e.target.value
                              .split(",")
                              .map((s) => s.trim()),
                          })
                        }
                        placeholder="Separados por vírgula"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                      id="observations"
                      value={editedProduct?.observations || ""}
                      onChange={(e) =>
                        setEditedProduct({
                          ...editedProduct,
                          observations: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Informações Básicas
                  </h3>
                  {product.ingredients && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Ingredientes
                      </h4>
                      <p>{product.ingredients}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Informações de Origem
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {product.manufacturer && (
                      <div className="flex items-start">
                        <Factory className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Fabricante
                          </h4>
                          <p>{product.manufacturer}</p>
                        </div>
                      </div>
                    )}

                    {product.location && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Local
                          </h4>
                          <p>{product.location}</p>
                        </div>
                      </div>
                    )}

                    {product.fair && (
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Feira
                          </h4>
                          <p>{product.fair}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Informações Adicionais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {product.variations && (
                      <div className="flex items-start">
                        <Tag className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Variações
                          </h4>
                          <p>{product.variations}</p>
                        </div>
                      </div>
                    )}

                    {product.exportOptions !== undefined && (
                      <div className="flex items-start">
                        <Truck className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Disponível para exportação
                          </h4>
                          <p>{product.exportOptions ? "Sim" : "Não"}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {product.observations && (
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Observações
                        </h4>
                        <p>{product.observations}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="border-t pt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/products")}
              className="mr-2"
            >
              Voltar para a lista
            </Button>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Editar Produto</Button>
            ) : (
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;
