/**
 * Import Configuration System
 * 
 * This configuration defines how products are categorized and brands are detected
 * during the import process. Add new categories and brands here instead of
 * modifying the import logic.
 */

export interface CategoryRule {
    name: string;
    slug: string;
    description: string;
    parentCategory?: string; // For subcategories
    keywords: string[]; // Keywords to match in product description
    priority: number; // Higher priority rules are checked first
    ddrTypes?: boolean; // If true, create DDR3/DDR4/DDR5 subcategories
}

export interface BrandRule {
    name: string;
    slug: string;
    patterns: RegExp[]; // Regex patterns to match brand in description
    aliases?: string[]; // Alternative names for the brand
}

export interface ImportConfig {
    categories: CategoryRule[];
    brands: BrandRule[];
    defaultCategory: string;
    defaultBrand: string;
}

/**
 * Import Configuration
 * Modify this to add new categories and brands
 */
export const importConfig: ImportConfig = {
    defaultCategory: 'Accessories',
    defaultBrand: 'Generic',

    // Category Detection Rules (checked in priority order)
    categories: [
        // --- COMPONENTS ---
        // RAM Categories (highest priority for specific matching)
        {
            name: 'Laptop RAM',
            slug: 'laptop-ram',
            description: 'Laptop memory modules',
            parentCategory: 'Components',
            keywords: ['laptop', 'ram', 'sodimm'],
            priority: 100,
            ddrTypes: true
        },
        {
            name: 'Desktop RAM',
            slug: 'desktop-ram',
            description: 'Desktop memory modules',
            parentCategory: 'Components',
            keywords: ['desktop', 'ram', 'dimm'],
            priority: 100,
            ddrTypes: true
        },
        {
            name: 'RAM & Memory',
            slug: 'ram-memory',
            description: 'Computer memory modules',
            parentCategory: 'Components',
            keywords: ['ram', 'memory', 'ddr'],
            priority: 95
        },
        {
            name: 'Processors',
            slug: 'processors',
            description: 'CPUs',
            parentCategory: 'Components',
            keywords: ['processor', 'cpu', 'intel core', 'amd ryzen'],
            priority: 95
        },
        {
            name: 'Graphics Cards',
            slug: 'graphics-cards',
            description: 'GPUs and Video Cards',
            parentCategory: 'Components',
            keywords: ['graphics card', 'gpu', 'rtx', 'gtx', 'radeon'],
            priority: 95
        },
        {
            name: 'Motherboards',
            slug: 'motherboards',
            description: 'Computer Motherboards',
            parentCategory: 'Components',
            keywords: ['motherboard', 'mainboard', 'b550', 'z790', 'am4', 'lga1700'],
            priority: 95
        },

        // --- STORAGE ---
        {
            name: 'SSD',
            slug: 'ssd',
            description: 'Solid State Drives',
            parentCategory: 'Storage',
            keywords: ['ssd', 'solid state', 'nvme', 'm.2'],
            priority: 90
        },
        {
            name: 'Hard Drives',
            slug: 'hdd',
            description: 'Internal & External Hard Drives',
            parentCategory: 'Storage',
            keywords: ['hdd', 'hard drive', 'internal drive', 'external drive'],
            priority: 90
        },
        {
            name: 'Flash Drives',
            slug: 'flash-drives',
            description: 'USB Flash Drives',
            parentCategory: 'Storage',
            keywords: ['flash drive', 'usb drive', 'thumb drive', 'pen drive'],
            priority: 90
        },

        // --- NETWORKING ---
        {
            name: 'Routers',
            slug: 'routers',
            description: 'Wireless and Wired Routers',
            parentCategory: 'Networking',
            keywords: ['router', 'wifi', 'wi-fi', 'ax3000', 'ac1200'],
            priority: 85
        },
        {
            name: 'Switches',
            slug: 'switches',
            description: 'Network Switches',
            parentCategory: 'Networking',
            keywords: ['switch', 'poe', 'gigabit', 'ethernet switch'],
            priority: 85
        },
        {
            name: 'Access Points',
            slug: 'access-points',
            description: 'Wireless Access Points',
            parentCategory: 'Networking',
            keywords: ['access point', 'wap', 'range extender'],
            priority: 85
        },

        // --- POWER ---
        {
            name: 'UPS',
            slug: 'ups',
            description: 'Uninterruptible Power Supplies',
            parentCategory: 'Power',
            keywords: ['ups', 'backup power', 'battery backup', 'apc', 'mercury'],
            priority: 85
        },

        // --- PRINTING ---
        {
            name: 'Printers',
            slug: 'printers',
            description: 'Inkjet and Laser Printers',
            parentCategory: 'Printing',
            keywords: ['printer', 'laserjet', 'inkjet', 'mfp'],
            priority: 85
        },
        {
            name: 'Scanners',
            slug: 'scanners',
            description: 'Document Scanners',
            parentCategory: 'Printing',
            keywords: ['scanner', 'document scanner'],
            priority: 85
        },
        {
            name: 'Toner & Ink',
            slug: 'toner-ink',
            description: 'Printer Cartridges',
            parentCategory: 'Printing',
            keywords: ['toner', 'cartridge', 'ink bottle'],
            priority: 85
        },

        // --- MOBILE & AUDIO ---
        {
            name: 'Smartphones',
            slug: 'smartphones',
            description: 'Mobile phones and smartphones',
            keywords: ['phone', 'smartphone', 'mobile', 'iphone', 'galaxy'],
            priority: 80
        },
        {
            name: 'Earphones',
            slug: 'earphones',
            description: 'Earphones and earbuds',
            parentCategory: 'Audio',
            keywords: ['earphone', 'earbud', 'airpod', 'earpod'],
            priority: 80
        },
        {
            name: 'Headsets',
            slug: 'headsets',
            description: 'Headphones and headsets',
            parentCategory: 'Audio',
            keywords: ['headset', 'headphone'],
            priority: 80
        },
        {
            name: 'Speakers',
            slug: 'speakers',
            description: 'Portable and PC Speakers',
            parentCategory: 'Audio',
            keywords: ['speaker', 'bluetooth speaker', 'soundbar'],
            priority: 80
        },

        // --- COMPUTERS ---
        {
            name: 'Laptops',
            slug: 'laptops',
            description: 'Laptop computers',
            keywords: ['laptop', 'notebook', 'ideapad', 'thinkpad', 'macbook'],
            priority: 70
        },
        {
            name: 'Desktops',
            slug: 'desktops',
            description: 'Desktop computers',
            keywords: ['desktop', 'pc', 'tower', 'all-in-one', 'aio'],
            priority: 70
        },
        {
            name: 'Monitors',
            slug: 'monitors',
            description: 'Computer monitors and displays',
            keywords: ['monitor', 'display', 'screen'],
            priority: 70
        },

        // --- PERIPHERALS ---
        {
            name: 'Keyboards',
            slug: 'keyboards',
            description: 'Computer keyboards',
            parentCategory: 'Peripherals',
            keywords: ['keyboard'],
            priority: 60
        },
        {
            name: 'Mice',
            slug: 'mice',
            description: 'Computer mice and pointing devices',
            parentCategory: 'Peripherals',
            keywords: ['mouse', 'mice', 'trackpad'],
            priority: 60
        },
        {
            name: 'Webcams',
            slug: 'webcams',
            description: 'Web cameras',
            parentCategory: 'Peripherals',
            keywords: ['webcam', 'camera'],
            priority: 60
        },

        // --- ACCESSORIES ---
        {
            name: 'Cables',
            slug: 'cables',
            description: 'Cables and connectors',
            parentCategory: 'Accessories',
            keywords: ['cable', 'usb', 'hdmi', 'displayport', 'connector', 'vga'],
            priority: 50
        },
        {
            name: 'Chargers',
            slug: 'chargers',
            description: 'Power adapters and chargers',
            parentCategory: 'Accessories',
            keywords: ['charger', 'adapter', 'power supply', 'psu'],
            priority: 50
        },
        {
            name: 'Accessories',
            slug: 'accessories',
            description: 'Computer accessories',
            keywords: ['accessory', 'peripheral'],
            priority: 10
        }
    ],

    // Brand Detection Rules
    brands: [
        // Networking Brands
        { name: 'TP-Link', slug: 'tp-link', patterns: [/^TP-Link/i, /\bTP-Link\b/i] },
        { name: 'D-Link', slug: 'd-link', patterns: [/^D-Link/i, /\bD-Link\b/i] },
        { name: 'Ubiquiti', slug: 'ubiquiti', patterns: [/^Ubiquiti/i, /\bUbiquiti\b/i, /^Unifi/i] },
        { name: 'MikroTik', slug: 'mikrotik', patterns: [/^MikroTik/i, /\bMikroTik\b/i] },
        { name: 'Cisco', slug: 'cisco', patterns: [/^Cisco/i, /\bCisco\b/i] },
        { name: 'Tenda', slug: 'tenda', patterns: [/^Tenda/i, /\bTenda\b/i] },

        // Power Brands
        { name: 'APC', slug: 'apc', patterns: [/^APC/i, /\bAPC\b/i] },
        { name: 'Mercury', slug: 'mercury', patterns: [/^Mercury/i, /\bMercury\b/i] },
        { name: 'Eaton', slug: 'eaton', patterns: [/^Eaton/i, /\bEaton\b/i] },

        // Printing Brands
        { name: 'HP', slug: 'hp', patterns: [/^HP/i, /\bHP\b/i, /^Hewlett/i] },
        { name: 'Canon', slug: 'canon', patterns: [/^Canon/i, /\bCanon\b/i] },
        { name: 'Epson', slug: 'epson', patterns: [/^Epson/i, /\bEpson\b/i] },
        { name: 'Brother', slug: 'brother', patterns: [/^Brother/i, /\bBrother\b/i] },
        { name: 'Kyocera', slug: 'kyocera', patterns: [/^Kyocera/i, /\bKyocera\b/i] },

        // Storage Brands
        { name: 'Seagate', slug: 'seagate', patterns: [/^Seagate/i, /\bSeagate\b/i] },
        { name: 'Western Digital', slug: 'wd', patterns: [/^Western Digital/i, /^WD\b/i] },
        { name: 'Sandisk', slug: 'sandisk', patterns: [/^Sandisk/i, /\bSandisk\b/i] },
        { name: 'Samsung', slug: 'samsung', patterns: [/^Samsung/i, /\bSamsung\b/i] },
        { name: 'Adata', slug: 'adata', patterns: [/^Adata/i, /\bAdata\b/i] },
        { name: 'Transcend', slug: 'transcend', patterns: [/^Transcend/i, /\bTranscend\b/i] },

        // Component Brands
        { name: 'Intel', slug: 'intel', patterns: [/^Intel/i, /\bIntel\b/i] },
        { name: 'AMD', slug: 'amd', patterns: [/^AMD/i, /\bAMD\b/i] },
        { name: 'Nvidia', slug: 'nvidia', patterns: [/^Nvidia/i, /\bNvidia\b/i] },
        { name: 'Asus', slug: 'asus', patterns: [/^Asus/i, /\bAsus\b/i] },
        { name: 'Gigabyte', slug: 'gigabyte', patterns: [/^Gigabyte/i, /\bGigabyte\b/i] },
        { name: 'MSI', slug: 'msi', patterns: [/^MSI/i, /\bMSI\b/i] },

        // RAM Brands
        { name: 'Lexar', slug: 'lexar', patterns: [/^Lexar/i, /\bLexar\b/i] },
        { name: 'Kingston', slug: 'kingston', patterns: [/^Kingston/i, /\bKingston\b/i] },
        { name: 'Corsair', slug: 'corsair', patterns: [/^Corsair/i, /\bCorsair\b/i] },
        { name: 'Crucial', slug: 'crucial', patterns: [/^Crucial/i, /\bCrucial\b/i] },
        { name: 'G.Skill', slug: 'g-skill', patterns: [/^G\.Skill/i, /\bG\.Skill\b/i] },
        { name: 'Hynix', slug: 'hynix', patterns: [/^Hynix/i, /\bHynix\b/i, /^SK Hynix/i] },

        // Computer Brands
        { name: 'Lenovo', slug: 'lenovo', patterns: [/^Lenovo/i, /\bLenovo\b/i] },
        { name: 'Dell', slug: 'dell', patterns: [/^Dell/i, /\bDell\b/i] },
        { name: 'Acer', slug: 'acer', patterns: [/^Acer/i, /\bAcer\b/i] },
        { name: 'Apple', slug: 'apple', patterns: [/^Apple/i, /\bApple\b/i] },
        { name: 'Microsoft', slug: 'microsoft', patterns: [/^Microsoft/i, /\bMicrosoft\b/i] },

        // Peripherals & Audio
        { name: 'Logitech', slug: 'logitech', patterns: [/^Logitech/i, /\bLogitech\b/i] },
        { name: 'Razer', slug: 'razer', patterns: [/^Razer/i, /\bRazer\b/i] },
        { name: 'JBL', slug: 'jbl', patterns: [/^JBL/i, /\bJBL\b/i] },
        { name: 'Sony', slug: 'sony', patterns: [/^Sony/i, /\bSony\b/i] },
        { name: 'Bose', slug: 'bose', patterns: [/^Bose/i, /\bBose\b/i] }
    ]
};

