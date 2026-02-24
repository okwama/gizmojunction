'use client';

import { useState, useTransition } from 'react';
import NextImage from 'next/image';
import { updateBatchStoreSettings, uploadAsset } from '@/lib/actions/admin';
import { Image as ImageIcon, Type, Megaphone, Palette, Moon, Sun, Monitor, Save, Check, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StorefrontConfigProps {
    initialConfig: Record<string, any>;
}

export default function StorefrontConfig({ initialConfig }: StorefrontConfigProps) {
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    // Hero settings
    const [heroImageUrl, setHeroImageUrl] = useState(initialConfig.hero_image_url || '');
    const [heroTitle, setHeroTitle] = useState(initialConfig.hero_title || '');
    const [heroSubtitle, setHeroSubtitle] = useState(initialConfig.hero_subtitle || '');
    const [heroCtaText, setHeroCtaText] = useState(initialConfig.hero_cta_text || '');

    // Promo bar settings
    const [promoBarText, setPromoBarText] = useState(initialConfig.promo_bar_text || '');
    const [promoBarEnabled, setPromoBarEnabled] = useState(initialConfig.promo_bar_enabled !== false);
    const [promoBarBgColor, setPromoBarBgColor] = useState(initialConfig.promo_bar_bg_color || '#2563eb');

    // Theme settings
    const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(initialConfig.theme_mode || 'system');

    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadAsset(formData);
            if (result.url) {
                setHeroImageUrl(result.url);
                toast.success('Image uploaded successfully!');
            } else if (result.error) {
                toast.error(`Upload failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('An unexpected error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = () => {
        console.log('Save button clicked');
        setSaved(false);
        startTransition(async () => {
            console.log('Transition started');
            const settings: Record<string, any> = {
                hero_image_url: heroImageUrl || '',
                hero_title: heroTitle || '',
                hero_subtitle: heroSubtitle || '',
                hero_cta_text: heroCtaText || '',
                promo_bar_text: promoBarText || '',
                promo_bar_enabled: promoBarEnabled,
                promo_bar_bg_color: promoBarBgColor,
                theme_mode: themeMode,
            };

            console.log('Sending settings:', settings);
            const result = await updateBatchStoreSettings(settings);
            console.log('Save result:', result);

            if (result?.error) {
                toast.error(`Failed to save settings: ${result.error}`);
            } else {
                setSaved(true);
                toast.success('Storefront configuration saved!');
                setTimeout(() => setSaved(false), 2000);
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Hero Configuration */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden auto-rows-min transition-colors">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                    <div className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 rounded-lg">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black">Hero Section</h3>
                </div>
                <div className="p-6 space-y-8">
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Hero Background</label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* URL Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-neutral-400">Image URL</label>
                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-violet-600 rounded-xl outline-none transition-all text-sm font-bold"
                                        placeholder="https://example.com/hero.jpg"
                                        value={heroImageUrl}
                                        onChange={(e) => setHeroImageUrl(e.target.value)}
                                    />
                                    {heroImageUrl && (
                                        <button
                                            onClick={() => setHeroImageUrl('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full"
                                        >
                                            <X className="w-4 h-4 text-neutral-400" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-neutral-400">Upload to &apos;assets&apos; bucket</label>
                                <label className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {isUploading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                                    ) : (
                                        <Upload className="w-5 h-5 text-neutral-400" />
                                    )}
                                    <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                                        {isUploading ? 'Uploading...' : 'Choose File'}
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                        </div>

                        {heroImageUrl && (
                            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 h-48 group">
                                <NextImage src={heroImageUrl} alt="Hero preview" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-bold text-xs">Preview</p>
                                </div>
                            </div>
                        )}
                        <p className="text-[10px] text-neutral-400 italic">Recommended: 1920x800px. Uploaded files go to your Supabase &apos;assets&apos; bucket.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Hero Title</label>
                            <input
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-violet-600 rounded-xl outline-none transition-all text-sm font-bold"
                                placeholder="The Future of Tech is Here"
                                value={heroTitle}
                                onChange={(e) => setHeroTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">CTA Button Text</label>
                            <input
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-violet-600 rounded-xl outline-none transition-all text-sm font-bold"
                                placeholder="Shop Now"
                                value={heroCtaText}
                                onChange={(e) => setHeroCtaText(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Hero Subtitle</label>
                        <textarea
                            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-violet-600 rounded-xl outline-none transition-all text-sm font-bold resize-none h-20"
                            placeholder="Upgrade your lifestyle with the latest electronics..."
                            value={heroSubtitle}
                            onChange={(e) => setHeroSubtitle(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Promo Bar */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black">Promotional Banner</h3>
                </div>
                <div className="p-6 space-y-8">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                        <div>
                            <h4 className="text-sm font-black">Show Announcement Bar</h4>
                            <p className="text-xs text-neutral-500 font-medium">Display the promo bar at the top of every page.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={promoBarEnabled}
                                onChange={(e) => setPromoBarEnabled(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Announcement Text</label>
                        <input
                            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-orange-600 rounded-xl outline-none transition-all text-sm font-bold"
                            placeholder="Free shipping on all orders over KES 9,900!"
                            value={promoBarText}
                            onChange={(e) => setPromoBarText(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Background Color</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={promoBarBgColor}
                                onChange={(e) => setPromoBarBgColor(e.target.value)}
                                className="w-12 h-10 rounded-lg cursor-pointer border-2 border-neutral-200 p-1"
                            />
                            <input
                                className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-orange-600 rounded-xl outline-none transition-all text-sm font-bold font-mono"
                                value={promoBarBgColor}
                                onChange={(e) => setPromoBarBgColor(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Preview</label>
                        <div
                            className="py-2 text-center text-xs sm:text-sm font-medium text-white rounded-xl"
                            style={{ backgroundColor: promoBarBgColor }}
                        >
                            {promoBarText || 'Free shipping on all orders over KES 9,900! Shop our latest deals now.'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Mode */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                        <Palette className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black">Theme Mode</h3>
                </div>
                <div className="p-8">
                    <p className="text-sm text-neutral-500 mb-6">Choose the default appearance for the storefront. This applies globally to all customers.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {([
                            { key: 'light', label: 'Light Mode', icon: Sun, desc: 'Always use a bright theme' },
                            { key: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Always use a dark theme' },
                            { key: 'system', label: 'System Default', icon: Monitor, desc: 'Follow user OS preference' },
                        ] as const).map((option) => (
                            <button
                                key={option.key}
                                onClick={() => setThemeMode(option.key)}
                                className={`p-6 rounded-2xl border-2 transition-all text-left ${themeMode === option.key
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-neutral-100 dark:border-neutral-800 hover:border-indigo-300'
                                    }`}
                            >
                                <option.icon className={`w-6 h-6 mb-3 ${themeMode === option.key ? 'text-indigo-600' : 'text-neutral-400'}`} />
                                <h4 className="font-black text-sm">{option.label}</h4>
                                <p className="text-xs text-neutral-500 mt-1">{option.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className={`flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-black shadow-lg transition-all ${saved
                        ? 'bg-green-600 text-white shadow-green-600/20'
                        : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'
                        } disabled:opacity-50`}
                >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isPending ? 'Saving...' : saved ? 'Saved!' : 'Save Storefront Settings'}
                </button>
            </div>
        </div>
    );
}
