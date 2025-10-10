-- Remove duplicate products with unrealistic pricing
DELETE FROM public.price_history WHERE product_id IN (
  '057921af-a07d-40e9-a6ee-2beec073e2c5', -- MacBook with 1797 INR
  '7140ac31-e93e-4bea-87f6-21670c745c96'  -- Canon EOS R6 with 2220 INR
);

DELETE FROM public.product_stores WHERE product_id IN (
  '057921af-a07d-40e9-a6ee-2beec073e2c5',
  '7140ac31-e93e-4bea-87f6-21670c745c96'
);

DELETE FROM public.products WHERE id IN (
  '057921af-a07d-40e9-a6ee-2beec073e2c5',
  '7140ac31-e93e-4bea-87f6-21670c745c96'
);

-- Update realistic pricing for existing products
UPDATE public.products SET current_price = 189999 WHERE id = 'af125f8f-8067-47b0-832b-91fe0697841a'; -- MacBook Pro 14"
UPDATE public.products SET current_price = 249999 WHERE id = 'ef201c2f-5fbc-421f-9c48-bc7b59a0e292'; -- Canon EOS R6
UPDATE public.products SET current_price = 24999 WHERE id = '58d5c180-9239-46d9-b44a-7dcf27d62eff'; -- AirPods Pro 2
UPDATE public.products SET current_price = 119999 WHERE id = '99bd4d20-e3be-4e35-af80-9b12e32a35ab'; -- Samsung S24 Ultra
UPDATE public.products SET current_price = 29999 WHERE id = '849ee286-0bf2-4a0f-a397-a81b8af4a1c2'; -- Sony Headphones
UPDATE public.products SET current_price = 54999 WHERE id = '89acd536-41da-4202-80f8-f1e7be8a85f2'; -- PlayStation 5
UPDATE public.products SET current_price = 74999 WHERE id = '2d4b4992-28a5-41bc-b2b2-84ed26bc0ff5'; -- Samsung QLED TV
UPDATE public.products SET current_price = 12999 WHERE id = '9d409326-44bf-4040-b761-71d44e18f962'; -- Fitbit Charge 6
UPDATE public.products SET current_price = 12999 WHERE id = '29118dfb-d706-4a8c-b5b0-8bdccdd207c3'; -- Adidas Ultraboost
UPDATE public.products SET current_price = 14999 WHERE id = '9fd8380a-07e0-40fb-800d-b0ddc94ba62f'; -- Nike Air Max
UPDATE public.products SET current_price = 3499 WHERE id = '43b45761-246f-4599-b0ae-31dcdba574b0'; -- Levi's 501
UPDATE public.products SET current_price = 12999 WHERE id = 'f85c54ac-efc5-480b-93b4-49b717f42c6d'; -- Ray-Ban Aviator
UPDATE public.products SET current_price = 4999 WHERE id = '6a4f7ebe-2cde-4d32-aa86-454dcd37fc54'; -- North Face Backpack
UPDATE public.products SET current_price = 2999 WHERE id = 'bd2c00bf-6441-4559-bb57-26e34ad33260'; -- Zara Jacket
UPDATE public.products SET current_price = 49999 WHERE id = '117df7be-8fe6-4769-97b5-6d966087b380'; -- Dyson Vacuum
UPDATE public.products SET current_price = 8999 WHERE id = '221a8599-5d55-45c9-918c-b39672841c92'; -- Instant Pot
UPDATE public.products SET current_price = 34999 WHERE id = '4b23c8ff-8076-47af-83cd-93837e55b684'; -- KitchenAid Mixer
UPDATE public.products SET current_price = 7999 WHERE id = '2197ee72-935c-441b-b8ae-473677704db7'; -- Ninja Air Fryer
UPDATE public.products SET current_price = 14999 WHERE id = '816d583f-5977-4cc7-9716-403dbad70db1'; -- Philips Air Purifier
UPDATE public.products SET current_price = 24999 WHERE id = 'e6c3fcba-7152-46da-b30e-7c3b5310df6b'; -- Xiaomi Robot Vacuum