/**
 * Detect category from product description using configuration
 */
export function detectCategory(description: string): { name: string; slug: string; parentCategory?: string } {
    const lowerDesc = description.toLowerCase();

    // Sort by priority (highest first)
    const sortedCategories = [...importConfig.categories].sort((a, b) => b.priority - a.priority);

    // Check for DDR type if category supports it
    const ddrType = lowerDesc.includes('ddr5') ? 'DDR5' :
        lowerDesc.includes('ddr4') ? 'DDR4' :
            lowerDesc.includes('ddr3') ? 'DDR3' : null;

    // Find matching category
    for (const category of sortedCategories) {
        const hasAllKeywords = category.keywords.every(keyword =>
            lowerDesc.includes(keyword.toLowerCase())
        );

        if (hasAllKeywords) {
            // If category supports DDR types and we detected one, create subcategory
            if (category.ddrTypes && ddrType) {
                return {
                    name: `${category.name} ${ddrType}`,
                    slug: `${category.slug}-${ddrType.toLowerCase()}`,
                    parentCategory: category.parentCategory
                };
            }

            return {
                name: category.name,
                slug: category.slug,
                parentCategory: category.parentCategory
            };
        }
    }

    // Default category
    return {
        name: importConfig.defaultCategory,
        slug: importConfig.defaultCategory.toLowerCase()
    };
}

/**
 * Detect brand from product description using configuration
 */
export function detectBrand(description: string): { name: string; slug: string } {
    for (const brand of importConfig.brands) {
        for (const pattern of brand.patterns) {
            if (pattern.test(description)) {
                return {
                    name: brand.name,
                    slug: brand.slug
                };
            }
        }
    }

    // Default brand
    return {
        name: importConfig.defaultBrand,
        slug: importConfig.defaultBrand.toLowerCase()
    };
}
