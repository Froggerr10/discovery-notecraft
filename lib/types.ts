/**
 * =====================================================
 * DISCOVERY NOTECRAFT™ - SCHEMAS E TIPOS TYPESCRIPT
 * Estruturas de dados para todo o sistema + CNPJ
 * =====================================================
 */

import { CompanyEnrichedData } from './cnpj-types';

// =====================================================
// TIPOS BASE DO SISTEMA
// =====================================================

export type PackageType = 'entry' | 'plus' | 'premium';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type ReadinessLevel = 'iniciante' | 'intermediario' | 'avancado';
export type ResponseType = 'radio' | 'checkbox' | 'slider' | 'text' | 'select' | 'number' | 'cnpj';

// =====================================================
// PERFIL DO CLIENTE ATUALIZADO COM CNPJ
// =====================================================

export interface ClientProfile {
  // Dados da pessoa responsável
  name: string;
  email: string;
  position?: string;
  phone?: string;
  
  // Dados básicos da empresa (manual)
  company: string;
  cnpj?: string;
  
  // Dados enriquecidos automaticamente (opcional)
  enrichedData?: CompanyEnrichedData;
  
  // Classificação manual (se não houver CNPJ)
  sector?: string;
  size?: 'small' | 'medium' | 'large';
  
  // Flags de enriquecimento
  isEnriched: boolean;
  enrichmentDate?: string;
  enrichmentSource?: string;
}

// =====================================================
// ESTRUTURA DAS QUESTÕES (105 perguntas)
// =====================================================

export interface Question {
  id: string;
  sectionNumber: number;
  sectionName: string;
  questionText: string;
  responseType: ResponseType;
  options?: string[];
  minValue?: number;
  maxValue?: number;
  required: boolean;
  placeholder?: string;
  additionalField?: string;
  
  // Novo: campos condicionais baseados em dados CNPJ
  showIf?: {
    cnpjField?: keyof CompanyEnrichedData;
    condition?: 'equals' | 'greater' | 'contains';
    value?: any;
  };
}

export interface QuestionResponse {
  questionId: string;
  sectionNumber: number;
  sectionName: string;
  questionText: string;
  responseType: ResponseType;
  responseValue: any;
  observations?: string;
  aiAwareNotes?: string;
  answeredAt: string;
}

// =====================================================
// ANÁLISE E INSIGHTS ATUALIZADA
// =====================================================

export interface SectionInsight {
  sectionNumber: number;
  sectionName: string;
  score: number;
  scoreJustification: string;
  whatWasEvaluated: string;
  whyThisScore: string;
  currentSituation: string;
  recommendedImprovement: string;
  impactExplanation: string;
  priority: PriorityLevel;
  category: 'knowledge' | 'process' | 'technology' | 'people';
  
  // Novo: insights baseados em dados CNPJ
  cnpjInsights?: {
    sectorBenchmark?: string;
    complianceLevel?: string;
    growthPotential?: string;
  };
}

export interface MaturityScores {
  conhecimento: number;
  processos: number;
  tecnologia: number;
  equipe: number;
  comercial: number;
  iaVision: number;
  overall: number;
  
  // Novo: scores baseados em dados CNPJ
  cnpjCompliance?: number;
  sectorAlignment?: number;
}

// =====================================================
// RECOMENDAÇÕES DE AGENTES IA ATUALIZADA
// =====================================================

export interface AgentRecommendation {
  agentName: string;
  agentDescription: string;
  agentCategory: 'commercial' | 'operational' | 'analytical';
  priority: number;
  priorityJustification: string;
  roiPercentage: number;
  implementationWeeks: number;
  implementationEffort: 'low' | 'medium' | 'high';
  packageType: PackageType;
  isEssential: boolean;
  expectedBenefits: string[];
  requiredIntegrations: string[];
  
  // Novo: recomendações baseadas em dados CNPJ
  cnpjAlignment?: {
    sectorRelevance: number; // 0-100
    sizeAppropriate: boolean;
    complianceNeeded: boolean;
    estimatedImpact: number;
  };
}

// =====================================================
// PROJEÇÕES FINANCEIRAS ATUALIZADA
// =====================================================

export interface ROIProjection {
  twelveMonthsROI: number;
  paybackMonths: number;
  totalInvestment: number;
  monthlyProjections: MonthlyProjection[];
  conservativeScenario: number;
  realisticScenario: number;
  optimisticScenario: number;
  
  // Novo: projeções baseadas em dados CNPJ
  cnpjBasedProjections?: {
    sectorBenchmarkROI: number;
    sizeCorrectedROI: number;
    complianceFactorROI: number;
    riskAdjustedROI: number;
  };
}

export interface MonthlyProjection {
  month: number;
  investment: number;
  returns: number;
  cumulative: number;
  breakeven?: boolean;
  
