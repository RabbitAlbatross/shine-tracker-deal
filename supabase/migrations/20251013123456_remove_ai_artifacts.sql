-- Remove AI-related database artifacts safely

-- Drop policies if they exist
DROP POLICY IF EXISTS "Anyone can view product analysis" ON product_analysis;
DROP POLICY IF EXISTS "Anyone can insert product analysis" ON product_analysis;

-- Disable RLS before dropping (avoids dependency issues)
ALTER TABLE IF EXISTS product_analysis DISABLE ROW LEVEL SECURITY;

-- Drop table
DROP TABLE IF EXISTS product_analysis CASCADE;
