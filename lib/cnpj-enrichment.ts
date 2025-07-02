/**
 * =====================================================
 * DISCOVERY NOTECRAFT™ - SERVIÇO ENRIQUECIMENTO CNPJ
 * Integração com APIs para dados empresariais completos
 * =====================================================
 */

import { 
  CNPJApiResponse, 
  CompanyEnrichedData, 
  BusinessInsights, 
  CNPJApiConfig, 
  DEFAULT_CNPJ_CONFIG,
  validateCNPJ,
  formatCNPJ,
  extractSectorFromCNAE,
  estimateComplexity,
  PORTE_TO_EMPLOYEES_MAP,
  REVENUE_ESTIMATION_MAP
} from './cnpj-types';

// =====================================================
// CACHE INTERFACE
// =====================================================
interface CNPJCache {
  [cnpj: string]: {
    data: CompanyEnrichedData;
    timestamp: number;
    expires: number;
  };
}

// =====================================================
// MAIN SERVICE CLASS
// =====================================================
export class CNPJEnrichmentService {
  private config: CNPJApiConfig;
  private cache: CNPJCache = {};
  
  constructor(config: Partial<CNPJApiConfig> = {}) {
    this.config = { ...DEFAULT_CNPJ_CONFIG, ...config };
  }

  /**
   * MÉTODO PRINCIPAL - Enriquece dados da empresa via CNPJ
   */
  async enrichCompanyData(cnpj: string): Promise<CompanyEnrichedData> {
    try {
      // Validar CNPJ
      if (!validateCNPJ(cnpj)) {
        throw new Error('CNPJ inválido');
      }

      const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
      
      // Verificar cache
      const cached = this.getCachedData(cleanCNPJ);
      if (cached) {
        console.log('🔄 Usando dados em cache para CNPJ:', formatCNPJ(cleanCNPJ));
        return cached;
      }

      // Buscar dados via API
      console.log('🔍 Buscando dados para CNPJ:', formatCNPJ(cleanCNPJ));
      const rawData = await this.fetchCNPJData(cleanCNPJ);
      
      // Processar e enriquecer dados
      const enrichedData = this.processRawData(rawData);
      
      // Salvar no cache
      this.setCachedData(cleanCNPJ, enrichedData);
      
      console.log('✅ Dados enriquecidos com sucesso:', enrichedData.razao_social);
      return enrichedData;
      
    } catch (error) {
      console.error('❌ Erro ao enriquecer dados CNPJ:', error);
      
      // Retornar dados mínimos em caso de erro
      return this.createMinimalData(cnpj);
    }
  }

