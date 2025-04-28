// Arquivo para gerenciar configurações do sistema

// Tipos para as configurações
export interface DatabaseConfig {
  tableName: string;
  schema: string;
  connectionString: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  apiKey?: string;
  [key: string]: string | number | undefined;
}

export interface StorageConfig {
  bucketName: string;
  imagePath: string;
  maxFileSize: number;
  allowedTypes: string[];
}

// Valores padrão
const defaultDbConfig: DatabaseConfig = {
  tableName: "products",
  schema: "public",
  connectionString: "https://xyzcompany.supabase.co",
};

const defaultStorageConfig: StorageConfig = {
  bucketName: "products",
  imagePath: "uploads",
  maxFileSize: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
};

// Funções para carregar configurações
export const loadDbConfig = (): DatabaseConfig => {
  try {
    const savedConfig = localStorage.getItem("dbConfig");
    if (savedConfig) {
      return { ...defaultDbConfig, ...JSON.parse(savedConfig) };
    }
  } catch (err) {
    console.error("Erro ao carregar configurações do banco de dados:", err);
  }
  return defaultDbConfig;
};

export const loadStorageConfig = (): StorageConfig => {
  try {
    const savedConfig = localStorage.getItem("storageConfig");
    if (savedConfig) {
      return { ...defaultStorageConfig, ...JSON.parse(savedConfig) };
    }
  } catch (err) {
    console.error("Erro ao carregar configurações de armazenamento:", err);
  }
  return defaultStorageConfig;
};

// Funções para salvar configurações
export const saveDbConfig = (config: DatabaseConfig): void => {
  try {
    localStorage.setItem("dbConfig", JSON.stringify(config));
  } catch (err) {
    console.error("Erro ao salvar configurações do banco de dados:", err);
    throw err;
  }
};

export const saveStorageConfig = (config: StorageConfig): void => {
  try {
    localStorage.setItem("storageConfig", JSON.stringify(config));
  } catch (err) {
    console.error("Erro ao salvar configurações de armazenamento:", err);
    throw err;
  }
};
