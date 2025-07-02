/**
 * =====================================================
 * DISCOVERY NOTECRAFT™ - TIPOS CNPJ E ENRIQUECIMENTO
 * Estruturas para dados deriváveis via CNPJ
 * =====================================================
 */

// =====================================================
// DADOS BRUTOS DA API RECEITA FEDERAL
// =====================================================
export interface CNPJApiResponse {
  cnpj: string;
  identificador_matriz_filial: number;
  descricao_matriz_filial: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: number;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: number;
  nome_cidade_exterior: string;
  codigo_natureza_juridica: number;
  data_inicio_atividade: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  descricao_tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  uf: string;
  codigo_municipio: number;
  municipio: string;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  ddd_fax: string;
  qualificacao_do_responsavel: number;
  capital_social: number;
  porte: string;
  opcao_pelo_simples: boolean;
  data_opcao_pelo_simples: string;
  data_exclusao_do_simples: string;
  opcao_pelo_mei: boolean;
  situacao_especial: string;
  data_situacao_especial: string;
  qsa: QSA[];
  cnaes_secundarios: CNAESecundario[];
}

export interface QSA {
  identificador_de_socio: number;
  nome_socio: string;
  cnpj_cpf_do_socio: string;
  codigo_qualificacao_socio: number;
  percentual_capital_social: number;
  data_entrada_sociedade: string;
  cpf_representante_legal: string;
  nome_representante_legal: string;
  codigo_qualificacao_representante_legal: number;
}

export interface CNAESecundario {
  codigo: number;
  descricao: string;
}

// =====================================================
// DADOS ENRIQUECIDOS PROCESSADOS
// =====================================================
export interface CompanyEnrichedData {
  // Dados básicos
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_ativa: boolean;
  data_fundacao: string;
  
  // Localização
  endereco_completo: string;
  cidade: string;
  estado: string;
  cep: string;
  
  // Classificação
  cnae_principal: {
    codigo: string;
    descricao: string;
    setor: string; // Mapeado para setores conhecidos
  };
  cnaes_secundarios: CNAESecundario[];
  natureza_juridica: string;
  
  // Porte e financeiro
  porte_oficial: 'MEI' | 'ME' | 'EPP' | 'GRANDE';
  capital_social: number;
  regime_tributario: 'SIMPLES' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'DESCONHECIDO';
  
  // Dados estimados (APIs premium ou cálculos)
  funcionarios_estimado: number;
  faturamento_estimado: number;
  faturamento_faixa: string;
  
  // Análise tributária
  elegivel_rct: boolean;
  elegivel_planejamento: boolean;
  complexidade_tributaria: 'BAIXA' | 'MEDIA' | 'ALTA';
  potencial_recuperacao_estimado: number;
  
  // Metadata
  data_consulta: string;
  fonte_dados: string[];
  confiabilidade: number; // 0-100
}

// =====================================================
// MAPEAMENTOS E CLASSIFICAÇÕES
// =====================================================
export const CNAE_TO_SECTOR_MAP: Record<string, string> = {
  '69': 'Atividades jurídicas, contábeis e consultorias',
  '70': 'Atividades de sedes de empresas e consultoria',
  '71': 'Atividades de arquitetura e engenharia',
  '72': 'Pesquisa e desenvolvimento científico',
  '73': 'Publicidade e pesquisa de mercado',
  '74': 'Outras atividades profissionais',
  '75': 'Atividades veterinárias',
  '10': 'Fabricação de produtos alimentícios',
  '25': 'Fabricação de produtos de metal',
  '47': 'Comércio varejista',
  '46': 'Comércio atacadista',
  '49': 'Transporte terrestre',
  '52': 'Armazenamento e atividades auxiliares',
  '55': 'Alojamento',
  '56': 'Alimentação',
  '62': 'Atividades de serviços de tecnologia',
  '63': 'Atividades de prestação de serviços',
  '68': 'Atividades imobiliárias',
  '85': 'Educação',
  '86': 'Atividades de atenção à saúde humana',
  '87': 'Atividades de atenção à saúde residencial'
};

export const PORTE_TO_EMPLOYEES_MAP: Record<string, { min: number; max: number; tributario: string }> = {
  'MEI': { min: 0, max: 1, tributario: 'SIMPLES' },
  'ME': { min: 1, max: 19, tributario: 'SIMPLES' },
  'EPP': { min: 20, max: 99, tributario: 'SIMPLES_OU_PRESUMIDO' },
  'GRANDE': { min: 100, max: 999999, tributario: 'LUCRO_REAL_PROVAVEL' }
};

