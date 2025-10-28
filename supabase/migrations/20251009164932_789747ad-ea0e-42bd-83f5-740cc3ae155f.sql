-- Add store information to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_name TEXT DEFAULT 'Amazon';

-- Create product_stores table for multi-store price tracking
CREATE TABLE IF NOT EXISTS product_stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  store_url TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, store_name)
);

-- Enable RLS on product_stores
ALTER TABLE product_stores ENABLE ROW LEVEL SECURITY;

-- Create policy for reading product stores (public)
CREATE POLICY "Anyone can view product stores"
ON product_stores FOR SELECT
USING (true);

-- Product analysis table removed (no AI features)

-- Insert price history for products that don't have any
INSERT INTO price_history (product_id, price, recorded_at)
SELECT 
  p.id,
  p.current_price + (random() * 2000 - 1000),
  now() - (generate_series(1, 30) || ' days')::interval
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM price_history ph WHERE ph.product_id = p.id
)
GROUP BY p.id, p.current_price;

-- Insert multi-store prices for each product
INSERT INTO product_stores (product_id, store_name, price, store_url)
SELECT 
  id,
  'Amazon',
  current_price,
  source_url
FROM products
ON CONFLICT (product_id, store_name) DO UPDATE 
SET price = EXCLUDED.price, store_url = EXCLUDED.store_url, last_updated = now();

INSERT INTO product_stores (product_id, store_name, price, store_url)
SELECT 
  id,
  'Flipkart',
  current_price * (0.95 + random() * 0.1),
  'https://flipkart.com/product/' || id
FROM products
ON CONFLICT (product_id, store_name) DO NOTHING;

INSERT INTO product_stores (product_id, store_name, price, store_url)
SELECT 
  id,
  'Myntra',
  current_price * (0.93 + random() * 0.14),
  'https://myntra.com/product/' || id
FROM products
WHERE category IN ('Clothing', 'Shoes')
ON CONFLICT (product_id, store_name) DO NOTHING;