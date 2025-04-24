-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  ingredients TEXT,
  manufacturer TEXT NOT NULL,
  location TEXT NOT NULL,
  fair TEXT,
  seals TEXT[],
  variations TEXT,
  export_options BOOLEAN DEFAULT FALSE,
  observations TEXT
);

-- Criar tabela para imagens de produtos
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  display_order INTEGER NOT NULL
);

-- Habilitar realtime para as tabelas
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table product_images;

-- Criar políticas de acesso para produtos
DROP POLICY IF EXISTS "Acesso público aos produtos" ON products;
CREATE POLICY "Acesso público aos produtos"
ON products FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Inserção de produtos" ON products;
CREATE POLICY "Inserção de produtos"
ON products FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Atualização de produtos" ON products;
CREATE POLICY "Atualização de produtos"
ON products FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Exclusão de produtos" ON products;
CREATE POLICY "Exclusão de produtos"
ON products FOR DELETE
USING (true);

-- Criar políticas de acesso para imagens de produtos
DROP POLICY IF EXISTS "Acesso público às imagens" ON product_images;
CREATE POLICY "Acesso público às imagens"
ON product_images FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Inserção de imagens" ON product_images;
CREATE POLICY "Inserção de imagens"
ON product_images FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Atualização de imagens" ON product_images;
CREATE POLICY "Atualização de imagens"
ON product_images FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Exclusão de imagens" ON product_images;
CREATE POLICY "Exclusão de imagens"
ON product_images FOR DELETE
USING (true);