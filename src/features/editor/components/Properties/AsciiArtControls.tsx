'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal,
  Upload,
  Link as LinkIcon,
  User,
  Sparkles,
  RefreshCw,
  Sun,
  Contrast,
  Sliders,
  Palette,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { CHARSETS, convertImageToAsciiCanvas, type AsciiConvertOptions } from '@/engine/ascii/converter';
import { useEditorStore } from '../../store/editorStore';
import { useI18n } from '@/i18n';

interface AsciiArtControlsProps {
  instanceId: string;
  config: Record<string, unknown>;
}

const CHARSET_OPTIONS = [
  { id: 'dense', name: 'DENSE GRADIENT', preview: '"$@B%8&WM#*oahk', info: '67 chars - Máxima Precisão' },
  { id: 'standard', name: 'STANDARD', preview: ' .:-=+*#%@', info: '10 chars' },
  { id: 'blocks', name: 'BLOCKS / SHADING', preview: ' ░▒▓█', info: '5 chars' },
  { id: 'dots', name: 'BRAILLE / DOTS', preview: ' ⠁⠃⠇⡇⣇⣿', info: '7 chars' },
  { id: 'matrix', name: 'MATRIX / HEX', preview: ' 0123456789ABCDEF', info: '16 chars' },
  { id: 'ascii', name: 'CLASSIC ASCII', preview: " .',:;!|/>(){}", info: '13 chars' },
  { id: 'binary', name: 'BINARY', preview: ' 01010101', info: '2 chars' },
  { id: 'slash', name: 'SLASH PATTERN', preview: ' \\/|/\\/|', info: '3 chars' },
  { id: 'retro', name: 'RETRO ORBS', preview: ' .oO@Oop', info: '5 chars' },
  { id: 'minimal', name: 'MINIMAL', preview: ' .*#*.*#', info: '4 chars' },
  { id: 'custom', name: 'CUSTOMIZADO', preview: ' [ Digitar... ]', info: 'Personalizado' },
];

