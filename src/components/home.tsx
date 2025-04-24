import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, Database, Settings, ListPlus } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Sistema de Gerenciamento de Produtos
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Cadastre, consulte, edite e gerencie seus produtos com facilidade
          através desta interface intuitiva.
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Cadastro */}
          <Card className="flex flex-col h-full border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <ListPlus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Cadastro de Produtos</CardTitle>
              <CardDescription>
                Adicione novos produtos ao sistema com todos os detalhes e
                imagens.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                Preencha informações como título, tipo, ingredientes,
                fabricante, local, e faça upload de até 3 imagens para cada
                produto.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/products/new" className="w-full">
                <Button className="w-full">Acessar Cadastro</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Card de Consulta */}
          <Card className="flex flex-col h-full border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Clipboard className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Consulta de Produtos</CardTitle>
              <CardDescription>
                Visualize, filtre e gerencie todos os produtos cadastrados.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                Acesse a lista completa de produtos com opções de filtro,
                ordenação e busca. Visualize detalhes, edite ou remova produtos
                conforme necessário.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/products" className="w-full">
                <Button className="w-full">Acessar Consulta</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Card de Configurações */}
          <Card className="flex flex-col h-full border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Personalize o sistema de acordo com suas necessidades.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                Adicione, edite ou remova campos personalizados que afetam
                dinamicamente o formulário de cadastro e o banco de dados.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/configuration" className="w-full">
                <Button className="w-full">Acessar Configurações</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-lg bg-muted">
            <Database className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Todos os dados são armazenados de forma segura no Supabase
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