-- Add diverse new products with realistic pricing
INSERT INTO public.products (name, description, category, current_price, currency, image_url, source_url) VALUES
('Dell XPS 15', 'Premium laptop with 12th Gen Intel processor, 16GB RAM, 512GB SSD, perfect for professionals', 'Electronics', 149999, 'INR', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45', 'https://example.com/dell-xps-15'),
('iPad Air M2', 'Latest Apple tablet with M2 chip, 10.9-inch Liquid Retina display, perfect for productivity', 'Electronics', 69999, 'INR', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0', 'https://example.com/ipad-air'),
('Bose QuietComfort 45', 'Premium noise-cancelling headphones with exceptional sound quality', 'Electronics', 27999, 'INR', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', 'https://example.com/bose-qc45'),
('GoPro Hero 12 Black', 'Action camera with 5.3K video, waterproof design, perfect for adventures', 'Electronics', 44999, 'INR', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03', 'https://example.com/gopro-hero12'),
('Asus ROG Gaming Laptop', 'High-performance gaming laptop with RTX 4060, 16GB RAM, 144Hz display', 'Electronics', 109999, 'INR', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302', 'https://example.com/asus-rog'),
('LG 43" 4K Smart TV', 'Affordable 4K UHD Smart TV with WebOS and built-in streaming apps', 'Electronics', 34999, 'INR', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1', 'https://example.com/lg-43-4k'),
('Kindle Paperwhite', 'Waterproof e-reader with 6.8-inch display and adjustable warm light', 'Electronics', 13999, 'INR', 'https://images.unsplash.com/photo-1592496001020-d31bd830651f', 'https://example.com/kindle'),
('Logitech MX Master 3S', 'Premium wireless mouse for productivity with ergonomic design', 'Electronics', 8999, 'INR', 'https://images.unsplash.com/photo-1527814050087-3793815479db', 'https://example.com/mx-master'),

('Puma RS-X Sneakers', 'Retro-inspired running shoes with bold colors and comfortable cushioning', 'Fashion', 7999, 'INR', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'https://example.com/puma-rsx'),
('H&M Oversized Hoodie', 'Comfortable cotton blend hoodie, perfect for casual wear', 'Fashion', 1999, 'INR', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7', 'https://example.com/hm-hoodie'),
('Tommy Hilfiger Polo Shirt', 'Classic fit polo with signature flag logo', 'Fashion', 3999, 'INR', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d', 'https://example.com/tommy-polo'),
('Fossil Gen 6 Smartwatch', 'Stylish smartwatch with Wear OS, fitness tracking, and notifications', 'Fashion', 21999, 'INR', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', 'https://example.com/fossil-gen6'),
('Titan Analog Watch', 'Classic analog watch with stainless steel strap, water resistant', 'Fashion', 5999, 'INR', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d', 'https://example.com/titan-watch'),
('Wildcraft Hiking Backpack', '60L trekking backpack with rain cover, perfect for outdoor adventures', 'Fashion', 5499, 'INR', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', 'https://example.com/wildcraft'),

('Prestige Induction Cooktop', 'Energy-efficient induction cooktop with preset menu options', 'Home & Kitchen', 3499, 'INR', 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d', 'https://example.com/prestige-induction'),
('Havells Water Purifier', 'RO+UV water purifier with 7L capacity, removes harmful contaminants', 'Home & Kitchen', 12999, 'INR', 'https://images.unsplash.com/photo-1583945860086-0e47e83f1dcf', 'https://example.com/havells-purifier'),
('Philips Smart LED Bulb', 'Wi-Fi enabled color changing bulb, works with Alexa and Google Home', 'Home & Kitchen', 1299, 'INR', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3', 'https://example.com/philips-led'),
('Pigeon Pressure Cooker', 'Durable 5L aluminum pressure cooker with outer lid', 'Home & Kitchen', 1499, 'INR', 'https://images.unsplash.com/photo-1584990347449-70e0c86aa42b', 'https://example.com/pigeon-cooker'),
('Croma Iron Box', 'Steam iron with non-stick soleplate and auto shut-off', 'Home & Kitchen', 1799, 'INR', 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078', 'https://example.com/croma-iron'),
('Milton Thermos Flask', '1L vacuum insulated flask, keeps beverages hot/cold for 24 hours', 'Home & Kitchen', 799, 'INR', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8', 'https://example.com/milton-flask'),
('Wipro Smart Plug', 'Wi-Fi smart plug with energy monitoring and voice control', 'Home & Kitchen', 999, 'INR', 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f', 'https://example.com/wipro-plug');

-- Update store prices for all products to match current_price with variations
UPDATE public.product_stores ps
SET price = p.current_price, last_updated = now()
FROM public.products p
WHERE ps.product_id = p.id AND ps.store_name = 'Amazon';

UPDATE public.product_stores ps
SET price = ROUND((p.current_price * (0.98 + (random() * 0.04)))::NUMERIC, 2), last_updated = now()
FROM public.products p
WHERE ps.product_id = p.id AND ps.store_name = 'Flipkart';

UPDATE public.product_stores ps
SET price = ROUND((p.current_price * (0.96 + (random() * 0.06)))::NUMERIC, 2), last_updated = now()
FROM public.products p
WHERE ps.product_id = p.id AND ps.store_name = 'Myntra';

-- Generate price history for new products (last 60 days)
DO $$
DECLARE
  r RECORD;
  base_price NUMERIC;
  rec_date DATE;
  i INTEGER;
  v NUMERIC;
BEGIN
  -- Only for new products that don't have price history
  FOR r IN 
    SELECT p.id, p.current_price 
    FROM public.products p
    LEFT JOIN public.price_history ph ON p.id = ph.product_id
    WHERE ph.id IS NULL
  LOOP
    base_price := r.current_price;

    FOR i IN 0..59 LOOP
      rec_date := CURRENT_DATE - (59 - i);
      v := base_price * (
            1
          + (sin(i * 0.6) * 0.15)
          + ((random() - 0.5) * 0.10)
      );
      v := GREATEST(base_price * 0.85, LEAST(base_price * 1.15, v));

      INSERT INTO public.price_history (product_id, price, recorded_at)
      VALUES (r.id, ROUND(v::NUMERIC, 2), rec_date);
    END LOOP;
  END LOOP;
END
$$ LANGUAGE plpgsql;