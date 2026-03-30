
-- Deactivate old stores
UPDATE stores SET active = false;

-- Insert 7 new stores
INSERT INTO stores (name, active) VALUES
  ('Loja Lareira', true),
  ('Loja Alenquer', true),
  ('Loja Arruda dos Vinhos', true),
  ('Loja Benavente', true),
  ('Loja Carregado Centro', true),
  ('Loja Castanheira', true),
  ('Loja Cartaxo', true);
