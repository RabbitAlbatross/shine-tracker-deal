## Project overview

This app tracks product prices using two core tables: `products` and `price_history`. Optional supporting tables include `tracked_products` and `product_stores` for watchlists and multi-store comparisons.

## Run locally

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Configure Supabase in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

## Data model

- `products`: id, name, description, category, image_url, source_url, current_price, currency, created_at, updated_at
- `price_history`: id, product_id, price, recorded_at

AI tooling and branding references have been removed to keep the project neutral.
