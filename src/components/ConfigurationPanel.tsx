import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  Edit,
  Plus,
  Save,
  ArrowLeft,
  Database,
  FolderOpen,
} from "lucide-react";

interface Field {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface DatabaseConfig {
  tableName: string;
  schema: string;
  connectionString: string;
}

interface StorageConfig {
  bucketName: string;
  imagePath: string;
  maxFileSize: number;
  allowedTypes: string[];
}

const ConfigurationPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("fields");
  const [activeFieldsTab, setActiveFieldsTab] = useState("add");

  // Configurações de campos
  const [fields, setFields] = useState<Field[]>([
    { id: "1", name: "title", label: "Título", type: "text", required: true },
    { id: "2", name: "type", label: "Tipo", type: "select", required: true },
    {
      id: "3",
      name: "ingredients",
      label: "Ingredientes",
      type: "textarea",
      required: false,
    },
    {
      id: "4",
      name: "manufacturer",
      label: "Fabricante",
      type: "text",
      required: false,
    },
    {
      id: "5",
      name: "location",
      label: "Local",
      type: "text",
      required: false,
    },
  ]);

  // Add Field State
  const [newField, setNewField] = useState<Omit<Field, "id">>({
    name: "",
    label: "",
    type: "text",
    required: false,
  });

  // Edit Field State
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [editedField, setEditedField] = useState<Omit<Field, "id">>({
    name: "",
    label: "",
    type: "text",
    required: false,
  });

  // Remove Field State
  const [fieldToRemove, setFieldToRemove] = useState<Field | null>(null);

