import supabase from "./supabase";
import { loadStorageConfig } from "./config";

// Interface para metadados de imagem
export interface ImageMetadata {
  id?: string;
  product_id: string;
  image_path: string;
  public_url: string;
  local_path?: string;
  display_order: number;
  created_at?: string;
}

// Função para salvar imagem localmente (usando localStorage como simulação)
export const saveImageLocally = async (
  file: File,
  productId: string,
  index: number,
): Promise<string> => {
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
};

// Função para fazer upload de imagem para o Supabase Storage
export const uploadImageToSupabase = async (
  file: File,
  productId: string,
  index: number,
  onProgress?: (progress: number) => void,
): Promise<{ publicUrl: string; filePath: string }> => {
  try {
    // Obter configurações de armazenamento
    const storageConfig = loadStorageConfig();
    let bucketName = storageConfig.bucketName || "products";
    let imagePath = storageConfig.imagePath || "uploads";

    // Verificar se o bucket existe
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

    // Preparar o caminho do arquivo
    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}_${index}.${fileExt}`;
    const filePath = `${imagePath}/${productId}/${fileName}`;

    if (onProgress) onProgress(30); // Progresso: iniciando upload

    // Upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Erro ao fazer upload da imagem:", uploadError);
      throw uploadError;
    }

    if (onProgress) onProgress(70); // Progresso: upload concluído

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Não foi possível obter a URL pública da imagem");
    }

    if (onProgress) onProgress(100); // Progresso: processo completo

    return {
      publicUrl: publicUrlData.publicUrl,
      filePath: filePath,
    };
  } catch (error) {
    console.error("Erro no upload da imagem:", error);
    throw error;
  }
};

// Função para salvar metadados da imagem no banco de dados
export const saveImageMetadata = async (
  metadata: ImageMetadata,
): Promise<void> => {
  try {
    const { error } = await supabase.from("product_images").insert([metadata]);

    if (error) {
      console.error("Erro ao salvar metadados da imagem:", error);
      throw error;
    }
  } catch (error) {
    console.error("Erro ao processar metadados da imagem:", error);
    throw error;
  }
};

// Função para recuperar imagens de um produto
export const getProductImages = async (
  productId: string,
): Promise<ImageMetadata[]> => {
  try {
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Erro ao buscar imagens do produto:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao processar busca de imagens:", error);
    return [];
  }
};

// Função para excluir uma imagem
export const deleteProductImage = async (
  imageId: string,
  filePath: string,
): Promise<void> => {
  try {
    // Excluir do banco de dados
    const { error: dbError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (dbError) {
      console.error("Erro ao excluir referência da imagem:", dbError);
    }

    // Excluir do storage
    const storageConfig = loadStorageConfig();
    const bucketName = storageConfig.bucketName || "products";

    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (storageError) {
      console.error("Erro ao excluir arquivo do storage:", storageError);
    }
  } catch (error) {
    console.error("Erro ao processar exclusão de imagem:", error);
    throw error;
  }
};