  // Novo: dados específicos por mês
  cnpjFactors?: {
    seasonality?: number;
    complianceEvents?: string[];
  };
}

// =====================================================
// CONFIGURAÇÕES DE PACOTES ATUALIZADA
// =====================================================

export interface PackageConfiguration {
  packageName: PackageType;
  displayName: string;
  description: string;
  agentsIncluded: string[];
  priceRange: {
    min: number;
    max: number;
    recommended: number;
  };
  implementationTimeWeeks: number;
  targetROIPercentage: number;
  targetPaybackMonths: number;
  targetCompanySize: 'small' | 'medium' | 'large';
  isActive: boolean;
  
  // Novo: configurações baseadas em dados CNPJ
  cnpjEligibility?: {
    minimumPorte?: string;
    requiredRegimes?: string[];
    excludedSectors?: string[];
    minimumRevenue?: number;
  };
}

// =====================================================
// ANÁLISE COMPLETA DO DISCOVERY ATUALIZADA
// =====================================================

export interface DiscoveryAnalysis {
  submissionId: string;
  overallScore: number;
  readinessLevel: ReadinessLevel;
  maturityScores: MaturityScores;
  recommendedPackage: PackageType;
  priorityFocus: string;
  roiProjection: ROIProjection;
  investmentRange: {
    min: number;
    max: number;
    recommended: number;
  };
  priorityAgents: AgentRecommendation[];
  keyInsights: string[];
  predictedResistance: string[];
  analyzedAt: string;
  analystVersion: string;
  
  // Novo: análise baseada em dados CNPJ
  cnpjAnalysis?: {
    companyProfile: CompanyEnrichedData;
    sectorBenchmarks: {
      avgMaturityScore: number;
      commonChallenges: string[];
      successFactors: string[];
    };
    complianceAssessment: {
      currentLevel: string;
      requiredLevel: string;
      gapAnalysis: string[];
    };
    growthProjections: {
      sectorGrowthRate: number;
      marketPosition: string;
      scalabilityScore: number;
    };
  };
}

// =====================================================
// SUBMISSÃO COMPLETA DO FORMULÁRIO ATUALIZADA
// =====================================================

export interface FormSubmission {
  id: string;
  clientProfile: ClientProfile;
  responses: QuestionResponse[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  analysisCompleted: boolean;
  packageRecommended?: PackageType;
  estimatedROI?: number;
  implementationPriority?: PriorityLevel;
  status: 'pending' | 'completed' | 'draft';
  submittedAt?: string;
  
  // Novo: dados de enriquecimento
  enrichmentStatus: 'none' | 'pending' | 'completed' | 'failed';
  enrichmentData?: CompanyEnrichedData;
  enrichmentErrors?: string[];
}

// =====================================================
// ESTRUTURA DO RELATÓRIO FINAL ATUALIZADA
// =====================================================

export interface DiscoveryReport {
  submission: FormSubmission;
  analysis: DiscoveryAnalysis;
  sectionInsights: SectionInsight[];
  agentRecommendations: AgentRecommendation[];
  executiveSummary: {
    overallScore: number;
    readinessLevel: string;
    keyInsights: string[];
    recommendedInvestment: number;
    projectedROI: number;
    
    // Novo: sumário executivo com dados CNPJ
    companyProfile?: {
      sector: string;
      size: string;
      maturityLevel: string;
      keyOpportunities: string[];
    };
  };
  implementationRoadmap: RoadmapPhase[];
  futureVision: {
    fiscoAIOpportunities: string[];
    neuroForgeExpansion: string[];
    
    // Novo: visão baseada em dados CNPJ
    sectorSpecificVision?: string[];
    scaleBasedOpportunities?: string[];
  };
  nextSteps: {
    immediateActions: string[];
    requiredResources: string[];
    decisionTimeline: string;
    
    // Novo: próximos passos baseados em CNPJ
    complianceActions?: string[];
    sectorSpecificSteps?: string[];
  };
}

export interface RoadmapPhase {
  phaseNumber: number;
  phaseName: string;
  timeframe: string;
  investment: number;
  expectedROI: number;
  deliverables: string[];
  dependencies: string[];
  
  // Novo: fases baseadas em dados CNPJ
  cnpjConsiderations?: {
    complianceRequirements?: string[];
    sectorSpecificTasks?: string[];
    scalingFactors?: string[];
  };
}

// =====================================================
// DASHBOARD E VISUALIZAÇÕES ATUALIZADA
// =====================================================

export interface DashboardData {
  report: DiscoveryReport;
  chartData: {
    maturityRadar: RadarDataPoint[];
    roiTimeline: TimelineDataPoint[];
    agentsPriority: AgentPriorityData[];
    sectionScores: SectionScoreData[];
    
    // Novo: gráficos baseados em dados CNPJ
    sectorComparison?: SectorComparisonData[];
    complianceScore?: ComplianceScoreData;
    growthProjection?: GrowthProjectionData[];
  };
}

export interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark: number;
  
