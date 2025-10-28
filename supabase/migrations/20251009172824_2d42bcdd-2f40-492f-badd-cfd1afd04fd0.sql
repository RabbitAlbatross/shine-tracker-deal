-- Removed product_analysis policies (AI features removed)

-- Fix product prices - reset to reasonable INR values
UPDATE products SET current_price = 13279 WHERE name = 'Nike Air Max 270' AND current_price > 100000;
UPDATE products SET current_price = 15771 WHERE name = 'Adidas Ultraboost 22' AND current_price > 100000;
UPDATE products SET current_price = 5810 WHERE name = 'Levi''s 501 Original Jeans' AND current_price > 100000;
UPDATE products SET current_price = 165799 WHERE name = 'Apple MacBook Pro 14"' AND current_price > 1000000;
UPDATE products SET current_price = 24149 WHERE name = 'Sony WH-1000XM5 Headphones' AND current_price > 100000;
UPDATE products SET current_price = 207499 WHERE name = 'Canon EOS R6' AND current_price > 1000000;
UPDATE products SET current_price = 74399 WHERE name = 'Samsung 55" QLED TV' AND current_price > 100000;
UPDATE products SET current_price = 53899 WHERE name = 'Dyson V15 Vacuum' AND current_price > 100000;
UPDATE products SET current_price = 7469 WHERE name = 'Instant Pot Duo 7-in-1' AND current_price > 100000;
UPDATE products SET current_price = 31549 WHERE name = 'KitchenAid Stand Mixer' AND current_price > 100000;

-- Delete products with incorrect low prices (duplicates)
DELETE FROM products WHERE current_price < 1000;

-- Add more realistic products
INSERT INTO products (name, description, category, current_price, image_url, source_url, currency) VALUES
('Samsung Galaxy S24 Ultra', '256GB, Titanium Black, Latest flagship smartphone', 'Electronics', 124999, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop', 'https://www.samsung.com', 'INR'),
('Apple AirPods Pro 2', 'Active Noise Cancellation, USB-C charging', 'Electronics', 24900, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500&h=500&fit=crop', 'https://www.apple.com', 'INR'),
('PlayStation 5', 'Gaming console with 1TB storage', 'Electronics', 54990, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=500&fit=crop', 'https://www.playstation.com', 'INR'),
('Fitbit Charge 6', 'Fitness tracker with heart rate monitoring', 'Electronics', 13999, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop', 'https://www.fitbit.com', 'INR'),
('Zara Denim Jacket', 'Classic blue denim jacket, unisex style', 'Fashion', 3999, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop', 'https://www.zara.com', 'INR'),
('Ray-Ban Aviator Sunglasses', 'Classic gold frame with polarized lenses', 'Fashion', 8499, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop', 'https://www.ray-ban.com', 'INR'),
('The North Face Backpack', '30L capacity, laptop compartment', 'Fashion', 7999, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop', 'https://www.thenorthface.com', 'INR'),
('Ninja Air Fryer', '5.5L capacity, digital controls', 'Home & Kitchen', 8999, 'https://images.unsplash.com/photo-1585515319810-4e8f23e0a75e?w=500&h=500&fit=crop', 'https://www.ninjakitchen.com', 'INR'),
('Philips Air Purifier', 'HEPA filter, removes 99.97% pollutants', 'Home & Kitchen', 12999, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop', 'https://www.philips.co.in', 'INR'),
('Xiaomi Robot Vacuum', 'Automatic cleaning with app control', 'Home & Kitchen', 24999, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&h=500&fit=crop', 'https://www.mi.com', 'INR');

-- Insert multi-store prices for new products
INSERT INTO product_stores (product_id, store_name, price, store_url)
SELECT 
  id,
  'Amazon',
  current_price,
  source_url
FROM products
WHERE created_at > now() - interval '1 minute'
ON CONFLICT (product_id, store_name) DO NOTHING;

INSERT INTO product_stores (product_id, store_name, price, store_url)
SELECT 
  id,
  'Flipkart',
  current_price * (0.95 + random() * 0.1),
  'https://flipkart.com/product/' || id
FROM products
WHERE created_at > now() - interval '1 minute'
ON CONFLICT (product_id, store_name) DO NOTHING;

INSERT INTO product_stores (product_id, store_name, price, store_url)
SELECT 
  id,
  'Myntra',
  current_price * (0.93 + random() * 0.14),
  'https://myntra.com/product/' || id
FROM products
WHERE created_at > now() - interval '1 minute' AND category IN ('Fashion')
ON CONFLICT (product_id, store_name) DO NOTHING;

-- Add price history for new products
INSERT INTO price_history (product_id, price, recorded_at)
SELECT 
  p.id,
  p.current_price + (random() * 2000 - 1000),
  now() - (generate_series(1, 30) || ' days')::interval
FROM products p
WHERE p.created_at > now() - interval '1 minute'
GROUP BY p.id, p.current_price;