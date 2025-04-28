import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { ArrowLeft, Eye, Pencil, Trash2, Search, Filter } from "lucide-react";

// Interface for product data
interface Product {
  id: string;
  title: string;
  type: string;
  manufacturer?: string;
  location?: string;
  created_at?: string;
  createdAt?: string; // For backward compatibility with mock data
  [key: string]: any; // For other fields
}

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch data from Supabase
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Format data to match expected structure
        const formattedData = data.map((product) => ({
          ...product,
          // Ensure createdAt is available for backward compatibility
          createdAt: product.created_at || new Date().toISOString(),
        }));
        setProducts(formattedData);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      setError(
        `Erro ao carregar produtos: ${err.message || "Tente novamente"}`,
      );
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtragem de produtos - busca em múltiplos campos
  const filteredProducts = products.filter((product) => {
    // Busca em múltiplos campos
    const matchesSearch =
      searchTerm === "" ||
      [
        product.title,
        product.type,
        product.manufacturer,
        product.location,
        product.id?.toString(),
      ].some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesType =
      typeFilter === "" || typeFilter === "todos"
        ? true
        : product.type?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      // Atualiza a lista local removendo o produto excluído
      setProducts(products.filter((product) => product.id !== id));
      setProductToDelete(null);
    } catch (err: any) {
      console.error("Erro ao excluir produto:", err);
      setError(`Erro ao excluir produto: ${err.message || "Tente novamente"}`);
    } finally {
      setLoading(false);
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
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Lista de Produtos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Cadastrados</CardTitle>
          <CardDescription>
            Visualize, filtre e gerencie todos os produtos do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por tipo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="alimento">Alimento</SelectItem>
                  <SelectItem value="bebida">Bebida</SelectItem>
                  <SelectItem value="cosmético">Cosmético</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => fetchProducts(true)}
              variant="outline"
              disabled={refreshing}
              className="whitespace-nowrap mr-2"
            >
              {refreshing ? "Atualizando..." : "Atualizar"}
            </Button>
            <Button
              onClick={() => navigate("/products/new")}
              className="whitespace-nowrap"
            >
              Novo Produto
            </Button>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <Button
                variant="link"
                className="ml-2 text-red-700 underline"
                onClick={() => fetchProducts()}
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : currentItems.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Fabricante
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Local
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell>{product.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.type}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.manufacturer}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.location}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(
                          product.created_at || product.createdAt || "",
                        ).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/products/${product.id}`)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/products/${product.id}?edit=true`)
                            }
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                title="Excluir"
                                onClick={() => setProductToDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o produto "
                                  {product.title}"? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground">
                Nenhum produto encontrado. Tente ajustar os filtros ou{" "}
                <Link to="/products/new" className="text-primary underline">
                  cadastre um novo produto
                </Link>
                .
              </p>
            </div>
          )}

          {filteredProducts.length > itemsPerPage && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductList;
