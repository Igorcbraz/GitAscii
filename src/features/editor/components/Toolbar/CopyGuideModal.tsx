'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  FileEdit,
  Pencil,
  ClipboardPaste,
  Eye,
  Sparkles,
} from 'lucide-react';

interface CopyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  embedCode: string;
}

const STEPS = [
  {
    icon: FileEdit,
    title: 'Edite o README.md',
    description: 'Abra o seu repositório especial (username/username) no GitHub, clique no arquivo README.md e depois no ícone de editar para modificá-lo.',
    descriptionIcon: Pencil,
    linkLabel: 'Editar README',
    getLinkUrl: (username: string) =>
      `https://github.com/${username}/${username}/edit/main/README.md`,
  },
  {
    icon: ClipboardPaste,
    title: 'Cole o código',
    description:
      'Cole o código copiado (Ctrl+V / ⌘+V) no local desejado do seu README.',
    descriptionIcon: null,
    linkLabel: null,
    getLinkUrl: () => '',
  },
  {
    icon: Eye,
    title: 'Salve e confira',
    description:
      'Clique em "Commit changes" para salvar. Depois, acesse seu perfil para ver o resultado!',
    descriptionIcon: null,
    linkLabel: 'Ver meu perfil',
    getLinkUrl: (username: string) => `https://github.com/${username}`,
  },
];

export function CopyGuideModal({
  isOpen,
  onClose,
  username,
  embedCode,
}: CopyGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [reCopied, setReCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  }, [onClose]);

  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      setDontShowAgain(localStorage.getItem('gitascii_skip_copy_guide') === 'true');
    }
  }, [isOpen]);

  const handleReCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setReCopied(true);
    setTimeout(() => setReCopied(false), 2000);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (!isOpen || !mounted) return null;

  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const linkUrl = step.getLinkUrl(username);
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-100 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      <div
        className={`fixed z-101 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-130 transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      >
        <div className="bg-onyx border border-graphite rounded-lg overflow-hidden shadow-2xl">
          <div className="relative px-6 pt-5 pb-4 border-b border-graphite">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-signal-lime/10 border border-signal-lime/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-signal-lime" />
                </div>
                <div>
                  <h2 className="font-inter-tight font-semibold text-body text-chalk">
                    Código copiado!
                  </h2>
                  <p className="text-caption text-ash mt-0.5">
                    Siga os passos para adicionar ao seu perfil
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-md hover:bg-graphite text-ash hover:text-chalk transition-colors cursor-pointer"
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-1.5 mt-4">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-1 rounded-full overflow-hidden bg-iron cursor-pointer transition-colors"
                  onClick={() => setCurrentStep(idx)}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${idx < currentStep
                      ? 'bg-signal-lime w-full'
                      : idx === currentStep
                        ? 'bg-signal-lime w-full animate-pulse-glow-bar'
                        : 'w-0'
                      }`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-6" key={currentStep}>
            <div className="flex items-start gap-4 animate-guide-fade-in">
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-lg bg-signal-lime/10 border border-signal-lime/25 flex items-center justify-center relative">
                  <StepIcon size={20} className="text-signal-lime" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-signal-lime text-black text-caption font-bold flex items-center justify-center font-inter-tight">
                    {currentStep + 1}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-inter-tight font-semibold text-[15px] text-chalk mb-1.5">
                  {step.title}
                </h3>
                <p className="text-label text-pearl leading-relaxed mb-3 inline-flex items-center flex-wrap gap-1">
                  {step.descriptionIcon ? (
                    <>
                      {step.description.split('ícone de editar').map((part, i, arr) =>
                        i < arr.length - 1 ? (
                          <React.Fragment key={i}>
                            {part}<span className="inline-flex items-center gap-0.5">ícone de editar <step.descriptionIcon size={14} className="text-signal-lime inline" /></span>
                          </React.Fragment>
                        ) : (
                          <React.Fragment key={i}>{part}</React.Fragment>
                        )
                      )}
                    </>
                  ) : (
                    step.description
                  )}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  {step.linkLabel && linkUrl && (
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors"
                    >
                      <ExternalLink size={12} />
                      <span>{step.linkLabel}</span>
                    </a>
                  )}
                  {currentStep === 1 && (
                    <button
                      onClick={handleReCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors cursor-pointer"
                    >
                      {reCopied ? (
                        <Check size={12} className="text-signal-lime" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>{reCopied ? 'Copiado!' : 'Copiar novamente'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 pb-5">
            <button
              onClick={() => {
                const newValue = !dontShowAgain;
                setDontShowAgain(newValue);
                if (newValue) {
                  localStorage.setItem('gitascii_skip_copy_guide', 'true');
                } else {
                  localStorage.removeItem('gitascii_skip_copy_guide');
                }
              }}
              className="inline-flex items-center gap-2.5 text-ash hover:text-chalk transition-colors cursor-pointer select-none group"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${dontShowAgain
                  ? 'bg-signal-lime border-signal-lime text-black'
                  : 'bg-void-black border-graphite group-hover:border-ash'
                }`}>
                {dontShowAgain && <Check size={10} strokeWidth={3.5} />}
              </div>
              <span className="font-inter-tight font-medium text-label">Não mostrar este guia novamente</span>
            </button>
          </div>
          <div className="px-6 py-4 border-t border-graphite flex items-center justify-between">
            <div className="text-caption text-ash font-inter-tight">
              Passo {currentStep + 1} de {STEPS.length}
            </div>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Voltar</span>
                </button>
              )}

              {!isLastStep ? (
                <button
                  onClick={nextStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>Próximo</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                >
                  <Check size={14} />
                  <span>Concluir</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