export function AsciiArtControls({ instanceId, config }: AsciiArtControlsProps) {
  const { t } = useI18n();
  const { githubData, updateWidgetConfig } = useEditorStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCharsetMenuOpen, setIsCharsetMenuOpen] = useState(false);

  const sourceType = (config.sourceType as 'avatar' | 'url' | 'upload') || 'avatar';
  const customImageUrl = (config.imageUrl as string) || '';
  const uploadedImageData = (config.uploadedImageData as string) || '';

  const charset = (config.charset as string) || 'dense';
  const customCharset = (config.customCharset as string) || '';
  const invert = Boolean(config.invert);

  const detail = (config.detail as 'low' | 'medium' | 'high' | 'ultra' | 'custom') || 'medium';
  const cols = Number(config.cols) || (detail === 'low' ? 28 : detail === 'medium' ? 45 : detail === 'high' ? 85 : 150);

  const contrast = Number(config.contrast !== undefined ? config.contrast : 10);
  const brightness = Number(config.brightness !== undefined ? config.brightness : 0);
  const edgeEnhance = Boolean(config.edgeEnhance !== undefined ? config.edgeEnhance : true);
  const autoContrast = Boolean(config.autoContrast !== false);
  const dithering = Boolean(config.dithering !== false);
  const colorMode = (config.colorMode as 'monochrome' | 'color') || 'monochrome';

  const getActiveImageSource = useCallback(() => {
    if (sourceType === 'upload' && uploadedImageData) {
      return uploadedImageData;
    }
    if (sourceType === 'url' && customImageUrl) {
      return customImageUrl;
    }
    return githubData?.user.avatar_url || 'https://github.com/github.png';
  }, [sourceType, uploadedImageData, customImageUrl, githubData]);

  const processImageToAscii = useCallback(async () => {
    const imgSrc = getActiveImageSource();
    if (!imgSrc) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const options: AsciiConvertOptions = {
        charset,
        customCharset,
        invert,
        cols,
        contrast,
        brightness,
        edgeEnhance,
        autoContrast,
        dithering,
        colorMode,
      };

      const result = await convertImageToAsciiCanvas(imgSrc, options);

      updateWidgetConfig(instanceId, {
        asciiText: result.lines,
        asciiColors: result.colorMatrix,
        cols: result.cols,
        rows: result.rows,
      });
    } catch (err: unknown) {
      console.warn('ASCII Conversion Warning:', err);
      setErrorMsg(t('editor.ascii.error_cors', 'Não foi possível converter a imagem (CORS/URL restrita). Faça o upload do arquivo para melhores resultados.'));
    } finally {
      setIsProcessing(false);
    }
  }, [getActiveImageSource, charset, customCharset, invert, cols, contrast, brightness, edgeEnhance, autoContrast, dithering, colorMode, updateWidgetConfig, instanceId]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!config.asciiText) {
        processImageToAscii();
      }
      return;
    }

    const timer = setTimeout(() => {
      processImageToAscii();
    }, 150);

    return () => clearTimeout(timer);
  }, [sourceType, customImageUrl, uploadedImageData, charset, customCharset, invert, detail, cols, contrast, brightness, edgeEnhance, autoContrast, dithering, colorMode, processImageToAscii]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(t('editor.ascii.error_invalid_image', 'Por favor selecione um arquivo de imagem válido.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        updateWidgetConfig(instanceId, {
          sourceType: 'upload',
          uploadedImageData: base64Data,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const selectedCharsetObj = CHARSET_OPTIONS.find((c) => c.id === charset) || CHARSET_OPTIONS[0];

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <Terminal size={14} />
          <span>{t('editor.ascii.title', 'Editor de Foto em ASCII')}</span>
        </div>
        <button
          onClick={() => processImageToAscii()}
          disabled={isProcessing}
          className="flex items-center gap-1 text-caption text-ash hover:text-signal-lime transition-colors disabled:opacity-50"
          title={t('editor.ascii.regenerate', 'Regerar Arte ASCII')}
        >
          <RefreshCw size={12} className={isProcessing ? 'animate-spin text-signal-lime' : ''} />
          <span>{isProcessing ? t('editor.ascii.converting', 'Convertendo...') : t('editor.ascii.update', 'Atualizar')}</span>
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-eyebrow text-ash font-medium block">{t('editor.ascii.source', 'Origem da Foto')}</label>
        <div className="grid grid-cols-3 gap-1 bg-carbon p-1 rounded border border-graphite">
          <button
            type="button"
            onClick={() => updateWidgetConfig(instanceId, { sourceType: 'avatar' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-eyebrow font-medium transition-all ${sourceType === 'avatar'
                ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                : 'text-ash hover:text-chalk'
              }`}
          >
            <User size={12} />
            <span>GitHub</span>
          </button>
          <button
            type="button"
            onClick={() => updateWidgetConfig(instanceId, { sourceType: 'url' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-eyebrow font-medium transition-all ${sourceType === 'url'
                ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                : 'text-ash hover:text-chalk'
              }`}
          >
            <LinkIcon size={12} />
            <span>URL</span>
          </button>
          <button
            type="button"
            onClick={() => {
              updateWidgetConfig(instanceId, { sourceType: 'upload' });
              if (!uploadedImageData) {
                fileInputRef.current?.click();
              }
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-eyebrow font-medium transition-all ${sourceType === 'upload'
                ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                : 'text-ash hover:text-chalk'
              }`}
          >
            <Upload size={12} />
            <span>Upload</span>
          </button>
        </div>

        {sourceType === 'url' && (
          <input
            type="text"
            value={customImageUrl}
            onChange={(e) => updateWidgetConfig(instanceId, { imageUrl: e.target.value })}
            placeholder="https://exemplo.com/sua-foto.jpg"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2.5 py-1.5 rounded focus:border-signal-lime focus:outline-none"
          />
        )}

        {sourceType === 'upload' && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-graphite hover:border-signal-lime/60 bg-carbon hover:bg-graphite/40 text-chalk text-eyebrow py-2 px-3 rounded flex items-center justify-center gap-2 transition-all"
            >
              <Upload size={13} className="text-signal-lime" />
              <span>{uploadedImageData ? t('editor.ascii.change_photo', 'Trocar Foto Uploaded') : t('editor.ascii.select_photo', 'Selecionar Foto Local')}</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-1.5 text-caption text-amber-400 bg-amber-950/30 p-2 rounded border border-amber-900/50">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-graphite/50 relative">
        <label className="text-eyebrow text-ash font-medium block">Conjunto de Caracteres (Base)</label>

        <button
          type="button"
          onClick={() => setIsCharsetMenuOpen(!isCharsetMenuOpen)}
          className="w-full bg-graphite border border-graphite hover:border-signal-lime/50 p-2.5 rounded text-left flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="font-jetbrains-mono bg-carbon text-signal-lime text-eyebrow px-2 py-0.5 rounded border border-graphite font-bold shrink-0">
              {selectedCharsetObj.preview}
            </span>
            <div className="truncate">
              <div className="text-eyebrow text-chalk font-semibold leading-tight">{selectedCharsetObj.name}</div>
              <div className="text-[9px] text-ash">{selectedCharsetObj.info}</div>
            </div>
          </div>
          <ChevronDown size={14} className={`text-ash transition-transform shrink-0 ${isCharsetMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isCharsetMenuOpen && (
          <div className="absolute z-50 left-0 right-0 top-15 bg-carbon border border-graphite rounded shadow-xl max-h-60 overflow-y-auto p-1 space-y-1">
            {CHARSET_OPTIONS.map((item) => {
              const isSelected = item.id === charset;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    updateWidgetConfig(instanceId, { charset: item.id });
                    setIsCharsetMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded flex items-center justify-between transition-all ${isSelected
                      ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                      : 'hover:bg-graphite/60 text-chalk'
                    }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-jetbrains-mono bg-void-black text-signal-lime text-eyebrow px-2 py-0.5 rounded border border-graphite font-semibold shrink-0">
                      {item.preview}
                    </span>
                    <span className="text-eyebrow font-medium truncate">{item.name}</span>
                  </div>
                  <span className="text-[9px] text-ash shrink-0">{item.info}</span>
                </button>
              );
            })}
          </div>
        )}

        {charset === 'custom' && (
          <input
            type="text"
            value={customCharset}
            onChange={(e) => updateWidgetConfig(instanceId, { customCharset: e.target.value })}
            placeholder="Ex:  .-+*#@"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2.5 py-1.5 rounded focus:border-signal-lime focus:outline-none font-jetbrains-mono mt-1"
          />
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-eyebrow text-chalk font-medium">{t('editor.ascii.invert_chars', 'Inverter Caracteres (Invert)')}</span>
          <input
            type="checkbox"
            checked={invert}
            onChange={(e) => updateWidgetConfig(instanceId, { invert: e.target.checked })}
            className="w-4 h-4 accent-signal-lime cursor-pointer rounded"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-graphite/50">
        <div className="flex items-center justify-between">
          <label className="text-eyebrow text-ash font-medium">{t('editor.ascii.detail_level', 'Nível de Detalhe (Colunas)')}</label>
          <span className="text-eyebrow text-signal-lime font-mono font-semibold">{cols} cols</span>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'low', label: t('editor.ascii.low', 'Baixo'), c: 28 },
            { id: 'medium', label: t('editor.ascii.medium', 'Médio'), c: 45 },
            { id: 'high', label: t('editor.ascii.high', 'Alto'), c: 85 },
            { id: 'ultra', label: t('editor.ascii.ultra', 'Ultra'), c: 150 },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { detail: item.id, cols: item.c })}
              className={`py-1 text-caption font-medium rounded border transition-all ${cols === item.c || detail === item.id
                  ? 'bg-signal-lime text-black border-signal-lime font-semibold'
                  : 'bg-graphite text-ash border-graphite hover:text-chalk'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <input
          type="range"
          min={16}
          max={150}
          step={2}
          value={cols}
          onChange={(e) => updateWidgetConfig(instanceId, { cols: Number(e.target.value), detail: 'custom' })}
          className="w-full accent-signal-lime bg-graphite h-1.5 rounded cursor-pointer"
        />
      </div>

      <div className="space-y-3 pt-2 border-t border-graphite/50">
        <div className="flex items-center gap-1.5 text-ash text-eyebrow font-medium">
          <Sliders size={13} />
          <span>{t('editor.ascii.photo_adjustments', 'Ajustes de Fotografia')}</span>
        </div>

        <div>
          <div className="flex items-center justify-between text-eyebrow mb-1">
            <span className="text-ash flex items-center gap-1">
              <Contrast size={12} /> {t('editor.ascii.contrast', 'Contraste')}
            </span>
            <span className="text-chalk font-mono">{contrast > 0 ? `+${contrast}` : contrast}</span>
          </div>
          <input
            type="range"
            min={-80}
            max={80}
            step={5}
            value={contrast}
            onChange={(e) => updateWidgetConfig(instanceId, { contrast: Number(e.target.value) })}
            className="w-full accent-signal-lime bg-graphite h-1.5 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-eyebrow mb-1">
            <span className="text-ash flex items-center gap-1">
              <Sun size={12} /> {t('editor.ascii.brightness', 'Brilho')}
            </span>
            <span className="text-chalk font-mono">{brightness > 0 ? `+${brightness}` : brightness}</span>
          </div>
          <input
            type="range"
            min={-80}
            max={80}
            step={5}
            value={brightness}
            onChange={(e) => updateWidgetConfig(instanceId, { brightness: Number(e.target.value) })}
            className="w-full accent-signal-lime bg-graphite h-1.5 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-eyebrow text-chalk font-medium flex items-center gap-1.5">
            <Sparkles size={13} className="text-signal-lime" /> {t('editor.ascii.edge_enhance', 'Realçar Contornos (Rosto)')}
          </span>
          <input
            type="checkbox"
            checked={edgeEnhance}
            onChange={(e) => updateWidgetConfig(instanceId, { edgeEnhance: e.target.checked })}
            className="w-4 h-4 accent-signal-lime cursor-pointer rounded"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-eyebrow text-chalk font-medium">{t('editor.ascii.auto_contrast', 'Auto-Contraste (Gama Dinâmica)')}</span>
          <input
            type="checkbox"
            checked={autoContrast}
            onChange={(e) => updateWidgetConfig(instanceId, { autoContrast: e.target.checked })}
            className="w-4 h-4 accent-signal-lime cursor-pointer rounded"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-eyebrow text-chalk font-medium">{t('editor.ascii.dithering', 'Pontilhado Fotográfico (Dithering)')}</span>
          <input
            type="checkbox"
            checked={dithering}
            onChange={(e) => updateWidgetConfig(instanceId, { dithering: e.target.checked })}
            className="w-4 h-4 accent-signal-lime cursor-pointer rounded"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-eyebrow text-chalk font-medium flex items-center gap-1.5">
            <Palette size={13} className="text-signal-lime" /> {t('editor.ascii.color_mode', 'Modo de Cores')}
          </span>
          <div className="flex items-center gap-1 bg-carbon p-0.5 rounded border border-graphite">
            <button
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { colorMode: 'monochrome' })}
              className={`px-2 py-0.5 rounded text-caption font-medium transition-all ${colorMode === 'monochrome'
                  ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                  : 'text-ash hover:text-chalk'
                }`}
            >
              Mono
            </button>
            <button
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { colorMode: 'color' })}
              className={`px-2 py-0.5 rounded text-caption font-medium transition-all ${colorMode === 'color'
                  ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                  : 'text-ash hover:text-chalk'
                }`}
            >
              Colorido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
