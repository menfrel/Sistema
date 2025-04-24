-- Inserir produtos de exemplo
INSERT INTO products (id, title, type, ingredients, manufacturer, location, seals, variations, observations)
VALUES 
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Café Orgânico Premium', 'alimento', 'Grãos de café 100% arábica, cultivados sem agrotóxicos.', 'Fazenda Boa Vista', 'Serra do Caparaó, MG', ARRAY['Orgânico', 'Comércio Justo'], 'Moagem fina, média e grossa', 'Produto premiado na categoria café especial em 2022.'),
  ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'Mel Silvestre Natural', 'alimento', 'Mel puro de abelhas silvestres.', 'Apiário Flor do Campo', 'Vale do Ribeira, SP', ARRAY['Orgânico'], 'Pote 250g, 500g e 1kg', 'Mel coletado em área de preservação ambiental.'),
  ('d290f1ee-6c54-4b01-90e6-d701748f0853', 'Sabonete de Lavanda Artesanal', 'cosmético', 'Óleo de coco, óleo de oliva, manteiga de karité, óleo essencial de lavanda.', 'Ervas e Essências', 'Gramado, RS', ARRAY['Vegano', 'Cruelty-free'], 'Barra 90g e 120g', 'Produzido artesanalmente em pequenos lotes.'),
  ('d290f1ee-6c54-4b01-90e6-d701748f0854', 'Queijo Artesanal da Serra', 'alimento', 'Leite de vaca, sal, coalho e fermento lácteo.', 'Laticínios Serra Azul', 'São Roque de Minas, MG', ARRAY['Artesanal', 'Origem Controlada'], 'Peça 500g e 1kg', 'Produzido seguindo receita tradicional de mais de 100 anos.'),
  ('d290f1ee-6c54-4b01-90e6-d701748f0855', 'Vinho Tinto Reserva', 'bebida', 'Uvas Cabernet Sauvignon e Merlot.', 'Vinícola Vale dos Vinhedos', 'Bento Gonçalves, RS', ARRAY['Orgânico', 'Biodinâmico'], 'Garrafa 750ml', 'Envelhecido em barris de carvalho francês por 18 meses.');

-- Inserir referências de imagens para os produtos
INSERT INTO product_images (product_id, image_path, display_order)
VALUES
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'products/d290f1ee-6c54-4b01-90e6-d701748f0851/cafe1.jpg', 0),
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'products/d290f1ee-6c54-4b01-90e6-d701748f0851/cafe2.jpg', 1),
  ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'products/d290f1ee-6c54-4b01-90e6-d701748f0852/mel1.jpg', 0),
  ('d290f1ee-6c54-4b01-90e6-d701748f0853', 'products/d290f1ee-6c54-4b01-90e6-d701748f0853/sabonete1.jpg', 0),
  ('d290f1ee-6c54-4b01-90e6-d701748f0853', 'products/d290f1ee-6c54-4b01-90e6-d701748f0853/sabonete2.jpg', 1),
  ('d290f1ee-6c54-4b01-90e6-d701748f0854', 'products/d290f1ee-6c54-4b01-90e6-d701748f0854/queijo1.jpg', 0),
  ('d290f1ee-6c54-4b01-90e6-d701748f0855', 'products/d290f1ee-6c54-4b01-90e6-d701748f0855/vinho1.jpg', 0);