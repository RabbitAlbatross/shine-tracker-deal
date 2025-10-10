-- Regenerate realistic price fluctuations for all products and sync current prices

-- 1) Clear previous history (keeps schema intact)
DELETE FROM public.price_history;

-- 2) Generate 60 days of wave-like price history per product
DO $$
DECLARE
  r RECORD;
  base_price NUMERIC;
  rec_date DATE;
  i INTEGER;
  v NUMERIC;
BEGIN
  FOR r IN SELECT id, current_price FROM public.products LOOP
    base_price := r.current_price;

    -- 60 data points over past 60 days
    FOR i IN 0..59 LOOP
      rec_date := CURRENT_DATE - (59 - i);

      -- Wave + small random noise; clamp to 75%..125% of base
      v := base_price * (
            1
          + (sin(i * 0.6) * 0.20)   -- oscillation
          + ((random() - 0.5) * 0.12) -- noise
      );
      v := GREATEST(base_price * 0.75, LEAST(base_price * 1.25, v));

      INSERT INTO public.price_history (product_id, price, recorded_at)
      VALUES (r.id, ROUND(v::NUMERIC, 2), rec_date);
    END LOOP;
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- 3) Ensure product current_price matches latest history point
UPDATE public.products p
SET current_price = ph.price
FROM (
  SELECT DISTINCT ON (product_id) product_id, price
  FROM public.price_history
  ORDER BY product_id, recorded_at DESC
) ph
WHERE ph.product_id = p.id;

-- 4) Align store prices (Amazon = current, others +/- small %)
UPDATE public.product_stores ps
SET price = p.current_price, last_updated = now()
FROM public.products p
WHERE ps.product_id = p.id AND ps.store_name = 'Amazon';

UPDATE public.product_stores ps
SET price = ROUND((p.current_price * (0.97 + (random() * 0.06)))::NUMERIC, 2), last_updated = now()
FROM public.products p
WHERE ps.product_id = p.id AND ps.store_name = 'Flipkart';

UPDATE public.product_stores ps
SET price = ROUND((p.current_price * (0.95 + (random() * 0.08)))::NUMERIC, 2), last_updated = now()
FROM public.products p
WHERE ps.product_id = p.id AND ps.store_name = 'Myntra';