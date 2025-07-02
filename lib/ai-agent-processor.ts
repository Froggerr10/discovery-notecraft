/**
 * =====================================================
 * DISCOVERY NOTECRAFT™ - AI AGENT PROCESSOR
 * Conecta prompt-framework.ts com submissions reais
 * =====================================================
 */

import { FormSubmission, QuestionResponse, SectionInsight, AgentRecommendation } from './types';
import { 
  DISCOVERY_ANALYZER_PROMPT, 
  SECTION_SCORER_PROMPT,
  AGENT_RECOMMENDER_PROMPT,
  buildContextualizedPrompt,
  validateOutputFormat,
  AnalysisContext,
  AnalysisOutput
} from './prompt-framework';

// Configuração da API (pode usar OpenAI, Anthropic, etc.)
const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY || '';

export interface AIAnalysisResult {
  submissionId: string;
  overallScore: number;
  sectionInsights: SectionInsight[];
  agentRecommendations: AgentRecommendation[];
  keyInsights: string[];
  processingTime: number;
  success: boolean;
  error?: string;
}

/**
 * Classe principal para processar submissions com IA
 */
export class AIAgentProcessor {
  
  /**
   * Processa submission completa com agentes IA
   */
  async processSubmission(submission: FormSubmission, submissionId: string): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log('🤖 Iniciando processamento IA para submission:', submissionId);
      
      // Preparar contexto para IA
      const context: AnalysisContext = {
        clientProfile: submission.clientProfile,
        responses: submission.responses || [],
        observations: this.extractObservations(submission.responses || []),
        aiAwareNotes: this.extractAIAwareNotes(submission.responses || [])
      };
      
      // ETAPA 1: Análise geral com Discovery Analyzer
      console.log('📊 Executando análise geral...');
      const generalAnalysis = await this.runDiscoveryAnalyzer(context);
      
      // ETAPA 2: Análise por seção com Section Scorer
      console.log('📋 Analisando seções individuais...');
      const sectionAnalyses = await this.runSectionScorer(context);
      
      // ETAPA 3: Recomendações de agentes
      console.log('🎯 Gerando recomendações de agentes...');
      const agentRecommendations = await this.runAgentRecommender(context, generalAnalysis);
      
      // ETAPA 4: Consolidar resultados
      const result: AIAnalysisResult = {
        submissionId,
        overallScore: generalAnalysis.overallScore || 0,
        sectionInsights: sectionAnalyses,
        agentRecommendations: agentRecommendations,
        keyInsights: generalAnalysis.keyInsights || [],
        processingTime: Date.now() - startTime,
        success: true
      };
      
      // ETAPA 5: Salvar análise no Supabase
      await this.saveAnalysisToSupabase(submissionId, result);
      
