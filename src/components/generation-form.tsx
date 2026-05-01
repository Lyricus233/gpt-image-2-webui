'use client';

import { ModeToggle } from '@/components/mode-toggle';
import { ModelSelect } from '@/components/model-select';
import { SizeSelect } from '@/components/size-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import type { GptImageModel } from '@/lib/cost-utils';
import { useI18n } from '@/lib/i18n';
import {
    GPT_IMAGE_2_PRO_MODEL,
    GPT_IMAGE_2_STANDARD_MODEL,
    isHighResolutionSize,
    usesGptImage2Sizing
} from '@/lib/size-utils';
import type { SizePreset } from '@/lib/size-utils';
import {
    Sparkles,
    Eraser,
    ShieldCheck,
    ShieldAlert,
    FileImage,
    Tally1,
    Tally2,
    Tally3,
    Loader2,
    BrickWall,
    Lock,
    LockOpen
} from 'lucide-react';
import * as React from 'react';

export type GenerationFormData = {
    prompt: string;
    n: number;
    size: SizePreset;
    quality: 'low' | 'medium' | 'high' | 'auto';
    output_format: 'png' | 'jpeg' | 'webp';
    output_compression?: number;
    background: 'transparent' | 'opaque' | 'auto';
    moderation: 'low' | 'auto';
    model: GptImageModel;
};

type GenerationFormProps = {
    onSubmit: (data: GenerationFormData) => void;
    isLoading: boolean;
    currentMode: 'generate' | 'edit';
    onModeChange: (mode: 'generate' | 'edit') => void;
    isPasswordRequiredByBackend: boolean | null;
    clientPasswordHash: string | null;
    onOpenPasswordDialog: () => void;
    model: GenerationFormData['model'];
    setModel: React.Dispatch<React.SetStateAction<GenerationFormData['model']>>;
    modelOptions: string[];
    prompt: string;
    setPrompt: React.Dispatch<React.SetStateAction<string>>;
    n: number[];
    setN: React.Dispatch<React.SetStateAction<number[]>>;
    size: GenerationFormData['size'];
    setSize: React.Dispatch<React.SetStateAction<GenerationFormData['size']>>;
    quality: GenerationFormData['quality'];
    setQuality: React.Dispatch<React.SetStateAction<GenerationFormData['quality']>>;
    outputFormat: GenerationFormData['output_format'];
    setOutputFormat: React.Dispatch<React.SetStateAction<GenerationFormData['output_format']>>;
    compression: number[];
    setCompression: React.Dispatch<React.SetStateAction<number[]>>;
    background: GenerationFormData['background'];
    setBackground: React.Dispatch<React.SetStateAction<GenerationFormData['background']>>;
    moderation: GenerationFormData['moderation'];
    setModeration: React.Dispatch<React.SetStateAction<GenerationFormData['moderation']>>;
};

const RadioItemWithIcon = ({
    value,
    id,
    label,
    Icon
}: {
    value: string;
    id: string;
    label: string;
    Icon: React.ElementType;
}) => (
    <div className='flex items-center space-x-2'>
        <RadioGroupItem
            value={value}
            id={id}
            className='border-white/40 text-white data-[state=checked]:border-white data-[state=checked]:text-white'
        />
        <Label htmlFor={id} className='flex cursor-pointer items-center gap-2 text-base text-white/80'>
            <Icon className='h-5 w-5 text-white/60' />
            {label}
        </Label>
    </div>
);

