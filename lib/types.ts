/**
 * =====================================================
 * DISCOVERY NOTECRAFT™ - SCHEMAS E TIPOS TYPESCRIPT
 * Estruturas de dados para todo o sistema
 * =====================================================
 */

// =====================================================
// TIPOS BASE DO SISTEMA
// =====================================================

export type PackageType = 'entry' | 'plus' | 'premium';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type ReadinessLevel = 'iniciante' | 'intermediario' | 'avancado';
// CORREÇÃO: Adicionado 'number' ao ResponseType
export type ResponseType = 'radio' | 'checkbox' | 'slider' | 'text' | 'select' | 'number';

// =====================================================
// PERFIL DO CLIENTE
// =====================================================

export interface ClientProfile {
  name: string; // Corresponde a contactName no formulário
  email: string; // Corresponde a contactEmail no formulário
  company: string; // Corresponde a companyName no formulário
  position?: string;
  phone?: string; // Corresponde a contactPhone no formulário
  sector?: string; // Tornando opcional se não for coletado no form
  size?: 'small' | 'medium' | 'large'; // Tornando opcional se não for coletado no form
}

// =====================================================
// ESTRUTURA DAS QUESTÕES (105 perguntas)
// =====================================================

export interface Question {
  id: string; // ex: 'q1-1', 'q2-3'
  sectionNumber: number; // 1-17
  sectionName: string;
  questionText: string;
  responseType: ResponseType;
  options?: string[]; // Para radio, checkbox, select, slider
  minValue?: number; // Para sliders (não usado no front, mas mantido na interface)
  maxValue?: number; // Para sliders (não usado no front, mas mantido na interface)
  required: boolean;
  placeholder?: string; // Para text inputs e number inputs
  additionalField?: string; // Adicionado para compatibilidade com o prompt original
}

export interface QuestionResponse {
  questionId: string;
  sectionNumber: number;
  sectionName: string;
  questionText: string;
  responseType: ResponseType;
  responseValue: any; // Flexível para diferentes tipos - CORREÇÃO: antes era 'response'
  observations?: string; // Campo observações visível
  aiAwareNotes?: string; // Campo IA-Aware oculto - CORREÇÃO: antes era 'aiAware'
  answeredAt: string; // CORREÇÃO: De Date para string
}

// =====================================================
// ANÁLISE E INSIGHTS
// =====================================================

export interface SectionInsight {
  sectionNumber: number;
  sectionName: string;
  score: number; // 0-10
  scoreJustification: string;
  whatWasEvaluated: string;
  whyThisScore: string;
  currentSituation: string;
  recommendedImprovement: string;
  impactExplanation: string;
  priority: PriorityLevel;
  category: 'knowledge' | 'process' | 'technology' | 'people';
}

export interface MaturityScores {
  conhecimento: number;
  processos: number;
  tecnologia: number;
  equipe: number;
  comercial: number;
  iaVision: number;
  overall: number;
}

// =====================================================
// RECOMENDAÇÕES DE AGENTES IA
// =====================================================

export interface AgentRecommendation {
  agentName: string;
  agentDescription: string;
  agentCategory: 'commercial' | 'operational' | 'analytical';
  priority: number; // 1-5, sendo 1 mais importante
  priorityJustification: string;
  roiPercentage: number;
  implementationWeeks: number;
  implementationEffort: 'low' | 'medium' | 'high';
  packageType: PackageType;
  isEssential: boolean;
  expectedBenefits: string[];
  requiredIntegrations: string[];
}

// =====================================================
// PROJEÇÕES FINANCEIRAS
// =====================================================

export interface ROIProjection {
  twelveMonthsROI: number;
  paybackMonths: number;
  totalInvestment: number;
  monthlyProjections: MonthlyProjection[];
  conservativeScenario: number;
  realisticScenario: number;
  optimisticScenario: number;
}

export interface MonthlyProjection {
  month: number;
  investment: number;
  returns: number;
  cumulative: number;
  breakeven?: boolean;
}

// =====================================================
// CONFIGURAÇÕES DE PACOTES
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
}

// =====================================================
// ANÁLISE COMPLETA DO DISCOVERY
// =====================================================

export interface DiscoveryAnalysis {
  submissionId: string;
  overallScore: number; // 0-100
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
  analyzedAt: string; // CORREÇÃO: De Date para string
  analystVersion: string;
}

// =====================================================
// SUBMISSÃO COMPLETA DO FORMULÁRIO
// =====================================================

export interface FormSubmission {
  id: string;
  clientProfile: ClientProfile; // CORREÇÃO: Objeto ClientProfile, não campos soltos
  responses: QuestionResponse[];
  createdAt: string; // CORREÇÃO: De Date para string
  updatedAt: string; // CORREÇÃO: De Date para string
  completedAt?: string; // CORREÇÃO: De Date para string
  isCompleted: boolean;
  analysisCompleted: boolean;
  packageRecommended?: PackageType;
  estimatedROI?: number;
  implementationPriority?: PriorityLevel;
  status: 'pending' | 'completed' | 'draft'; // Adicionado status para refletir o uso no formulário
  submittedAt?: string; // Adicionado para refletir o uso no formulário e compatibilidade
}