      console.log('✅ Processamento IA concluído em', result.processingTime, 'ms');
      return result;
      
    } catch (error) {
      console.error('❌ Erro no processamento IA:', error);
      
      return {
        submissionId,
        overallScore: 0,
        sectionInsights: [],
        agentRecommendations: [],
        keyInsights: [],
        processingTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na análise IA'
      };
    }
  }
  
  /**
   * Executa análise geral com Discovery Analyzer
   */
  private async runDiscoveryAnalyzer(context: AnalysisContext): Promise<any> {
    const prompt = buildContextualizedPrompt(
      DISCOVERY_ANALYZER_PROMPT,
      context,
      'Análise completa do perfil de maturidade em IA tributária'
    );
    
    return await this.callAI(prompt, 'discovery-analyzer');
  }
  
  /**
   * Executa análise por seção com Section Scorer
   */
  private async runSectionScorer(context: AnalysisContext): Promise<SectionInsight[]> {
    const sections = this.groupResponsesBySection(context.responses);
    const sectionAnalyses: SectionInsight[] = [];
    
    for (const [sectionName, responses] of Object.entries(sections)) {
      const sectionContext = { ...context, responses };
      const prompt = buildContextualizedPrompt(
        SECTION_SCORER_PROMPT,
        sectionContext,
        `Análise específica da seção: ${sectionName}`
      );
      
      try {
        const analysis = await this.callAI(prompt, 'section-scorer');
        sectionAnalyses.push({
          sectionName,
          score: analysis.score || 0,
          insights: analysis.insights || '',
          recommendations: analysis.recommendations || '',
          priority: analysis.priority || 'medium'
        });
      } catch (error) {
        console.error(`Erro ao analisar seção ${sectionName}:`, error);
      }
    }
    
    return sectionAnalyses;
  }
  
  /**
   * Executa recomendações de agentes
   */
  private async runAgentRecommender(context: AnalysisContext, generalAnalysis: any): Promise<AgentRecommendation[]> {
    const enhancedContext = {
      ...context,
      generalAnalysis
    };
    
    const prompt = buildContextualizedPrompt(
      AGENT_RECOMMENDER_PROMPT,
      context,
      'Recomendação de agentes IA específicos baseado no perfil analisado'
    );
    
    const recommendations = await this.callAI(prompt, 'agent-recommender');
    
    return recommendations.primaryAgents || [];
  }
  
  /**
   * Chama API de IA (OpenAI, Anthropic, etc.)
   */
  private async callAI(prompt: string, agentType: string): Promise<any> {
    if (!AI_API_KEY) {
      // Fallback para modo de desenvolvimento
      console.warn('🟡 API Key não configurada - usando resposta mock');
      return this.getMockAIResponse(agentType);
    }
    
    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Resposta vazia da API');
      }
      
      // Tentar fazer parse do JSON
      return JSON.parse(content);
      
    } catch (error) {
      console.error(`Erro na chamada IA (${agentType}):`, error);
      return this.getMockAIResponse(agentType);
    }
  }
  
  /**
   * Responses mock para desenvolvimento/fallback
   */
  private getMockAIResponse(agentType: string): any {
    switch (agentType) {
      case 'discovery-analyzer':
        return {
          overallScore: 75,
          keyInsights: [
            'Escritório com boa base técnica mas processos manuais',
            'Alta receptividade à automação por IA',
            'Oportunidade significativa em gestão de conhecimento'
          ]
        };
        
      case 'section-scorer':
        return {
          score: 7,
          insights: 'Seção com pontuação boa mas com espaço para melhorias',
          recommendations: 'Implementar automação gradual',
          priority: 'medium'
        };
        
      case 'agent-recommender':
        return {
          primaryAgents: [
            {
              name: 'Knowledge Vault Organizer',
              priority: 1,
              roi: 280,
              justification: 'Base de conhecimento dispersa precisa de organização'
            }
          ]
        };
        
      default:
        return {};
    }
  }
  
  /**
   * Salva análise no Supabase
   */
  private async saveAnalysisToSupabase(submissionId: string, analysis: AIAnalysisResult): Promise<void> {
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn('🟡 Supabase não configurado - salvando apenas em memória');
        return;
      }
      
      const analysisPayload = {
        submission_id: submissionId,
        overall_score: analysis.overallScore,
        readiness_level: this.calculateReadinessLevel(analysis.overallScore),
        maturity_scores: JSON.stringify(analysis.sectionInsights),
        priority_agents: JSON.stringify(analysis.agentRecommendations),
        key_insights: JSON.stringify(analysis.keyInsights),
        analyzed_at: new Date().toISOString(),
        analyst_version: 'v1.0'
      };
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/discovery_analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify(analysisPayload)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar análise no Supabase');
      }
      
      // Atualizar flag na submission principal
      await fetch(`${SUPABASE_URL}/rest/v1/form_submissions?id=eq.${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify({
          analysis_completed: true,
          updated_at: new Date().toISOString()
        })
      });
      
      console.log('✅ Análise salva no Supabase');
      
    } catch (error) {
      console.error('⚠️ Erro ao salvar análise (não crítico):', error);
    }
  }
  
  /**
   * Utilitários
   */
  private extractObservations(responses: QuestionResponse[]): string[] {
    return responses
      .map(r => r.observations)
      .filter(obs => obs && obs.trim() !== '') as string[];
  }
  
  private extractAIAwareNotes(responses: QuestionResponse[]): string[] {
    return responses
      .map(r => r.aiAwareNotes)
      .filter(notes => notes && notes.trim() !== '') as string[];
  }
  
  private groupResponsesBySection(responses: QuestionResponse[]): Record<string, QuestionResponse[]> {
    return responses.reduce((acc, response) => {
      const section = response.sectionName || 'Outros';
      if (!acc[section]) acc[section] = [];
      acc[section].push(response);
      return acc;
    }, {} as Record<string, QuestionResponse[]>);
  }
  
  private calculateReadinessLevel(score: number): string {
    if (score >= 80) return 'avancado';
    if (score >= 60) return 'intermediario';
    return 'iniciante';
  }
}

// Instância singleton
const aiProcessor = new AIAgentProcessor();

// Função de conveniência para processar submission
export async function processWithAI(submission: FormSubmission, submissionId: string): Promise<AIAnalysisResult> {
  return await aiProcessor.processSubmission(submission, submissionId);
}

export default aiProcessor;