  /**
   * Busca dados via APIs (com fallback)
   */
  private async fetchCNPJData(cnpj: string): Promise<CNPJApiResponse> {
    const urls = [
      `${this.config.receita_federal_url}${cnpj}`,
      ...this.config.backup_apis.map(api => `${api}${cnpj}`)
    ];

    for (const url of urls) {
      try {
        console.log(`🌐 Tentando API: ${url}`);
        
        const response = await fetch(url, {
          signal: AbortSignal.timeout(this.config.timeout_ms),
          headers: {
            'User-Agent': 'Discovery-Notecraft/1.0',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Verificar se é resposta válida
        if (data.status === 'ERROR' || data.erro) {
          throw new Error(data.message || 'Erro na resposta da API');
        }

        console.log('✅ Dados obtidos com sucesso via:', url);
        return data;
        
      } catch (error) {
        console.warn(`⚠️ Erro na API ${url}:`, error);
        
        // Aguardar rate limit antes de tentar próxima API
        await this.delay(this.config.rate_limit_ms);
      }
    }

    throw new Error('Todas as APIs falharam. Tente novamente em alguns minutos.');
  }

  /**
   * Processa dados brutos da API em dados enriquecidos
   */
  private processRawData(raw: CNPJApiResponse): CompanyEnrichedData {
    const setor = extractSectorFromCNAE(raw.cnae_fiscal.toString());
    const porte = this.determinePorte(raw);
    const revenueEstimate = this.estimateRevenue(porte, raw.cnae_fiscal);
    const employeeEstimate = this.estimateEmployees(porte);
    
    const enrichedData: CompanyEnrichedData = {
      // Dados básicos
      cnpj: formatCNPJ(raw.cnpj),
      razao_social: raw.razao_social || 'Não informado',
      nome_fantasia: raw.nome_fantasia || raw.razao_social || 'Não informado',
      situacao_ativa: raw.situacao_cadastral === 2, // 2 = ATIVA
      data_fundacao: raw.data_inicio_atividade || '',
      
      // Localização  
      endereco_completo: this.buildAddress(raw),
      cidade: raw.municipio || '',
      estado: raw.uf || '',
      cep: raw.cep || '',
      
      // Classificação
      cnae_principal: {
        codigo: raw.cnae_fiscal.toString(),
        descricao: raw.cnae_fiscal_descricao || '',
        setor: setor
      },
      cnaes_secundarios: raw.cnaes_secundarios || [],
      natureza_juridica: this.getNaturezaJuridica(raw.codigo_natureza_juridica),
      
      // Porte e financeiro
      porte_oficial: porte,
      capital_social: raw.capital_social || 0,
      regime_tributario: this.determineRegimeTributario(raw),
      
      // Estimativas
      funcionarios_estimado: employeeEstimate,
      faturamento_estimado: revenueEstimate.value,
      faturamento_faixa: revenueEstimate.label,
      
      // Análise tributária
      elegivel_rct: this.isElegivelRCT(porte, raw.cnae_fiscal),
      elegivel_planejamento: this.isElegivelPlanejamento(porte),
      complexidade_tributaria: 'MEDIA', // Será calculado depois
      potencial_recuperacao_estimado: this.estimateRecoveryPotential(revenueEstimate.value, porte),
      
      // Metadata
      data_consulta: new Date().toISOString(),
      fonte_dados: ['Receita Federal', 'ReceitaWS'],
      confiabilidade: 95
    };

    // Calcular complexidade com todos os dados
    enrichedData.complexidade_tributaria = estimateComplexity(enrichedData);
    
    return enrichedData;
  }

  /**
   * Determina o porte da empresa
   */
  private determinePorte(raw: CNPJApiResponse): 'MEI' | 'ME' | 'EPP' | 'GRANDE' {
    if (raw.opcao_pelo_mei) return 'MEI';
    if (raw.porte === '01') return 'ME';
    if (raw.porte === '03') return 'EPP';
    if (raw.porte === '05') return 'GRANDE';
    
    // Fallback baseado em capital social
    if (raw.capital_social <= 81000) return 'MEI';
    if (raw.capital_social <= 360000) return 'ME';
    if (raw.capital_social <= 4800000) return 'EPP';
    return 'GRANDE';
  }

  /**
   * Estima faturamento baseado em porte e CNAE
   */
  private estimateRevenue(porte: string, cnae: number): { value: number; label: string } {
    const baseEstimate = REVENUE_ESTIMATION_MAP[porte] || REVENUE_ESTIMATION_MAP['ME'];
    
    // Ajustar baseado no CNAE (alguns setores têm faturamento típico maior)
    let multiplier = 1;
    const cnaeStr = cnae.toString().substring(0, 2);
    
    // Setores de alto faturamento
    if (['69', '70', '71', '72'].includes(cnaeStr)) { // Serviços profissionais
      multiplier = 1.5;
    } else if (['46', '47'].includes(cnaeStr)) { // Comércio
      multiplier = 1.2;
    } else if (['10', '25'].includes(cnaeStr)) { // Indústria
      multiplier = 1.8;
    }
    
    const estimatedValue = Math.round((baseEstimate.min + baseEstimate.max) / 2 * multiplier);
    
    return {
      value: estimatedValue,
      label: baseEstimate.label
    };
  }

  /**
   * Estima número de funcionários
   */
  private estimateEmployees(porte: string): number {
    const range = PORTE_TO_EMPLOYEES_MAP[porte] || PORTE_TO_EMPLOYEES_MAP['ME'];
    return Math.round((range.min + range.max) / 2);
  }

  /**
   * Determina regime tributário provável
   */
  private determineRegimeTributario(raw: CNPJApiResponse): 'SIMPLES' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'DESCONHECIDO' {
    if (raw.opcao_pelo_simples) return 'SIMPLES';
    if (raw.opcao_pelo_mei) return 'SIMPLES';
    
    // Baseado no porte e capital social
    if (raw.capital_social > 78000000) return 'LUCRO_REAL'; // Obrigatório para capital > 78M
    if (raw.porte === '05') return 'LUCRO_REAL'; // Grandes empresas
    if (raw.porte === '03') return 'LUCRO_PRESUMIDO'; // EPP típico
    
    return 'DESCONHECIDO';
  }

  /**
   * Verifica elegibilidade para RCT
   */
  private isElegivelRCT(porte: string, cnae: number): boolean {
    // MEI raramente tem potencial para RCT significativo
    if (porte === 'MEI') return false;
    
    // Alguns CNAEs têm maior potencial
    const cnaeStr = cnae.toString().substring(0, 2);
    const highPotentialCNAEs = ['10', '25', '46', '47', '49', '62', '68'];
    
    return porte !== 'MEI' && (porte === 'GRANDE' || highPotentialCNAEs.includes(cnaeStr));
  }

  /**
   * Verifica elegibilidade para planejamento tributário
   */
  private isElegivelPlanejamento(porte: string): boolean {
    return porte !== 'MEI'; // Todos exceto MEI podem se beneficiar
  }

  /**
   * Estima potencial de recuperação tributária
   */
  private estimateRecoveryPotential(faturamento: number, porte: string): number {
    let basePercentage = 0;
    
    switch (porte) {
      case 'MEI': basePercentage = 0.01; break;
      case 'ME': basePercentage = 0.02; break;
      case 'EPP': basePercentage = 0.03; break;
      case 'GRANDE': basePercentage = 0.05; break;
      default: basePercentage = 0.02;
    }
    
    return Math.round(faturamento * basePercentage);
  }

  /**
   * Monta endereço completo
   */
  private buildAddress(raw: CNPJApiResponse): string {
    const parts = [
      raw.descricao_tipo_logradouro,
      raw.logradouro,
      raw.numero,
      raw.complemento,
      raw.bairro,
      raw.municipio,
      raw.uf
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  /**
   * Mapeia natureza jurídica
   */
  private getNaturezaJuridica(codigo: number): string {
    const naturezas: Record<number, string> = {
      206: 'Sociedade Empresária Limitada',
      213: 'Empresário Individual',
      230: 'Sociedade Anônima Fechada',
      231: 'Sociedade Anônima Aberta',
      325: 'Sociedade Limitada Unipessoal',
    };
    
    return naturezas[codigo] || `Natureza ${codigo}`;
  }

  /**
   * Cache management
   */
  private getCachedData(cnpj: string): CompanyEnrichedData | null {
    const cached = this.cache[cnpj];
    
    if (!cached) return null;
    if (Date.now() > cached.expires) {
      delete this.cache[cnpj];
      return null;
    }
    
    return cached.data;
  }

  private setCachedData(cnpj: string, data: CompanyEnrichedData): void {
    const expires = Date.now() + (this.config.cache_duration_hours * 60 * 60 * 1000);
    
    this.cache[cnpj] = {
      data,
      timestamp: Date.now(),
      expires
    };
  }

  /**
   * Dados mínimos em caso de erro
   */
  private createMinimalData(cnpj: string): CompanyEnrichedData {
    return {
      cnpj: formatCNPJ(cnpj),
      razao_social: 'Dados não encontrados',
      nome_fantasia: 'Dados não encontrados',
      situacao_ativa: false,
      data_fundacao: '',
      endereco_completo: '',
      cidade: '',
      estado: '',
      cep: '',
      cnae_principal: {
        codigo: '',
        descricao: 'Não identificado',
        setor: 'Não identificado'
      },
      cnaes_secundarios: [],
      natureza_juridica: 'Não identificado',
      porte_oficial: 'ME',
      capital_social: 0,
      regime_tributario: 'DESCONHECIDO',
      funcionarios_estimado: 0,
      faturamento_estimado: 0,
      faturamento_faixa: 'Não identificado',
      elegivel_rct: false,
      elegivel_planejamento: false,
      complexidade_tributaria: 'BAIXA',
      potencial_recuperacao_estimado: 0,
      data_consulta: new Date().toISOString(),
      fonte_dados: ['Erro na consulta'],
      confiabilidade: 0
    };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gera insights de negócio baseado nos dados
   */
  extractBusinessInsights(data: CompanyEnrichedData): BusinessInsights {
    const rctScore = this.calculateRCTScore(data);
    
    return {
      rct_potential_score: rctScore,
      planning_complexity_level: data.complexidade_tributaria === 'ALTA' ? 'HIGH' : 
                                data.complexidade_tributaria === 'MEDIA' ? 'MEDIUM' : 'LOW',
      estimated_recovery_value: data.potencial_recuperacao_estimado,
      
      client_tier: this.determineClientTier(data),
      sales_approach: this.determineSalesApproach(data),
      pricing_strategy: this.determinePricingStrategy(data),
      
      compliance_alerts: this.generateComplianceAlerts(data),
      growth_indicators: this.generateGrowthIndicators(data),
      risk_factors: this.generateRiskFactors(data),
      
      sector_benchmark: {
        avg_employees: PORTE_TO_EMPLOYEES_MAP[data.porte_oficial].max,
        avg_revenue: data.faturamento_estimado,
        typical_services: this.getTypicalServices(data.cnae_principal.setor),
        success_cases: Math.floor(Math.random() * 50) + 10 // Mock data
      }
    };
  }

  private calculateRCTScore(data: CompanyEnrichedData): number {
    let score = 0;
    
    // Porte (40 pontos)
    switch (data.porte_oficial) {
      case 'GRANDE': score += 40; break;
      case 'EPP': score += 30; break;
      case 'ME': score += 15; break;
      case 'MEI': score += 5; break;
    }
    
    // Setor (30 pontos)
    const highPotentialSectors = ['Fabricação', 'Comércio', 'Transporte'];
    if (highPotentialSectors.some(sector => data.cnae_principal.setor.includes(sector))) {
      score += 30;
    } else if (data.cnae_principal.setor.includes('Serviços')) {
      score += 20;
    } else {
      score += 10;
    }
    
    // Regime tributário (20 pontos)
    switch (data.regime_tributario) {
      case 'LUCRO_REAL': score += 20; break;
      case 'LUCRO_PRESUMIDO': score += 15; break;
      case 'SIMPLES': score += 5; break;
    }
    
    // Situação ativa (10 pontos)
    if (data.situacao_ativa) score += 10;
    
    return Math.min(score, 100);
  }

  private determineClientTier(data: CompanyEnrichedData): 'PREMIUM' | 'STANDARD' | 'BASIC' {
    if (data.porte_oficial === 'GRANDE' && data.faturamento_estimado > 10000000) {
      return 'PREMIUM';
    } else if (data.porte_oficial === 'EPP' || data.faturamento_estimado > 1000000) {
      return 'STANDARD';
    }
    return 'BASIC';
  }

  private determineSalesApproach(data: CompanyEnrichedData): 'CONSULTATIVE' | 'VOLUME' | 'PREMIUM' {
    if (data.complexidade_tributaria === 'ALTA') return 'CONSULTATIVE';
    if (data.porte_oficial === 'GRANDE') return 'PREMIUM';
    return 'VOLUME';
  }

  private determinePricingStrategy(data: CompanyEnrichedData): 'VALUE_BASED' | 'COMPETITIVE' | 'COST_PLUS' {
    if (data.potencial_recuperacao_estimado > 500000) return 'VALUE_BASED';
    if (data.porte_oficial === 'ME') return 'COMPETITIVE';
    return 'COST_PLUS';
  }

  private generateComplianceAlerts(data: CompanyEnrichedData): string[] {
    const alerts: string[] = [];
    
    if (!data.situacao_ativa) {
      alerts.push('⚠️ Empresa com situação cadastral irregular');
    }
    
    if (data.regime_tributario === 'DESCONHECIDO') {
      alerts.push('📋 Regime tributário não identificado - verificar situação');
    }
    
    if (data.confiabilidade < 50) {
      alerts.push('🔍 Dados com baixa confiabilidade - validar informações');
    }
    
    return alerts;
  }

  private generateGrowthIndicators(data: CompanyEnrichedData): string[] {
    const indicators: string[] = [];
    
    if (data.porte_oficial === 'EPP' || data.porte_oficial === 'GRANDE') {
      indicators.push('📈 Empresa de médio/grande porte - potencial de crescimento');
    }
    
    if (data.elegivel_rct) {
      indicators.push('💰 Elegível para RCT - oportunidade de recuperação');
    }
    
    if (data.complexidade_tributaria === 'ALTA') {
      indicators.push('🎯 Alta complexidade tributária - potencial consultivo');
    }
    
    return indicators;
  }

  private generateRiskFactors(data: CompanyEnrichedData): string[] {
    const risks: string[] = [];
    
    if (!data.situacao_ativa) {
      risks.push('🚨 Situação cadastral irregular');
    }
    
    if (data.faturamento_estimado < 100000) {
      risks.push('⚠️ Baixo faturamento estimado');
    }
    
    if (data.confiabilidade < 70) {
      risks.push('📊 Dados com confiabilidade limitada');
    }
    
    return risks;
  }

  private getTypicalServices(setor: string): string[] {
    const serviceMap: Record<string, string[]> = {
      'Atividades jurídicas': ['RCT', 'Planejamento Tributário', 'Consultoria'],
      'Fabricação': ['RCT', 'Auditoria Tributária', 'Planejamento'],
      'Comércio': ['RCT', 'Compliance', 'Auditoria'],
      'Serviços': ['Planejamento', 'Consultoria', 'Compliance']
    };
    
    for (const [key, services] of Object.entries(serviceMap)) {
      if (setor.includes(key)) return services;
    }
    
    return ['RCT', 'Planejamento', 'Consultoria'];
  }
}

// =====================================================
// INSTÂNCIA SINGLETON E FUNÇÕES DE CONVENIÊNCIA
// =====================================================
export const cnpjService = new CNPJEnrichmentService();

export async function enrichCompanyByCNPJ(cnpj: string): Promise<CompanyEnrichedData> {
  return await cnpjService.enrichCompanyData(cnpj);
}

export function validateCompanyCNPJ(cnpj: string): boolean {
  return validateCNPJ(cnpj);
}

export function formatCompanyCNPJ(cnpj: string): string {
  return formatCNPJ(cnpj);
}

export default cnpjService;