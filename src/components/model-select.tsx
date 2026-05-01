'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import * as React from 'react';

const customModelValue = '__custom_model__';

type ModelSelectProps = {
    id: string;
    customInputId: string;
    model: string;
    modelOptions: string[];
    onModelChange: (model: string) => void;
    disabled?: boolean;
    disabledModels?: string[];
    disabledModelReason?: string;
};

function normalizeModelOptions(modelOptions: string[]) {
    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const model of modelOptions) {
        const trimmedModel = model.trim();
        if (!trimmedModel || seen.has(trimmedModel)) continue;
        seen.add(trimmedModel);
        normalized.push(trimmedModel);
    }

    return normalized;
}

export function ModelSelect({
    id,
    customInputId,
    model,
    modelOptions,
    onModelChange,
    disabled,
    disabledModels = [],
    disabledModelReason
}: ModelSelectProps) {
    const { t } = useI18n();
    const normalizedModelOptions = normalizeModelOptions(modelOptions);
    const disabledModelSet = new Set(disabledModels.map((disabledModel) => disabledModel.trim()).filter(Boolean));
    const trimmedModel = model.trim();
    const isCustomModel = !trimmedModel || !normalizedModelOptions.includes(trimmedModel);
    const selectValue = isCustomModel ? customModelValue : trimmedModel;

    const handleSelectChange = (value: string) => {
        if (value === customModelValue) {
            onModelChange(isCustomModel ? model : '');
            return;
        }

        onModelChange(value);
    };

    return (
        <div className='space-y-2'>
            <Label htmlFor={id} className='text-white'>
                {t('common.model')}
            </Label>
            <Select value={selectValue} onValueChange={handleSelectChange} disabled={disabled}>
                <SelectTrigger
                    id={id}
                    aria-label={t('form.selectModel')}
                    className='w-full border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'>
                    <SelectValue placeholder={t('form.selectModel')} />
                </SelectTrigger>
                <SelectContent className='border-white/20 bg-black text-white'>
                    {normalizedModelOptions.map((option) => {
                        const isDisabled = disabledModelSet.has(option);

                        return (
                            <SelectItem key={option} value={option} disabled={isDisabled} className='focus:bg-white/10'>
                                <span className='flex w-full items-center justify-between gap-3'>
                                    <span>{option}</span>
                                    {isDisabled && disabledModelReason && (
                                        <span className='text-xs text-white/40'>{disabledModelReason}</span>
                                    )}
                                </span>
                            </SelectItem>
                        );
                    })}
                    <SelectItem value={customModelValue} className='focus:bg-white/10'>
                        {t('form.customModel')}
                    </SelectItem>
                </SelectContent>
            </Select>
            {isCustomModel && (
                <Input
                    id={customInputId}
                    value={model}
                    onChange={(event) => onModelChange(event.target.value)}
                    placeholder={t('settings.modelPlaceholder')}
                    disabled={disabled}
                    className='rounded-md border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/50'
                />
            )}
        </div>
    );
}
