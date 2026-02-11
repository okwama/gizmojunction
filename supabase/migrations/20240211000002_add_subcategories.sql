-- Add parent_id to categories for subcategory support
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Add index for faster parent lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Create main RAM category
INSERT INTO categories (name, slug, description)
VALUES ('RAM & Memory', 'ram-memory', 'Computer memory modules')
ON CONFLICT (slug) DO NOTHING;

-- Create subcategories for RAM types
DO $$
DECLARE
    ram_category_id UUID;
BEGIN
    -- Get the RAM category ID
    SELECT id INTO ram_category_id FROM categories WHERE slug = 'ram-memory';
    
    -- Create subcategories
    INSERT INTO categories (name, slug, description, parent_id)
    VALUES 
        ('Laptop RAM DDR5', 'laptop-ram-ddr5', 'DDR5 laptop memory modules', ram_category_id),
        ('Laptop RAM DDR4', 'laptop-ram-ddr4', 'DDR4 laptop memory modules', ram_category_id),
        ('Laptop RAM DDR3', 'laptop-ram-ddr3', 'DDR3 laptop memory modules', ram_category_id),
        ('Desktop RAM DDR5', 'desktop-ram-ddr5', 'DDR5 desktop memory modules', ram_category_id),
        ('Desktop RAM DDR4', 'desktop-ram-ddr4', 'DDR4 desktop memory modules', ram_category_id),
        ('Desktop RAM DDR3', 'desktop-ram-ddr3', 'DDR3 desktop memory modules', ram_category_id)
    ON CONFLICT (slug) DO NOTHING;
END $$;
