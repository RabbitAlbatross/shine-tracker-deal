-- Add store prices for products that don't have any
INSERT INTO product_stores (product_id, store_name, price, store_url)
SELECT 
  p.id,
  stores.store_name,
  ROUND((p.current_price * stores.multiplier)::numeric, 2),
  'https://example.com/' || LOWER(REPLACE(stores.store_name, ' ', '-'))
FROM products p
CROSS JOIN (
  VALUES 
    ('Amazon', 0.98),
    ('Flipkart', 1.02),
    ('Myntra', 1.05)
) AS stores(store_name, multiplier)
WHERE NOT EXISTS (
  SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id
);