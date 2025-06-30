'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '../lib/types';

interface QuestionRendererProps {
  question: Question;
  value: any;
  observationsValue?: string;
  aiAwareValue?: string;
  onChange: (value: any) => void;
  onObservationsChange?: (value: string) => void;
  onAiAwareChange?: (value: string) => void;
  className?: string;
}

export default function QuestionRenderer({
  question,
  value,
  observationsValue = '',
  aiAwareValue = '',
  onChange,
  onObservationsChange,
  onAiAwareChange,
  className = ''
}: QuestionRendererProps) {
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});

  // Initialize slider values
  useEffect(() => {
    if (question.responseType === 'slider' && question.options) {
      const initialValues: Record<string, number> = {};
      question.options.forEach(option => {
        initialValues[option] = value?.[option] || 0;
      });
      setSliderValues(initialValues);
    }
  }, [question, value]);

  const handleSliderChange = (option: string, newValue: number) => {
    const newValues = { ...sliderValues, [option]: newValue };
    setSliderValues(newValues);
    onChange(newValues);
  };

  const renderInput = () => {
    switch (question.responseType) {
      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label 
                key={index} 
                className="flex items-center space-x-3 p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-5 h-5 text-teal-400 bg-transparent border-2 border-teal-400/50 focus:ring-teal-400 focus:ring-2 focus:ring-offset-0"
                />
                <span className="text-gray-200 group-hover:text-white transition-colors">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label 
                key={index} 
                className="flex items-center space-x-3 p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentArray = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentArray, option]);
                    } else {
                      onChange(currentArray.filter(item => item !== option));
                    }
                  }}
                  className="w-5 h-5 text-teal-400 bg-transparent border-2 border-teal-400/50 focus:ring-teal-400 focus:ring-2 focus:ring-offset-0 rounded"
                />
                <span className="text-gray-200 group-hover:text-white transition-colors">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'slider':
        const total = Object.values(sliderValues).reduce((sum, val) => sum + val, 0);
        return (
          <div className="space-y-4">
            <div className="mb-4 p-3 rounded-lg backdrop-blur-sm bg-teal-500/10 border border-teal-400/20">
              <div className="text-sm text-teal-300 mb-1">Total: {total}%</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-teal-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(total, 100)}%` }}
                />
              </div>
              {total > 100 && (
                <div className="text-xs text-red-400 mt-1">
                  Total excede 100%. Ajuste os valores.
                </div>
              )}
            </div>
            
            {question.options?.map((option, index) => (
              <div key={index} className="p-4 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-200 text-sm font-medium">{option}</label>
                  <span className="text-teal-400 font-semibold">{sliderValues[option] || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={sliderValues[option] || 0}
                  onChange={(e) => handleSliderChange(option, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full p-4 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none transition-all duration-200"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-4 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${className}`}>
      {/* Question Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2 leading-relaxed">
          {question.questionText}
        </h3>
        {question.required && (
          <span className="text-red-400 text-sm">* Obrigatório</span>
        )}
      </div>

      {/* Main Input */}
      <div className="mb-6">
        {renderInput()}
      </div>

      {/* Additional Field */}
      {question.additionalField && (
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-3">
            {question.additionalField}
          </label>
          <input
            type="text"
            value={value?.additionalField || ''}
            onChange={(e) => onChange({ ...value, additionalField: e.target.value })}
            className="w-full p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
            placeholder="Descreva..."
          />
        </div>
      )}

      {/* Observações Field (Visible to Client) */}
      <div className="mb-6">
        <label className="block text-gray-300 text-sm font-medium mb-3">
          💬 Observações (opcional)
        </label>
        <textarea
          value={observationsValue}
          onChange={(e) => onObservationsChange?.(e.target.value)}
          placeholder="Adicione qualquer contexto adicional, especificações ou observações relevantes..."
          rows={3}
          className="w-full p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none transition-all duration-200"
        />
      </div>

      {/* IA-Aware Field (Hidden from Client) */}
      <input
        type="hidden"
        value={aiAwareValue}
        onChange={(e) => onAiAwareChange?.(e.target.value)}
      />
    </div>
  );
}