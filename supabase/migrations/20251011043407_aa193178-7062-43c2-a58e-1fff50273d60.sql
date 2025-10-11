-- Remove duplicate products, keeping only one of each
DELETE FROM products a USING products b
WHERE a.id > b.id AND a.name = b.name;

-- Also clean up any orphaned price_history and product_stores entries
DELETE FROM price_history 
WHERE product_id NOT IN (SELECT id FROM products);

DELETE FROM product_stores 
WHERE product_id NOT IN (SELECT id FROM products);