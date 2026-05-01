import type { GptImageModel } from '@/lib/cost-utils';

export type SizeValidation = { valid: true } | { valid: false; reason: string };

export type SizeTier = 'small' | '1k' | '2k' | '4k' | 'unknown';

export const GPT_IMAGE_2_STANDARD_MODEL = 'gpt-image-2';
export const GPT_IMAGE_2_PRO_MODEL = 'gpt-image-2-pro';
export const GPT_IMAGE_2_MIN_PIXELS = 655_360;
export const GPT_IMAGE_2_MAX_PIXELS = 8_294_400;
export const GPT_IMAGE_2_MAX_EDGE = 3840;
export const GPT_IMAGE_2_EDGE_MULTIPLE = 16;
export const GPT_IMAGE_2_MAX_ASPECT = 3;

export function validateGptImage2Size(width: number, height: number): SizeValidation {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return { valid: false, reason: 'Width and height must be positive numbers.' };
    }
    if (!Number.isInteger(width) || !Number.isInteger(height)) {
        return { valid: false, reason: 'Width and height must be whole numbers.' };
    }
    if (width % GPT_IMAGE_2_EDGE_MULTIPLE !== 0 || height % GPT_IMAGE_2_EDGE_MULTIPLE !== 0) {
        return { valid: false, reason: `Both edges must be multiples of ${GPT_IMAGE_2_EDGE_MULTIPLE}.` };
    }
    if (width > GPT_IMAGE_2_MAX_EDGE || height > GPT_IMAGE_2_MAX_EDGE) {
        return { valid: false, reason: `Maximum edge is ${GPT_IMAGE_2_MAX_EDGE}px.` };
    }
    const long = Math.max(width, height);
    const short = Math.min(width, height);
    if (long / short > GPT_IMAGE_2_MAX_ASPECT) {
        return { valid: false, reason: `Aspect ratio (long:short) must be ≤ ${GPT_IMAGE_2_MAX_ASPECT}:1.` };
    }
    const pixels = width * height;
    if (pixels < GPT_IMAGE_2_MIN_PIXELS) {
        return { valid: false, reason: `Total pixels must be at least ${GPT_IMAGE_2_MIN_PIXELS.toLocaleString()}.` };
    }
    if (pixels > GPT_IMAGE_2_MAX_PIXELS) {
        return {
            valid: false,
            reason: `Total pixels must be no more than ${GPT_IMAGE_2_MAX_PIXELS.toLocaleString()}.`
        };
    }
    return { valid: true };
}

export const sizePresetGroups = [
    {
        id: '1k',
        labelKey: 'form.sizeGroup1k',
        options: [
            { value: '1024x1024', label: '1024×1024 · 1:1' },
            { value: '1280x720', label: '1280×720 · 16:9 横 (HD)' },
            { value: '720x1280', label: '720×1280 · 9:16 竖 (HD)' },
            { value: '1024x1536', label: '1024×1536 · 2:3 竖' },
            { value: '1536x1024', label: '1536×1024 · 3:2 横' }
        ]
    },
    {
        id: '2k',
        labelKey: 'form.sizeGroup2k',
        options: [
            { value: '1920x1080', label: '1920×1080 · 16:9 横 (Full HD)' },
            { value: '1080x1920', label: '1080×1920 · 9:16 竖 (Full HD)' },
            { value: '2048x2048', label: '2048×2048 · 1:1' },
            { value: '2048x1152', label: '2048×1152 · 16:9 横' },
            { value: '1152x2048', label: '1152×2048 · 9:16 竖' }
        ]
    },
    {
        id: '4k',
        labelKey: 'form.sizeGroup4k',
        options: [
            { value: '3840x2160', label: '3840×2160 · 16:9 横' },
            { value: '2160x3840', label: '2160×3840 · 9:16 竖' }
        ]
    }
] as const;

export type SizePreset = (typeof sizePresetGroups)[number]['options'][number]['value'];

const defaultSizePreset: SizePreset = '1024x1024';

const legacyGptImageModels = ['gpt-image-1', 'gpt-image-1.5', 'gpt-image-1-mini'];

export function usesGptImage2Sizing(model: GptImageModel): boolean {
    return !legacyGptImageModels.includes(model.trim());
}

export function isGptImage2ProModel(model: GptImageModel): boolean {
    return model.trim() === GPT_IMAGE_2_PRO_MODEL;
}

export function parseSize(size: string): { width: number; height: number } | null {
    const match = /^(\d+)x(\d+)$/i.exec(size.trim());
    if (!match) return null;

    return {
        width: Number.parseInt(match[1], 10),
        height: Number.parseInt(match[2], 10)
    };
}

export function getSizeTier(size: string): SizeTier {
    const parsedSize = parseSize(size);
    if (!parsedSize) return 'unknown';

    const maxEdge = Math.max(parsedSize.width, parsedSize.height);
    if (maxEdge < 1024) return 'small';
    if (maxEdge < 1600) return '1k';
    if (maxEdge < 3000) return '2k';
    return '4k';
}

export function isHighResolutionSize(size: string): boolean {
    const tier = getSizeTier(size);
    return tier === '2k' || tier === '4k';
}

export function requiresGptImage2Pro(size: string): boolean {
    return isHighResolutionSize(size);
}

export function isEditSizeSupported(size: string): boolean {
    return !isHighResolutionSize(size);
}

export function normalizeSizePreset(size: string): SizePreset {
    const legacyPresetMap: Record<string, SizePreset> = {
        square: '1024x1024',
        landscape: '1536x1024',
        portrait: '1024x1536',
        custom: defaultSizePreset
    };

    if (legacyPresetMap[size]) {
        return legacyPresetMap[size];
    }

    const allSizePresets = sizePresetGroups.flatMap((group) => group.options.map((option) => option.value));

    return allSizePresets.includes(size as SizePreset) ? (size as SizePreset) : defaultSizePreset;
}

/**
 * Returns the concrete WxH string for a preset, tailored to the model.
 */
export function getPresetDimensions(preset: SizePreset, model: GptImageModel): string | null {
    void model;
    return preset;
}

/**
 * Human-readable dimension info for tooltips.
 */
export function getPresetTooltip(preset: SizePreset, model: GptImageModel): string | null {
    void model;
    const dims = getPresetDimensions(preset, model);
    if (!dims) return null;
    const parsedSize = parseSize(dims);
    if (!parsedSize) return null;

    const { width: w, height: h } = parsedSize;
    const mp = ((w * h) / 1_000_000).toFixed(1);
    const divisor = getGreatestCommonDivisor(w, h);
    const ratio = `${w / divisor}:${h / divisor}`;
    return `${w} × ${h} · ${ratio} · ${mp} MP`;
}

function getGreatestCommonDivisor(left: number, right: number): number {
    let a = Math.abs(left);
    let b = Math.abs(right);

    while (b) {
        const remainder = a % b;
        a = b;
        b = remainder;
    }

    return a || 1;
}