  // Novo: dados comparativos
  sectorAverage?: number;
  benchmark?: number;
}

export interface TimelineDataPoint {
  month: string;
  investment: number;
  returns: number;
  cumulative: number;
  
  // Novo: dados setoriais
  sectorAverage?: number;
  confidence?: number;
}

export interface AgentPriorityData {
  agentName: string;
  priority: number;
  roi: string;
  weeks: number;
  status: 'critical' | 'high' | 'medium' | 'low';
  
  // Novo: dados específicos
  sectorRelevance?: number;
  sizeAppropriate?: boolean;
}

export interface SectionScoreData {
  section: string;
  score: number;
  maxScore: number;
  category: string;
  
  // Novo: comparações
  sectorAverage?: number;
  improvement?: number;
}

// Novos tipos para gráficos CNPJ
export interface SectorComparisonData {
  metric: string;
  yourCompany: number;
  sectorAverage: number;
  topQuartile: number;
}

export interface ComplianceScoreData {
  category: string;
  current: number;
  required: number;
  gap: number;
}

export interface GrowthProjectionData {
  year: number;
  conservative: number;
  realistic: number;
  optimistic: number;
  sectorGrowth: number;
}

// =====================================================
// API RESPONSES ATUALIZADA
// =====================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
    enrichmentUsed?: boolean;
  };
}

export interface AnalysisRequest {
  submissionId: string;
  forceReAnalysis?: boolean;
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
  
  // Novo: parâmetros de análise CNPJ
  useCNPJEnrichment?: boolean;
  cnpjAnalysisLevel?: 'basic' | 'advanced' | 'premium';
}

export interface AnalysisResponse {
  submissionId: string;
  analysis: DiscoveryAnalysis;
  sectionInsights: SectionInsight[];
  agentRecommendations: AgentRecommendation[];
  processingTimeMs: number;
  tokensUsed: number;
  
  // Novo: dados de enriquecimento
  enrichmentData?: CompanyEnrichedData;
  enrichmentTime?: number;
  confidenceScore?: number;
}

// =====================================================
// CNPJ INTEGRATION HELPERS
// =====================================================

export interface CNPJIntegrationResult {
  success: boolean;
  data?: CompanyEnrichedData;
  error?: string;
  source: string;
  processingTime: number;
  confidenceLevel: number;
}

export interface EnrichmentConfig {
  enableAutoEnrichment: boolean;
  fallbackToManual: boolean;
  requiredConfidence: number;
  cacheHours: number;
  retryAttempts: number;
}

// =====================================================
// LOG E AUDITORIA ATUALIZADA
// =====================================================

export interface ActivityLog {
  id: string;
  submissionId: string;
  activityType: 'form_started' | 'section_completed' | 'form_completed' | 'analysis_started' | 'analysis_completed' | 'report_generated' | 'report_downloaded' | 'cnpj_enriched' | 'enrichment_failed';
  activityDescription: string;
  userAgent?: string;
  ipAddress?: string;
  sessionData?: Record<string, any>;
  createdAt: string;
  
  // Novo: dados de enriquecimento
  enrichmentData?: {
    cnpj?: string;
    success?: boolean;
    source?: string;
    processingTime?: number;
  };
}

// =====================================================
// CONFIGURAÇÕES DO SISTEMA ATUALIZADA
// =====================================================

export interface SystemConfig {
  ai: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
  };
  analysis: {
    enableAdvancedAnalysis: boolean;
    enableFutureVision: boolean;
    enableROICalculation: boolean;
    enableCNPJEnrichment: boolean;
  };
  report: {
    defaultFormat: 'pdf' | 'html' | 'both';
    includeDashboard: boolean;
    includeCharts: boolean;
    includeCNPJData: boolean;
  };
  security: {
    enableRateLimit: boolean;
    maxRequestsPerHour: number;
    enableLogging: boolean;
  };
  enrichment: EnrichmentConfig;
}

// =====================================================
// TIPOS DE ERRO ATUALIZADA
// =====================================================

export class DiscoveryError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'DiscoveryError';
  }
}

export class ValidationError extends DiscoveryError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AnalysisError extends DiscoveryError {
  constructor(message: string, details?: any) {
    super(message, 'ANALYSIS_ERROR', 500, details);
    this.name = 'AnalysisError';
  }
}

export class EnrichmentError extends DiscoveryError {
  constructor(message: string, details?: any) {
    super(message, 'ENRICHMENT_ERROR', 500, details);
    this.name = 'EnrichmentError';
  }
}

