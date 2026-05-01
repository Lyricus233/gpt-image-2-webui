'use client';

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { type Translate, useI18n } from '@/lib/i18n';
import {
    getSizeTier,
    isEditSizeSupported,
    isHighResolutionSize,
    sizePresetGroups,
    type SizePreset
} from '@/lib/size-utils';

type SizeSelectProps = {
    id: string;
    size: SizePreset;
    onSizeChange: (size: SizePreset) => void;
    mode: 'edit' | 'generate';
    disabled?: boolean;
};

function formatGroupLabel(labelKey: (typeof sizePresetGroups)[number]['labelKey'], t: Translate) {
    return t(labelKey);
}

function getOptionHint(size: SizePreset, mode: SizeSelectProps['mode'], t: Translate) {
    if (mode === 'edit' && !isEditSizeSupported(size)) {
        return t('form.sizeEditUnsupported');
    }

    if (isHighResolutionSize(size)) {
        return t('form.sizeProOnly');
    }

    return '';
}

export function SizeSelect({ id, size, onSizeChange, mode, disabled }: SizeSelectProps) {
    const { t } = useI18n();

    return (
        <div className='space-y-2'>
            <Label htmlFor={id} className='text-white'>
                {t('common.size')}
            </Label>
            <Select value={size} onValueChange={(value) => onSizeChange(value as SizePreset)} disabled={disabled}>
                <SelectTrigger
                    id={id}
                    className='w-full border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-white/20 bg-black text-white'>
                    {sizePresetGroups.map((group) => (
                        <SelectGroup key={group.id}>
                            <SelectLabel className='text-white/45'>{formatGroupLabel(group.labelKey, t)}</SelectLabel>
                            {group.options.map((option) => {
                                const disabledOption = mode === 'edit' && !isEditSizeSupported(option.value);
                                const hint = getOptionHint(option.value, mode, t);

                                return (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        disabled={disabledOption}
                                        className='focus:bg-white/10'>
                                        <span className='flex w-full items-center justify-between gap-3'>
                                            <span>{option.label}</span>
                                            {hint && <span className='text-xs text-white/40'>{hint}</span>}
                                        </span>
                                    </SelectItem>
                                );
                            })}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>
            <p className='text-xs text-white/45'>
                {getSizeTier(size).toUpperCase()} ·{' '}
                {isHighResolutionSize(size) ? t('form.highResSingleImage') : t('form.sizeStandardHint')}
            </p>
        </div>
    );
}