export const REVENUE_ESTIMATION_MAP: Record<string, { min: number; max: number; label: string }> = {
  'MEI': { min: 0, max: 81000, label: 'Até R$ 81 mil' },
  'ME': { min: 81000, max: 360000, label: 'R$ 81k - R$ 360k' },
  'EPP': { min: 360000, max: 4800000, label: 'R$ 360k - R$ 4,8M' },
  'GRANDE': { min: 4800000, max: 999999999, label: 'Acima de R$ 4,8M' }
};

// =====================================================
// SERVICES E UTILITÁRIOS
// =====================================================
export interface CNPJEnrichmentService {
  enrichCompanyData(cnpj: string): Promise<CompanyEnrichedData>;
  validateCNPJ(cnpj: string): boolean;
  formatCNPJ(cnpj: string): string;
  extractBusinessInsights(data: CompanyEnrichedData): BusinessInsights;
}

export interface BusinessInsights {
  // Oportunidades comerciais
  rct_potential_score: number; // 0-100
  planning_complexity_level: 'LOW' | 'MEDIUM' | 'HIGH';
  estimated_recovery_value: number;
  
  // Classificação estratégica
  client_tier: 'PREMIUM' | 'STANDARD' | 'BASIC';
  sales_approach: 'CONSULTATIVE' | 'VOLUME' | 'PREMIUM';
  pricing_strategy: 'VALUE_BASED' | 'COMPETITIVE' | 'COST_PLUS';
  
  // Alertas e flags
  compliance_alerts: string[];
  growth_indicators: string[];
  risk_factors: string[];
  
  // Benchmarking
  sector_benchmark: {
    avg_employees: number;
    avg_revenue: number;
    typical_services: string[];
    success_cases: number;
  };
}

// =====================================================
// CONFIGURAÇÃO DE APIS
// =====================================================
export interface CNPJApiConfig {
  receita_federal_url: string;
  backup_apis: string[];
  rate_limit_ms: number;
  cache_duration_hours: number;
  timeout_ms: number;
}

export const DEFAULT_CNPJ_CONFIG: CNPJApiConfig = {
  receita_federal_url: 'https://receitaws.com.br/v1/cnpj/',
  backup_apis: [
    'https://brasilapi.com.br/api/cnpj/v1/',
    'https://minhareceita.org/',
  ],
  rate_limit_ms: 2000,
  cache_duration_hours: 24,
  timeout_ms: 10000
};

// =====================================================
// VALIDADORES E HELPERS
// =====================================================
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Algoritmo de validação CNPJ
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  const calculateDigit = (digits: string, weights: number[]): number => {
    const sum = digits.split('').reduce((acc, digit, index) => 
      acc + parseInt(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const base = cleanCNPJ.substring(0, 12);
  const digit1 = calculateDigit(base, weights1);
  const digit2 = calculateDigit(base + digit1, weights2);
  
  return cleanCNPJ === base + digit1 + digit2;
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/[^\d]/g, '');
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function extractSectorFromCNAE(cnae: string): string {
  const sectorCode = cnae.substring(0, 2);
  return CNAE_TO_SECTOR_MAP[sectorCode] || 'Outros setores';
}

export function estimateComplexity(data: CompanyEnrichedData): 'BAIXA' | 'MEDIA' | 'ALTA' {
  let complexity = 0;
  
  // Porte
  if (data.porte_oficial === 'GRANDE') complexity += 3;
  else if (data.porte_oficial === 'EPP') complexity += 2;
  else complexity += 1;
  
  // CNAEs secundários
  complexity += Math.min(data.cnaes_secundarios.length, 3);
  
  // Capital social
  if (data.capital_social > 1000000) complexity += 2;
  else if (data.capital_social > 100000) complexity += 1;
  
  // Regime tributário provável
  if (data.regime_tributario === 'LUCRO_REAL') complexity += 3;
  else if (data.regime_tributario === 'LUCRO_PRESUMIDO') complexity += 2;
  
  if (complexity >= 8) return 'ALTA';
  if (complexity >= 5) return 'MEDIA';
  return 'BAIXA';
}

export default {
  validateCNPJ,
  formatCNPJ,
  extractSectorFromCNAE,
  estimateComplexity,
  CNAE_TO_SECTOR_MAP,
  PORTE_TO_EMPLOYEES_MAP,
  REVENUE_ESTIMATION_MAP,
  DEFAULT_CNPJ_CONFIG
};