// =====================================================
// ESTRUTURA DO RELATÓRIO FINAL
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
  };
  implementationRoadmap: RoadmapPhase[];
  futureVision: {
    fiscoAIOpportunities: string[];
    neuroForgeExpansion: string[];
  };
  nextSteps: {
    immediateActions: string[];
    requiredResources: string[];
    decisionTimeline: string;
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
}

// =====================================================
// DASHBOARD E VISUALIZAÇÕES
// =====================================================

export interface DashboardData {
  report: DiscoveryReport;
  chartData: {
    maturityRadar: RadarDataPoint[];
    roiTimeline: TimelineDataPoint[];
    agentsPriority: AgentPriorityData[];
    sectionScores: SectionScoreData[];
  };
}

export interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark: number;
}

export interface TimelineDataPoint {
  month: string;
  investment: number;
  returns: number;
  cumulative: number;
}

export interface AgentPriorityData {
  agentName: string;
  priority: number;
  roi: string;
  weeks: number;
  status: 'critical' | 'high' | 'medium' | 'low';
}

export interface SectionScoreData {
  section: string;
  score: number;
  maxScore: number;
  category: string;
}

// =====================================================
// API RESPONSES
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
    timestamp: string; // CORREÇÃO: De Date para string
    requestId: string;
    version: string;
  };
}

export interface AnalysisRequest {
  submissionId: string;
  forceReAnalysis?: boolean;
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
}

export interface AnalysisResponse {
  submissionId: string;
  analysis: DiscoveryAnalysis;
  sectionInsights: SectionInsight[];
  agentRecommendations: AgentRecommendation[];
  processingTimeMs: number;
  tokensUsed: number;
}

// =====================================================
// LOG E AUDITORIA
// =====================================================

export interface ActivityLog {
  id: string;
  submissionId: string;
  activityType: 'form_started' | 'section_completed' | 'form_completed' | 'analysis_started' | 'analysis_completed' | 'report_generated' | 'report_downloaded';
  activityDescription: string;
  userAgent?: string;
  ipAddress?: string;
  sessionData?: Record<string, any>;
  createdAt: string; // CORREÇÃO: De Date para string
}

// =====================================================
// CONFIGURAÇÕES DO SISTEMA
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
  };
  report: {
    defaultFormat: 'pdf' | 'html' | 'both';
    includeDashboard: boolean;
    includeCharts: boolean;
  };
  security: {
    enableRateLimit: boolean;
    maxRequestsPerHour: number;
    enableLogging: boolean;
  };
}

// =====================================================
// TIPOS DE ERRO
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

// =====================================================
// VALIDADORES
// =====================================================

export function validateClientProfile(profile: Partial<ClientProfile>): profile is ClientProfile {
  return !!(
    profile.name &&
    profile.email &&
    profile.company
    // 'phone', 'sector', 'size' são opcionais em ClientProfile agora
  );
}

export function validateQuestionResponse(response: Partial<QuestionResponse>): response is QuestionResponse {
  return !!(
    response.questionId &&
    response.sectionNumber &&
    response.sectionName && // Adicionado para compatibilidade
    response.questionText && // Adicionado para compatibilidade
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
    submission.isCompleted !== undefined // Verifica se o campo boolean existe
  );
}

// =====================================================
// CONSTANTES
// =====================================================

export const DISCOVERY_CONSTANTS = {
  TOTAL_SECTIONS: 17,
  TOTAL_QUESTIONS: 105,
  MIN_COMPLETION_PERCENTAGE: 80,
  ANALYSIS_TIMEOUT_MS: 60000,
  MAX_RETRIES: 3,
  
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
  
  PACKAGE_PRICES: {
    ENTRY: { min: 30000, max: 40000, recommended: 35000 },
    PLUS: { min: 50000, max: 70000, recommended: 60000 },
    PREMIUM: { min: 80000, max: 100000, recommended: 85000 }
  }
} as const;

// =====================================================
// EXPORTAÇÕES
// =====================================================

export default {
  // Tipos principais
  ClientProfile,
  Question,
  QuestionResponse,
  SectionInsight,
  AgentRecommendation,
  ROIProjection,
  DiscoveryAnalysis,
  FormSubmission,
  DiscoveryReport,
  
  // Utilitários
  validateClientProfile,
  validateQuestionResponse,
  validateSubmission,
  
  // Constantes
  DISCOVERY_CONSTANTS,
  
  // Errors
  DiscoveryError,
  ValidationError,
  AnalysisError
};