  // Configurações do banco de dados
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    tableName: "products",
    schema: "public",
    connectionString: "https://xyzcompany.supabase.co",
  });

  // Configurações de armazenamento
  const [storageConfig, setStorageConfig] = useState<StorageConfig>({
    bucketName: "produtos",
    imagePath: "uploads/products",
    maxFileSize: 5,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  const handleAddField = () => {
    if (newField.name && newField.label) {
      const id = Date.now().toString();
      setFields([...fields, { id, ...newField }]);
      setNewField({ name: "", label: "", type: "text", required: false });
      // Em uma aplicação real, isso também atualizaria o esquema do banco de dados
    }
  };

  const handleEditField = () => {
    if (selectedField && editedField.name && editedField.label) {
      setFields(
        fields.map((field) =>
          field.id === selectedField.id ? { ...field, ...editedField } : field,
        ),
      );
      setSelectedField(null);
      // Em uma aplicação real, isso também atualizaria o esquema do banco de dados
    }
  };

  const handleRemoveField = () => {
    if (fieldToRemove) {
      setFields(fields.filter((field) => field.id !== fieldToRemove.id));
      setFieldToRemove(null);
      // Em uma aplicação real, isso também atualizaria o esquema do banco de dados
    }
  };

  const selectFieldForEdit = (field: Field) => {
    setSelectedField(field);
    setEditedField({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
    });
  };

  const handleDbConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDbConfig({ ...dbConfig, [name]: value });
  };

  const handleStorageConfigChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "allowedTypes") {
      setStorageConfig({
        ...storageConfig,
        allowedTypes: value.split(",").map((type) => type.trim()),
      });
    } else if (name === "maxFileSize") {
      setStorageConfig({
        ...storageConfig,
        maxFileSize: Number(value),
      });
    } else {
      setStorageConfig({ ...storageConfig, [name]: value });
    }
  };

  const saveDbConfig = () => {
    // Em uma aplicação real, isso salvaria as configurações no backend
    alert("Configurações do banco de dados salvas com sucesso!");
  };

  const saveStorageConfig = () => {
    // Em uma aplicação real, isso salvaria as configurações no backend
    alert("Configurações de armazenamento salvas com sucesso!");
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
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fields">
            <Edit className="h-4 w-4 mr-2" />
            Campos Personalizados
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Banco de Dados
          </TabsTrigger>
          <TabsTrigger value="storage">
            <FolderOpen className="h-4 w-4 mr-2" />
            Armazenamento
          </TabsTrigger>
        </TabsList>

        {/* Aba de Campos Personalizados */}
        <TabsContent value="fields">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Campos</CardTitle>
              <CardDescription>
                Adicione, edite ou remova campos personalizados que afetam o
                formulário de cadastro e o banco de dados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeFieldsTab} onValueChange={setActiveFieldsTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="add">Adicionar Campo</TabsTrigger>
                  <TabsTrigger value="edit">Editar Campo</TabsTrigger>
                  <TabsTrigger value="remove">Remover Campo</TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fieldName">Nome do Campo</Label>
                      <Input
                        id="fieldName"
                        placeholder="Ex: product_code"
                        value={newField.name}
                        onChange={(e) =>
                          setNewField({ ...newField, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fieldLabel">Rótulo do Campo</Label>
                      <Input
                        id="fieldLabel"
                        placeholder="Ex: Código do Produto"
                        value={newField.label}
                        onChange={(e) =>
                          setNewField({ ...newField, label: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fieldType">Tipo do Campo</Label>
                      <Select
                        value={newField.type}
                        onValueChange={(value) =>
                          setNewField({ ...newField, type: value })
                        }
                      >
                        <SelectTrigger id="fieldType">
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="textarea">
                            Área de Texto
                          </SelectItem>
                          <SelectItem value="select">Seleção</SelectItem>
                          <SelectItem value="date">Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id="required"
                        checked={newField.required}
                        onCheckedChange={(checked) =>
                          setNewField({ ...newField, required: checked })
                        }
                      />
                      <Label htmlFor="required">Campo Obrigatório</Label>
                    </div>
                  </div>

                  <Button onClick={handleAddField} className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Campo
                  </Button>
                </TabsContent>

                <TabsContent value="edit" className="space-y-4 mt-4">
                  {selectedField ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editFieldName">Nome do Campo</Label>
                          <Input
                            id="editFieldName"
                            value={editedField.name}
                            onChange={(e) =>
                              setEditedField({
                                ...editedField,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editFieldLabel">
                            Rótulo do Campo
                          </Label>
                          <Input
                            id="editFieldLabel"
                            value={editedField.label}
                            onChange={(e) =>
                              setEditedField({
                                ...editedField,
                                label: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editFieldType">Tipo do Campo</Label>
                          <Select
                            value={editedField.type}
                            onValueChange={(value) =>
                              setEditedField({ ...editedField, type: value })
                            }
                          >
                            <SelectTrigger id="editFieldType">
                              <SelectValue placeholder="Selecione um tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="number">Número</SelectItem>
                              <SelectItem value="textarea">
                                Área de Texto
                              </SelectItem>
                              <SelectItem value="select">Seleção</SelectItem>
                              <SelectItem value="date">Data</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <Switch
                            id="editRequired"
                            checked={editedField.required}
                            onCheckedChange={(checked) =>
                              setEditedField({
                                ...editedField,
                                required: checked,
                              })
                            }
                          />
                          <Label htmlFor="editRequired">
                            Campo Obrigatório
                          </Label>
                        </div>
                      </div>

                      {editedField.type === "select" && (
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="editFieldOptions">
                            Opções de Seleção
                          </Label>
                          <Textarea
                            id="editFieldOptions"
                            placeholder="Digite as opções separadas por vírgula (ex: Opção 1, Opção 2, Opção 3)"
                            value={editedField.options?.join(", ") || ""}
                            onChange={(e) => {
                              const options = e.target.value
                                .split(",")
                                .map((option) => option.trim())
                                .filter((option) => option !== "");
                              setEditedField({ ...editedField, options });
                            }}
                            rows={3}
                          />
                          <p className="text-sm text-muted-foreground">
                            Para campos do tipo seleção, adicione as opções que
                            estarão disponíveis.
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button onClick={handleEditField} className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedField(null)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Rótulo</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Obrigatório</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field) => (
                          <TableRow key={field.id}>
                            <TableCell>{field.name}</TableCell>
                            <TableCell>{field.label}</TableCell>
                            <TableCell>{field.type}</TableCell>
                            <TableCell>
                              {field.required ? "Sim" : "Não"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => selectFieldForEdit(field)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="remove" className="space-y-4 mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Rótulo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Obrigatório</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell>{field.name}</TableCell>
                          <TableCell>{field.label}</TableCell>
                          <TableCell>{field.type}</TableCell>
                          <TableCell>
                            {field.required ? "Sim" : "Não"}
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remover Campo
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover o campo "
                                    {field.label}"? Esta ação não pode ser
                                    desfeita e removerá todos os dados
                                    associados a este campo.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setFieldToRemove(field);
                                      handleRemoveField();
                                    }}
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                As alterações nos campos afetam tanto a interface do formulário
                quanto o esquema do banco de dados.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Aba de Configurações do Banco de Dados */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Banco de Dados</CardTitle>
              <CardDescription>
                Configure as conexões e estruturas do banco de dados Supabase
                para o sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tableName">Nome da Tabela</Label>
                    <Input
                      id="tableName"
                      name="tableName"
                      value={dbConfig.tableName}
                      onChange={handleDbConfigChange}
                      placeholder="products"
                    />
                    <p className="text-sm text-muted-foreground">
                      Nome da tabela principal no Supabase onde os produtos
                      serão armazenados.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schema">Esquema</Label>
                    <Input
                      id="schema"
                      name="schema"
                      value={dbConfig.schema}
                      onChange={handleDbConfigChange}
                      placeholder="public"
                    />
                    <p className="text-sm text-muted-foreground">
                      Esquema do banco de dados onde a tabela está localizada.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="connectionString">URL do Supabase</Label>
                    <Input
                      id="connectionString"
                      name="connectionString"
                      value={dbConfig.connectionString}
                      onChange={handleDbConfigChange}
                      placeholder="https://xyzcompany.supabase.co"
                    />
                    <p className="text-sm text-muted-foreground">
                      URL do projeto Supabase para conexão com o banco de dados.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button onClick={saveDbConfig} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações do Banco de Dados
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">
                  Estrutura do Banco de Dados
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A estrutura abaixo representa o esquema atual da tabela de
                  produtos no Supabase. As alterações nos campos personalizados
                  serão refletidas aqui.
                </p>

                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">
                    {`CREATE TABLE ${dbConfig.schema}.${dbConfig.tableName} (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
${fields
  .map((field) => {
    let type = "TEXT";
    if (field.type === "number") type = "NUMERIC";
    if (field.type === "date") type = "DATE";
    return `  ${field.name} ${type}${field.required ? " NOT NULL" : ""},`;
  })
  .join("\n")}
  images JSONB DEFAULT '[]'::JSONB
);`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Configurações de Armazenamento */}
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Armazenamento</CardTitle>
              <CardDescription>
                Configure o armazenamento de imagens e arquivos no Supabase
                Storage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bucketName">Nome do Bucket</Label>
                    <Input
                      id="bucketName"
                      name="bucketName"
                      value={storageConfig.bucketName}
                      onChange={handleStorageConfigChange}
                      placeholder="product-images"
                    />
                    <p className="text-sm text-muted-foreground">
                      Nome do bucket no Supabase Storage para armazenar as
                      imagens.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imagePath">Caminho das Imagens</Label>
                    <Input
                      id="imagePath"
                      name="imagePath"
                      value={storageConfig.imagePath}
                      onChange={handleStorageConfigChange}
                      placeholder="uploads/products"
                    />
                    <p className="text-sm text-muted-foreground">
                      Caminho dentro do bucket onde as imagens serão
                      armazenadas.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Tamanho Máximo (MB)</Label>
                    <Input
                      id="maxFileSize"
                      name="maxFileSize"
                      type="number"
                      value={storageConfig.maxFileSize}
                      onChange={handleStorageConfigChange}
                      min="1"
                      max="10"
                    />
                    <p className="text-sm text-muted-foreground">
                      Tamanho máximo permitido para upload de imagens em
                      megabytes.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowedTypes">
                      Tipos de Arquivo Permitidos
                    </Label>
                    <Textarea
                      id="allowedTypes"
                      name="allowedTypes"
                      value={storageConfig.allowedTypes.join(", ")}
                      onChange={handleStorageConfigChange}
                      placeholder="image/jpeg, image/png, image/webp"
                      rows={2}
                    />
                    <p className="text-sm text-muted-foreground">
                      Lista de tipos MIME permitidos, separados por vírgula.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button onClick={saveStorageConfig} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações de Armazenamento
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Política de Acesso</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configuração atual da política de acesso para o bucket de
                  imagens no Supabase Storage.
                </p>

                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">
                    {`-- Política de acesso para leitura pública de imagens
CREATE POLICY "Imagens acessíveis publicamente" 
ON storage.objects FOR SELECT 
USING (bucket_id = '${storageConfig.bucketName}');

-- Política de acesso para upload apenas para usuários autenticados
CREATE POLICY "Upload apenas para usuários autenticados" 
ON storage.objects FOR INSERT 
USING (bucket_id = '${storageConfig.bucketName}' AND auth.role() = 'authenticated');

-- Política de acesso para exclusão apenas para o proprietário
CREATE POLICY "Exclusão apenas para o proprietário" 
ON storage.objects FOR DELETE 
USING (bucket_id = '${storageConfig.bucketName}' AND auth.uid() = owner);`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigurationPanel;