// =====================================================
// VALIDADORES ATUALIZADA
// =====================================================

export function validateClientProfile(profile: Partial<ClientProfile>): profile is ClientProfile {
  return !!(
    profile.name &&
    profile.email &&
    profile.company
  );
}

export function validateQuestionResponse(response: Partial<QuestionResponse>): response is QuestionResponse {
  return !!(
    response.questionId &&
    response.sectionNumber &&
    response.sectionName &&
    response.questionText &&
    response.responseType &&
    response.responseValue !== undefined
  );
}

export function validateSubmission(submission: Partial<FormSubmission>): submission is FormSubmission {
  return !!(
    submission.id &&
    submission.clientProfile &&
    validateClientProfile(submission.clientProfile) &&
    submission.responses &&
    submission.responses.length > 0 &&
    submission.createdAt &&
    submission.updatedAt &&
    submission.isCompleted !== undefined &&
    submission.enrichmentStatus !== undefined
  );
}

// =====================================================
// CONSTANTES ATUALIZADA
// =====================================================

export const DISCOVERY_CONSTANTS = {
  TOTAL_SECTIONS: 17,
  TOTAL_QUESTIONS: 105,
  MIN_COMPLETION_PERCENTAGE: 80,
  ANALYSIS_TIMEOUT_MS: 60000,
  MAX_RETRIES: 3,
  
  // Novo: constantes CNPJ
  CNPJ_ENRICHMENT_TIMEOUT_MS: 15000,
  MIN_CNPJ_CONFIDENCE: 70,
  CNPJ_CACHE_HOURS: 24,
  
  SCORE_RANGES: {
    EXCELLENT: [9, 10],
    GOOD: [7, 8],
    INTERMEDIATE: [5, 6],
    WEAK: [3, 4],
    CRITICAL: [0, 2]
  },
  
  ROI_BENCHMARKS: {
    KNOWLEDGE_VAULT: { min: 200, max: 400 },
    BDR_VIRTUAL: { min: 150, max: 300 },
    DISCOVERY_ANALYZER: { min: 180, max: 280 },
    CLOSER_VIRTUAL: { min: 120, max: 250 },
    SDR_VIRTUAL: { min: 120, max: 250 },
    MONITOR_LEGISLATIVO: { min: 100, max: 200 }
  },
  
  // Atualizado: preços baseados em porte
  PACKAGE_PRICES: {
    ENTRY: { min: 30000, max: 40000, recommended: 35000 },
    PLUS: { min: 50000, max: 70000, recommended: 60000 },
    PREMIUM: { min: 80000, max: 100000, recommended: 85000 }
  },
  
  // Novo: ajustes de preço por porte
  PORTE_PRICE_MULTIPLIERS: {
    MEI: 0.5,
    ME: 0.8,
    EPP: 1.0,
    GRANDE: 1.5
  }
} as const;

// =====================================================
// HELPERS DE CNPJ
// =====================================================

export function getPackagePriceForCompany(
  packageType: PackageType, 
  enrichedData?: CompanyEnrichedData
): number {
  const basePrice = DISCOVERY_CONSTANTS.PACKAGE_PRICES[packageType.toUpperCase() as keyof typeof DISCOVERY_CONSTANTS.PACKAGE_PRICES];
  
  if (!enrichedData) {
    return basePrice.recommended;
  }
  
  const multiplier = DISCOVERY_CONSTANTS.PORTE_PRICE_MULTIPLIERS[enrichedData.porte_oficial] || 1;
  return Math.round(basePrice.recommended * multiplier);
}

export function isCompanyEligibleForPackage(
  packageType: PackageType,
  enrichedData?: CompanyEnrichedData
): boolean {
  if (!enrichedData) return true;
  
  // Regras de elegibilidade baseadas em porte
  switch (packageType) {
    case 'entry':
      return ['MEI', 'ME'].includes(enrichedData.porte_oficial);
    case 'plus':
      return ['ME', 'EPP'].includes(enrichedData.porte_oficial);
    case 'premium':
      return ['EPP', 'GRANDE'].includes(enrichedData.porte_oficial);
    default:
      return true;
  }
}

export function getRecommendedPackageForCompany(enrichedData?: CompanyEnrichedData): PackageType {
  if (!enrichedData) return 'plus';
  
  switch (enrichedData.porte_oficial) {
    case 'MEI':
      return 'entry';
    case 'ME':
      return enrichedData.complexidade_tributaria === 'ALTA' ? 'plus' : 'entry';
    case 'EPP':
      return enrichedData.complexidade_tributaria === 'BAIXA' ? 'plus' : 'premium';
    case 'GRANDE':
      return 'premium';
    default:
      return 'plus';
  }
}

// Remove o export default
export type { CompanyEnrichedData };