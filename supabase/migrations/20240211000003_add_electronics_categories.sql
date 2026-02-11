-- Add parent_id to categories if not exists (idempotent check)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parent_id') THEN
        ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;
        CREATE INDEX idx_categories_parent_id ON categories(parent_id);
    END IF;
END $$;

-- Create Main Parent Categories
INSERT INTO categories (name, slug, description)
VALUES 
    ('Components', 'components', 'Computer parts and components'),
    ('Storage', 'storage', 'Data storage devices'),
    ('Networking', 'networking', 'Networking equipment'),
    ('Power', 'power', 'Power supplies and backup'),
    ('Printing', 'printing', 'Printers and scanners'),
    ('Audio', 'audio', 'Audio equipment'),
    ('Peripherals', 'peripherals', 'Computer peripherals'),
    ('Accessories', 'accessories', 'Cables and accessories')
ON CONFLICT (slug) DO NOTHING;

-- Create Subcategories
DO $$
DECLARE
    components_id UUID;
    storage_id UUID;
    networking_id UUID;
    power_id UUID;
    printing_id UUID;
    audio_id UUID;
    peripherals_id UUID;
    accessories_id UUID;
BEGIN
    -- Get Parent IDs
    SELECT id INTO components_id FROM categories WHERE slug = 'components';
    SELECT id INTO storage_id FROM categories WHERE slug = 'storage';
    SELECT id INTO networking_id FROM categories WHERE slug = 'networking';
    SELECT id INTO power_id FROM categories WHERE slug = 'power';
    SELECT id INTO printing_id FROM categories WHERE slug = 'printing';
    SELECT id INTO audio_id FROM categories WHERE slug = 'audio';
    SELECT id INTO peripherals_id FROM categories WHERE slug = 'peripherals';
    SELECT id INTO accessories_id FROM categories WHERE slug = 'accessories';

    -- Components Subcategories
    INSERT INTO categories (name, slug, description, parent_id) VALUES
        ('Processors', 'processors', 'CPUs', components_id),
        ('Graphics Cards', 'graphics-cards', 'GPUs', components_id),
        ('Motherboards', 'motherboards', 'Motherboards', components_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

    -- Update existing RAM category parenting
    UPDATE categories SET parent_id = components_id WHERE slug = 'ram-memory';

    -- Storage Subcategories
    INSERT INTO categories (name, slug, description, parent_id) VALUES
        ('SSD', 'ssd', 'Solid State Drives', storage_id),
        ('Hard Drives', 'hdd', 'Internal & External HDDs', storage_id),
        ('Flash Drives', 'flash-drives', 'USB Drives', storage_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

    -- Networking Subcategories
    INSERT INTO categories (name, slug, description, parent_id) VALUES
        ('Routers', 'routers', 'Wireless Routers', networking_id),
        ('Switches', 'switches', 'Network Switches', networking_id),
        ('Access Points', 'access-points', 'Wireless Access Points', networking_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

    -- Power Subcategories
    INSERT INTO categories (name, slug, description, parent_id) VALUES
        ('UPS', 'ups', 'Uninterruptible Power Supplies', power_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

    -- Printing Subcategories
    INSERT INTO categories (name, slug, description, parent_id) VALUES
        ('Printers', 'printers', 'Inkjet & Laser Printers', printing_id),
        ('Scanners', 'scanners', 'Document Scanners', printing_id),
        ('Toner & Ink', 'toner-ink', 'Printer Cartridges', printing_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

    -- Audio Subcategories
    INSERT INTO categories (name, slug, description, parent_id) VALUES
        ('Earphones', 'earphones', 'Earphones & Earbuds', audio_id),
        ('Headsets', 'headsets', 'Headphones & Headsets', audio_id),
        ('Speakers', 'speakers', 'Portable & PC Speakers', audio_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

    -- Peripherals Subcategories
    INSERT INTO categories (name, slug, description, parent_id) VALUES
        ('Keyboards', 'keyboards', 'Computer Keyboards', peripherals_id),
        ('Mice', 'mice', 'Computer Mice', peripherals_id),
        ('Webcams', 'webcams', 'Web Cameras', peripherals_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

    -- Accessories Subcategories
    INSERT INTO categories (name, slug, description, parent_id) VALUES
        ('Cables', 'cables', 'Cables & Connectors', accessories_id),
        ('Chargers', 'chargers', 'Power Adapters', accessories_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

END $$;
