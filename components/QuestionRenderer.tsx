import React from 'react';
import { Question, ResponseType } from '../lib/types'; // Importe Question e ResponseType

interface QuestionRendererProps {
  question: Question;
  value: any; // Pode ser string, number, string[] ou um objeto para slider
  observationsValue: string;
  aiAwareValue: string; // Agora 'aiAwareValue' para corresponder a 'aiAwareNotes' no types.ts
  onChange: (value: any) => void;
  onObservationsChange: (value: string) => void;
  onAiAwareChange: (value: string) => void; // Agora 'onAiAwareChange'
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  observationsValue,
  aiAwareValue,
  onChange,
  onObservationsChange,
  onAiAwareChange,
}) => {
  const { id, questionText, responseType, options, placeholder, additionalField } = question;

  // Renderiza o input principal da pergunta baseado no tipo de resposta
  const renderQuestionInput = () => {
    switch (responseType) {
      case 'text':
        return (
          <input
            id={id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
            placeholder={placeholder}
          />
        );
      case 'number':
        return (
          <input
            id={id}
            type="number"
            value={value !== undefined && value !== null ? value : ''} // Garante que 0 não seja tratado como vazio
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
            placeholder={placeholder}
          />
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <label key={option} className="flex items-center text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name={id}
                  value={option}
                  checked={value === option}
                  onChange={() => onChange(option)}
                  className="form-radio h-5 w-5 text-teal-400 bg-white/10 border-white/30 focus:ring-teal-400"
                />
                <span className="ml-3">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <label key={option} className="flex items-center text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  name={id}
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter((val) => val !== option));
                    }
                  }}
                  className="form-checkbox h-5 w-5 text-teal-400 bg-white/10 border-white/30 rounded focus:ring-teal-400"
                />
                <span className="ml-3">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'slider':
        // Para o tipo slider com opções, assumimos que o "value" é um objeto {option: percentage}
        return (
          <div className="space-y-4">
            {options?.map(option => (
              <div key={option} className="flex items-center gap-4">
                <label htmlFor={`${id}-${option}`} className="text-gray-300 w-1/3 min-w-[120px]">{option}:</label>
                <input
                  id={`${id}-${option}`}
                  type="number"
                  min="0"
                  max="100"
                  step="1" // Permite apenas números inteiros
                  value={(value && value[option] !== undefined) ? value[option] : ''}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    onChange({
                      ...(typeof value === 'object' && value !== null ? value : {}), // Garante que 'value' é um objeto
                      [option]: isNaN(newValue) ? '' : newValue // Armazena string vazia se não for um número
                    });
                  }}
                  className="flex-grow p-2 rounded-md bg-white/10 border border-white/20 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="%"
                />
              </div>
            ))}
            {/* Opcional: Exibir a soma total dos sliders percentuais */}
            {options && options.length > 0 && (
              <p className="text-sm text-gray-400 mt-2 text-right">
                Total da soma: {
                  options.reduce((sum, option) => {
                    const val = value && typeof value === 'object' && typeof value[option] === 'number' ? value[option] : 0;
                    return sum + val;
                  }, 0).toFixed(0) // Arredonda para não ter muitas casas decimais
                }%
              </p>
            )}
          </div>
        );
      case 'select':
        return (
          <select
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
          >
            <option value="" disabled>{placeholder || 'Selecione uma opção'}</option>
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return <p className="text-red-500">Tipo de resposta não suportado: {responseType}</p>;
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-lg font-semibold text-white mb-4">
        {questionText}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {renderQuestionInput()}

      {additionalField && (
        <p className="text-sm text-gray-400 mt-2 italic">{additionalField}</p>
      )}

      {/* Campo de Observações */}
      <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
        <label htmlFor={`${id}-observations`} className="block text-sm font-medium text-gray-300 mb-2">
          Observações para esta pergunta:
        </label>
        <textarea
          id={`${id}-observations`}
          rows={3}
          value={observationsValue}
          onChange={(e) => onObservationsChange(e.target.value)}
          className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          placeholder="Adicione qualquer nota relevante ou detalhe adicional aqui..."
        ></textarea>
      </div>

      {/* Campo AI-Aware Notes (interno/oculto) */}
      <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
        <label htmlFor={`${id}-ai-aware-notes`} className="block text-sm font-medium text-gray-300 mb-2">
          Notas para análise de IA (campo interno, não visível ao cliente):
        </label>
        <textarea
          id={`${id}-ai-aware-notes`}
          rows={3}
          value={aiAwareValue}
          onChange={(e) => onAiAwareChange(e.target.value)}
          className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          placeholder="Registre informações cruciais para a IA processar, como nuances ou contextos específicos."
        ></textarea>
      </div>
    </div>
  );
};

export default QuestionRenderer;
