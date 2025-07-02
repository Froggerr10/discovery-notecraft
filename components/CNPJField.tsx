/**
 * =====================================================
 * DISCOVERY NOTECRAFT™ - COMPONENTE CAMPO CNPJ
 * Campo especializado com validação e enriquecimento
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import { Building, CheckCircle, AlertCircle, Loader2, Search, RefreshCw } from 'lucide-react';
import { 
  validateCompanyCNPJ, 
  formatCompanyCNPJ, 
  enrichCompanyByCNPJ 
} from '../lib/cnpj-enrichment';
import { CompanyEnrichedData } from '../lib/cnpj-types';

interface CNPJFieldProps {
  value: string;
  onChange: (value: string, enrichedData?: CompanyEnrichedData) => void;
  onEnrichmentComplete?: (data: CompanyEnrichedData | null) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

interface ValidationState {
  isValid: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface EnrichmentState {
  isLoading: boolean;
  isComplete: boolean;
  data: CompanyEnrichedData | null;
  error: string | null;
}

export const CNPJField: React.FC<CNPJFieldProps> = ({
  value,
  onChange,
  onEnrichmentComplete,
  disabled = false,
  required = false,
  className = ''
}) => {
  const [validation, setValidation] = useState<ValidationState>({
    isValid: false,
    message: '',
    type: 'info'
  });
  
  const [enrichment, setEnrichment] = useState<EnrichmentState>({
    isLoading: false,
    isComplete: false,
    data: null,
    error: null
  });
  
  const [displayValue, setDisplayValue] = useState(value);

  // Atualizar valor formatado quando props.value mudar
  useEffect(() => {
    if (value !== displayValue.replace(/[^\d]/g, '')) {
      setDisplayValue(value ? formatCompanyCNPJ(value) : '');
    }
  }, [value]);

  // Validar CNPJ em tempo real
  useEffect(() => {
    if (!displayValue) {
      setValidation({
        isValid: false,
        message: required ? 'CNPJ é obrigatório' : '',
        type: 'info'
      });
      return;
    }

    const cleanCNPJ = displayValue.replace(/[^\d]/g, '');
    
    if (cleanCNPJ.length < 14) {
      setValidation({
        isValid: false,
        message: 'CNPJ incompleto',
        type: 'warning'
      });
      return;
    }

    if (cleanCNPJ.length === 14) {
      const isValid = validateCompanyCNPJ(cleanCNPJ);
      
      setValidation({
        isValid,
        message: isValid ? 'CNPJ válido' : 'CNPJ inválido',
        type: isValid ? 'success' : 'error'
      });

      // Enriquecer dados se válido
      if (isValid && !enrichment.isComplete) {
        handleEnrichment(cleanCNPJ);
      }
    }
  }, [displayValue, required, enrichment.isComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanValue = inputValue.replace(/[^\d]/g, '');
    
    // Limitar a 14 dígitos
    if (cleanValue.length <= 14) {
      const formatted = formatCompanyCNPJ(cleanValue);
      setDisplayValue(formatted);
      onChange(cleanValue, enrichment.data || undefined);
      
      // Reset enrichment se CNPJ mudou
      if (cleanValue !== value) {
        setEnrichment({
          isLoading: false,
          isComplete: false,
          data: null,
          error: null
        });
      }
    }
  };

  const handleEnrichment = async (cnpj: string) => {
    setEnrichment(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      console.log('🔍 Iniciando enriquecimento para CNPJ:', formatCompanyCNPJ(cnpj));
      
      const enrichedData = await enrichCompanyByCNPJ(cnpj);
      
      setEnrichment({
        isLoading: false,
        isComplete: true,
        data: enrichedData,
        error: null
      });

      // Notificar componente pai
      if (onEnrichmentComplete) {
        onEnrichmentComplete(enrichedData);
      }

      // Atualizar valor com dados enriquecidos
      onChange(cnpj, enrichedData);
      
      console.log('✅ Enriquecimento concluído:', enrichedData.razao_social);
      
    } catch (error) {
      console.error('❌ Erro no enriquecimento:', error);
      
      setEnrichment({
        isLoading: false,
        isComplete: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  const handleRetryEnrichment = () => {
    const cleanCNPJ = displayValue.replace(/[^\d]/g, '');
    if (validateCompanyCNPJ(cleanCNPJ)) {
      handleEnrichment(cleanCNPJ);
    }
  };

  const getValidationIcon = () => {
    if (enrichment.isLoading) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    
    switch (validation.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Building className="w-5 h-5 text-gray-400" />;
    }
  };

  const getValidationColor = () => {
    if (enrichment.isLoading) return 'border-blue-400 ring-blue-400';
    
    switch (validation.type) {
      case 'success':
        return 'border-green-400 ring-green-400';
      case 'error':
        return 'border-red-400 ring-red-400';
      case 'warning':
        return 'border-yellow-400 ring-yellow-400';
      default:
        return 'border-gray-600 ring-emerald-400';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Campo de input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
        
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          disabled={disabled || enrichment.isLoading}
          placeholder="00.000.000/0000-00"
          className={`
            w-full pl-12 pr-4 py-3 rounded-lg 
            bg-gray-800 text-white placeholder-gray-400
            border-2 transition-all duration-200
            focus:ring-2 focus:ring-opacity-50 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${getValidationColor()}
          `}
        />
        
        {/* Botão de retry se houver erro */}
        {enrichment.error && validation.isValid && (
          <button
            onClick={handleRetryEnrichment}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
            disabled={enrichment.isLoading}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mensagem de validação */}
      {validation.message && (
        <div className={`text-sm flex items-center space-x-2 ${
          validation.type === 'success' ? 'text-green-400' :
          validation.type === 'error' ? 'text-red-400' :
          validation.type === 'warning' ? 'text-yellow-400' :
          'text-gray-400'
        }`}>
          <span>{validation.message}</span>
        </div>
      )}

      {/* Status de enriquecimento */}
      {enrichment.isLoading && (
        <div className="text-sm text-blue-400 flex items-center space-x-2">
          <Search className="w-4 h-4" />
          <span>Buscando dados da empresa...</span>
        </div>
      )}

      {/* Erro de enriquecimento */}
      {enrichment.error && (
        <div className="text-sm text-red-400 flex items-center justify-between">
          <span>⚠️ {enrichment.error}</span>
          <button
            onClick={handleRetryEnrichment}
            className="text-blue-400 hover:text-blue-300 underline"
            disabled={enrichment.isLoading}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Dados enriquecidos */}
      {enrichment.isComplete && enrichment.data && (
        <EnrichedDataDisplay data={enrichment.data} />
      )}
    </div>
  );
};

