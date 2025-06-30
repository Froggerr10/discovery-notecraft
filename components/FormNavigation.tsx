'use client';

import React from 'react';

interface FormNavigationProps {
  currentSection: number;
  totalSections: number;
  isCurrentSectionValid: boolean;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onSubmit: () => void;
  className?: string;
}

export default function FormNavigation({
  currentSection,
  totalSections,
  isCurrentSectionValid,
  isSubmitting,
  hasUnsavedChanges,
  onPrevious,
  onNext,
  onSave,
  onSubmit,
  className = ''
}: FormNavigationProps) {
  const isFirstSection = currentSection === 1;
  const isLastSection = currentSection === totalSections;
  const canGoNext = isCurrentSectionValid;

  return (
    <div className={`${className}`}>
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between p-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg">
        
        {/* Previous Button */}
        <div className="flex-1">
          {!isFirstSection && (
            <button
              onClick={onPrevious}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gray-600/20 border border-gray-500/30 text-gray-300 hover:bg-gray-600/30 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Anterior</span>
            </button>
          )}
        </div>

        {/* Center Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Save Draft Button */}
          <button
            onClick={onSave}
            disabled={isSubmitting || !hasUnsavedChanges}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Salvando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm">
                  {hasUnsavedChanges ? 'Salvar Rascunho' : 'Salvo'}
                </span>
              </>
            )}
          </button>

          {/* Section Counter */}
          <div className="px-4 py-2 rounded-lg bg-teal-500/20 border border-teal-400/30">
            <span className="text-teal-300 text-sm font-medium">
              {currentSection} / {totalSections}
            </span>
          </div>
        </div>

        {/* Next/Submit Button */}
        <div className="flex-1 flex justify-end">
          {isLastSection ? (
            <button
              onClick={onSubmit}
              disabled={!canGoNext || isSubmitting}
              className="flex items-center space-x-2 px-8 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Finalizar Discovery</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!canGoNext || isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-teal-600/30 border border-teal-500/50 text-teal-300 hover:bg-teal-600/50 hover:text-teal-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Próxima</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Validation Messages */}
      {!isCurrentSectionValid && (
        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-400/30">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-red-400 font-medium text-sm">Seção incompleta</h4>
              <p className="text-red-300 text-sm mt-1">
                Por favor, responda todas as perguntas obrigatórias antes de prosseguir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-yellow-400 font-medium text-sm">Alterações não salvas</h4>
              <p className="text-yellow-300 text-sm mt-1">
                Você tem alterações que ainda não foram salvas. Clique em "Salvar Rascunho" para não perder suas respostas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Hint */}
      <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">
            💡 <strong>Dica:</strong> Suas respostas são salvas automaticamente a cada mudança de seção
          </div>
          <div className="text-gray-500">
            ⌨️ Use Tab para navegar entre campos
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-2 text-center">
        <div className="text-xs text-gray-500 space-x-4">
          <span>Ctrl + ← Seção anterior</span>
          <span>•</span>
          <span>Ctrl + → Próxima seção</span>
          <span>•</span>
          <span>Ctrl + S Salvar</span>
        </div>
      </div>
    </div>
  );
}