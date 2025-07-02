/**
 * =====================================================
 * DISCOVERY NOTECRAFT™ - SUPABASE CLIENT
 * Integração real com banco de dados
 * =====================================================
 */

// Configuração Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Interface para submission completa
export interface SupabaseSubmission {
  // Dados do cliente
  client_name: string;
  client_email: string;
  client_company: string;
  client_position?: string;
  client_phone?: string;
  
  // Status
  is_completed: boolean;
  analysis_completed: boolean;
  
  // Metadados
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface SupabaseQuestionResponse {
  submission_id: string;
  section_number: number;
  section_name: string;
  question_id: string;
  question_text: string;
  response_type: string;
  response_value: any;
  observations?: string;
  ai_aware_notes?: string;
  answered_at?: string;
}

/**
 * Classe para gerenciar operações Supabase
 */
export class SupabaseManager {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.supabaseUrl = SUPABASE_URL;
    this.supabaseKey = SUPABASE_ANON_KEY;
  }

  /**
   * Salva submission completa no Supabase
   */
  async saveFormSubmission(submissionData: any): Promise<{ success: boolean; submissionId?: string; error?: string }> {
    try {
      // Preparar dados da submission principal
      const submissionPayload: SupabaseSubmission = {
        client_name: submissionData.clientProfile.name,
        client_email: submissionData.clientProfile.email,
        client_company: submissionData.clientProfile.company,
        client_position: submissionData.clientProfile.position || '',
        client_phone: submissionData.clientProfile.phone || '',
        is_completed: submissionData.isCompleted || false,
        analysis_completed: false,
        completed_at: submissionData.isCompleted ? new Date().toISOString() : null
      };

      // Fazer requisição para API Supabase
      const submissionResponse = await fetch(`${this.supabaseUrl}/rest/v1/form_submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(submissionPayload)
      });

      if (!submissionResponse.ok) {
        throw new Error(`Erro ao salvar submission: ${submissionResponse.statusText}`);
      }

      const submissionResult = await submissionResponse.json();
      const submissionId = submissionResult[0]?.id;

      if (!submissionId) {
        throw new Error('ID da submission não retornado');
      }

      // Salvar respostas individuais
      if (submissionData.responses && submissionData.responses.length > 0) {
        const responsePromises = submissionData.responses.map((response: any) => {
          const responsePayload: SupabaseQuestionResponse = {
            submission_id: submissionId,
            section_number: response.sectionNumber,
            section_name: response.sectionName,
            question_id: response.questionId,
            question_text: response.questionText,
            response_type: response.responseType,
            response_value: response.responseValue,
            observations: response.observations || '',
            ai_aware_notes: response.aiAwareNotes || '',
            answered_at: response.answeredAt || new Date().toISOString()
          };

          return fetch(`${this.supabaseUrl}/rest/v1/question_responses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.supabaseKey}`,
              'apikey': this.supabaseKey
            },
            body: JSON.stringify(responsePayload)
          });
        });

        await Promise.all(responsePromises);
      }

      console.log('✅ Submission salva no Supabase:', submissionId);
      return { success: true, submissionId };

    } catch (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Recupera submission do Supabase
   */
  async getSubmission(submissionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/form_submissions?id=eq.${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao recuperar submission');
      }

      const data = await response.json();
      return data[0] || null;

    } catch (error) {
      console.error('Erro ao recuperar submission:', error);
      return null;
    }
  }

  /**
   * Verifica se Supabase está configurado
   */
  isConfigured(): boolean {
    return !!(this.supabaseUrl && this.supabaseKey);
  }
}

// Instância singleton
export const supabaseManager = new SupabaseManager();

// Função de conveniência para salvar submission
export async function saveDiscoverySubmission(submissionData: any) {
  if (!supabaseManager.isConfigured()) {
    console.warn('🟡 Supabase não configurado - salvando apenas localmente');
    // Fallback para localStorage ou mock
    localStorage.setItem('discovery_submission', JSON.stringify(submissionData));
    return { success: true, submissionId: 'local_' + Date.now() };
  }

  return await supabaseManager.saveFormSubmission(submissionData);
}

export default supabaseManager;