// Componente para exibir dados enriquecidos
const EnrichedDataDisplay: React.FC<{ data: CompanyEnrichedData }> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 space-y-3">
      {/* Header com dados principais */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-green-400 text-sm">
            ✅ Dados encontrados
          </h4>
          <p className="text-white font-medium">
            {data.nome_fantasia || data.razao_social}
          </p>
          <p className="text-gray-400 text-sm">
            {data.cnae_principal.setor} • {data.porte_oficial} • {data.cidade}/{data.estado}
          </p>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-green-400 hover:text-green-300 text-sm underline"
        >
          {isExpanded ? 'Menos detalhes' : 'Ver detalhes'}
        </button>
      </div>

      {/* Dados básicos sempre visíveis */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Faturamento estimado:</span>
          <p className="text-white">{data.faturamento_faixa}</p>
        </div>
        <div>
          <span className="text-gray-400">Funcionários:</span>
          <p className="text-white">~{data.funcionarios_estimado}</p>
        </div>
      </div>

      {/* Detalhes expandidos */}
      {isExpanded && (
        <div className="border-t border-green-700/30 pt-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Razão Social:</span>
              <p className="text-white">{data.razao_social}</p>
            </div>
            <div>
              <span className="text-gray-400">Regime Tributário:</span>
              <p className="text-white">{data.regime_tributario}</p>
            </div>
            <div>
              <span className="text-gray-400">CNAE Principal:</span>
              <p className="text-white">{data.cnae_principal.codigo} - {data.cnae_principal.descricao}</p>
            </div>
            <div>
              <span className="text-gray-400">Situação:</span>
              <p className={`${data.situacao_ativa ? 'text-green-400' : 'text-red-400'}`}>
                {data.situacao_ativa ? 'Ativa' : 'Inativa'}
              </p>
            </div>
          </div>

          {/* Análise tributária */}
          <div className="bg-gray-800/50 rounded p-3">
            <h5 className="text-green-400 font-medium text-sm mb-2">🎯 Análise Tributária</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Elegível RCT:</span>
                <p className={`${data.elegivel_rct ? 'text-green-400' : 'text-gray-400'}`}>
                  {data.elegivel_rct ? '✅ Sim' : '❌ Não'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Complexidade:</span>
                <p className={`${
                  data.complexidade_tributaria === 'ALTA' ? 'text-red-400' :
                  data.complexidade_tributaria === 'MEDIA' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {data.complexidade_tributaria}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Potencial RCT:</span>
                <p className="text-white">
                  {data.potencial_recuperacao_estimado.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Metadados */}
          <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
            <p>
              Dados obtidos via {data.fonte_dados.join(', ')} • 
              Confiabilidade: {data.confiabilidade}% • 
              Consultado em {new Date(data.data_consulta).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CNPJField;