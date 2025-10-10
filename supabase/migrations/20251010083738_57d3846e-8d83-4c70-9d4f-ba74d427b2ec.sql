-- Update store prices to match corrected product prices
UPDATE product_stores ps
SET price = p.current_price, last_updated = now()
FROM products p
WHERE ps.product_id = p.id AND ps.store_name = 'Amazon';

-- Update Flipkart prices (slightly different from Amazon)
UPDATE product_stores ps
SET price = p.current_price * (0.95 + random() * 0.1), last_updated = now()
FROM products p
WHERE ps.product_id = p.id AND ps.store_name = 'Flipkart';

-- Update Myntra prices (for fashion items)
UPDATE product_stores ps
SET price = p.current_price * (0.93 + random() * 0.14), last_updated = now()
FROM products p
WHERE ps.product_id = p.id AND ps.store_name = 'Myntra' AND p.category IN ('Fashion');