export function GenerationForm({
    onSubmit,
    isLoading,
    currentMode,
    onModeChange,
    isPasswordRequiredByBackend,
    clientPasswordHash,
    onOpenPasswordDialog,
    model,
    setModel,
    modelOptions,
    prompt,
    setPrompt,
    n,
    setN,
    size,
    setSize,
    quality,
    setQuality,
    outputFormat,
    setOutputFormat,
    compression,
    setCompression,
    background,
    setBackground,
    moderation,
    setModeration
}: GenerationFormProps) {
    const { t } = useI18n();
    const showCompression = outputFormat === 'jpeg' || outputFormat === 'webp';
    const isGptImage2 = usesGptImage2Sizing(model.trim());
    const isHighResolution = isHighResolutionSize(size);
    const modelMissing = !model.trim();

    React.useEffect(() => {
        if (isHighResolution && model.trim() !== GPT_IMAGE_2_PRO_MODEL) {
            setModel(GPT_IMAGE_2_PRO_MODEL);
        }
    }, [isHighResolution, model, setModel]);

    React.useEffect(() => {
        if (isHighResolution && n[0] !== 1) {
            setN([1]);
        }
    }, [isHighResolution, n, setN]);

    // Reset transparent background when switching to gpt-image-2 (not supported)
    React.useEffect(() => {
        if (isGptImage2 && background === 'transparent') {
            setBackground('auto');
        }
    }, [isGptImage2, background, setBackground]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData: GenerationFormData = {
            prompt,
            n: isHighResolution ? 1 : n[0],
            size,
            quality,
            output_format: outputFormat,
            background,
            moderation,
            model
        };
        if (showCompression) {
            formData.output_compression = compression[0];
        }
        onSubmit(formData);
    };

    return (
        <Card className='flex h-full w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-black'>
            <CardHeader className='flex items-start justify-between border-b border-white/10 pb-4'>
                <div>
                    <div className='flex items-center'>
                        <CardTitle className='py-1 text-lg font-medium text-white'>
                            {t('form.generate.title')}
                        </CardTitle>
                        {isPasswordRequiredByBackend && (
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={onOpenPasswordDialog}
                                className='ml-2 text-white/60 hover:text-white'
                                aria-label={t('page.configurePassword')}>
                                {clientPasswordHash ? <Lock className='h-4 w-4' /> : <LockOpen className='h-4 w-4' />}
                            </Button>
                        )}
                    </div>
                    <CardDescription className='mt-1 text-white/60'>{t('form.generate.description')}</CardDescription>
                </div>
                <ModeToggle currentMode={currentMode} onModeChange={onModeChange} />
            </CardHeader>
            <form onSubmit={handleSubmit} className='flex h-full flex-1 flex-col overflow-hidden'>
                <CardContent className='flex-1 space-y-5 overflow-y-auto p-4'>
                    <div className='space-y-1.5'>
                        <Label htmlFor='prompt' className='text-white'>
                            {t('common.prompt')}
                        </Label>
                        <Textarea
                            id='prompt'
                            placeholder={t('form.generate.promptPlaceholder')}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            required
                            disabled={isLoading}
                            className='min-h-[80px] rounded-md border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/50'
                        />
                    </div>

                    <ModelSelect
                        id='generation-model'
                        customInputId='generation-custom-model'
                        model={model}
                        modelOptions={modelOptions}
                        onModelChange={setModel}
                        disabledModels={isHighResolution ? [GPT_IMAGE_2_STANDARD_MODEL] : []}
                        disabledModelReason={t('form.sizeProOnly')}
                        disabled={isLoading}
                    />

                    <div className='space-y-2'>
                        <Label htmlFor='n-slider' className='text-white'>
                            {t('form.numberOfImages', { count: n[0] })}
                        </Label>
                        <Slider
                            id='n-slider'
                            min={1}
                            max={isHighResolution ? 1 : 10}
                            step={1}
                            value={n}
                            onValueChange={(value) => setN(isHighResolution ? [1] : value)}
                            disabled={isLoading || isHighResolution}
                            className='mt-3 [&>button]:border-black [&>button]:bg-white [&>button]:ring-offset-black [&>span:first-child]:h-1 [&>span:first-child>span]:bg-white'
                        />
                        {isHighResolution && <p className='text-xs text-white/45'>{t('form.highResSingleImage')}</p>}
                    </div>

                    <SizeSelect
                        id='generation-size'
                        size={size}
                        onSizeChange={setSize}
                        mode='generate'
                        disabled={isLoading}
                    />

                    <div className='space-y-3'>
                        <div>
                            <Label className='block text-white'>{t('common.quality')}</Label>
                            <p className='mt-1 text-xs text-white/50'>{t('form.qualityDescription')}</p>
                        </div>
                        <RadioGroup
                            value={quality}
                            onValueChange={(value) => setQuality(value as GenerationFormData['quality'])}
                            disabled={isLoading}
                            className='flex flex-wrap gap-x-5 gap-y-3'>
                            <RadioItemWithIcon
                                value='auto'
                                id='quality-auto'
                                label={t('common.auto')}
                                Icon={Sparkles}
                            />
                            <RadioItemWithIcon value='low' id='quality-low' label={t('common.low')} Icon={Tally1} />
                            <RadioItemWithIcon
                                value='medium'
                                id='quality-medium'
                                label={t('common.medium')}
                                Icon={Tally2}
                            />
                            <RadioItemWithIcon value='high' id='quality-high' label={t('common.high')} Icon={Tally3} />
                        </RadioGroup>
                    </div>

                    {!isGptImage2 && (
                        <div className='space-y-3'>
                            <Label className='block text-white'>{t('common.background')}</Label>
                            <RadioGroup
                                value={background}
                                onValueChange={(value) => setBackground(value as GenerationFormData['background'])}
                                disabled={isLoading}
                                className='flex flex-wrap gap-x-5 gap-y-3'>
                                <RadioItemWithIcon value='auto' id='bg-auto' label={t('common.auto')} Icon={Sparkles} />
                                <RadioItemWithIcon
                                    value='opaque'
                                    id='bg-opaque'
                                    label={t('common.opaque')}
                                    Icon={BrickWall}
                                />
                                <RadioItemWithIcon
                                    value='transparent'
                                    id='bg-transparent'
                                    label={t('common.transparent')}
                                    Icon={Eraser}
                                />
                            </RadioGroup>
                        </div>
                    )}

                    <div className='space-y-3'>
                        <Label className='block text-white'>{t('common.outputFormat')}</Label>
                        <RadioGroup
                            value={outputFormat}
                            onValueChange={(value) => setOutputFormat(value as GenerationFormData['output_format'])}
                            disabled={isLoading}
                            className='flex flex-wrap gap-x-5 gap-y-3'>
                            <RadioItemWithIcon value='png' id='format-png' label='PNG' Icon={FileImage} />
                            <RadioItemWithIcon value='jpeg' id='format-jpeg' label='JPEG' Icon={FileImage} />
                            <RadioItemWithIcon value='webp' id='format-webp' label='WebP' Icon={FileImage} />
                        </RadioGroup>
                    </div>

                    {showCompression && (
                        <div className='space-y-2 pt-2 transition-opacity duration-300'>
                            <Label htmlFor='compression-slider' className='text-white'>
                                {t('common.compression')}: {compression[0]}%
                            </Label>
                            <Slider
                                id='compression-slider'
                                min={0}
                                max={100}
                                step={1}
                                value={compression}
                                onValueChange={setCompression}
                                disabled={isLoading}
                                className='mt-3 [&>button]:border-black [&>button]:bg-white [&>button]:ring-offset-black [&>span:first-child]:h-1 [&>span:first-child>span]:bg-white'
                            />
                        </div>
                    )}

                    <div className='space-y-3'>
                        <Label className='block text-white'>{t('common.moderationLevel')}</Label>
                        <p className='text-xs text-white/50'>{t('form.moderationDescription')}</p>
                        <RadioGroup
                            value={moderation}
                            onValueChange={(value) => setModeration(value as GenerationFormData['moderation'])}
                            disabled={isLoading}
                            className='flex flex-wrap gap-x-5 gap-y-3'>
                            <RadioItemWithIcon value='auto' id='mod-auto' label={t('common.auto')} Icon={ShieldCheck} />
                            <RadioItemWithIcon value='low' id='mod-low' label={t('common.low')} Icon={ShieldAlert} />
                        </RadioGroup>
                    </div>
                </CardContent>
                <CardFooter className='border-t border-white/10 p-4'>
                    <Button
                        type='submit'
                        disabled={isLoading || !prompt || modelMissing}
                        translate='no'
                        className='flex w-full items-center justify-center gap-2 rounded-md bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/40'>
                        <Loader2
                            aria-hidden='true'
                            className={`h-4 w-4 ${isLoading ? 'animate-spin opacity-100' : 'hidden opacity-0'}`}
                        />
                        <span>{isLoading ? t('form.generate.buttonLoading') : t('form.generate.button')}</span>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
