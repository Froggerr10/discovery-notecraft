'use client';

import React, { useState } from 'react';
import DiscoveryForm from '../components/DiscoveryForm';
import { FormSubmission } from '../lib/types';
import { MOCK_FORM_SUBMISSION } from '../lib/mock-data';
import { saveDiscoverySubmission } from '../lib/supabase-client';
import { processWithAI } from '../lib/ai-agent-processor';

export default function HomePage() {
  const [useTestData, setUseTestData] = useState(false);

  const handleSubmit = async (submission: FormSubmission) => {
    try {
      console.log('📋 Submission received:', submission);
      
      // PASSO 1: Salvar no Supabase
      console.log('💾 Salvando no Supabase...');
      const saveResult = await saveDiscoverySubmission(submission);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Erro ao salvar no banco de dados');
      }
      
      console.log('✅ Salvo no Supabase com ID:', saveResult.submissionId);
      
      // PASSO 2: Processar com Agentes IA (se submission completa)
      if (submission.isCompleted && saveResult.submissionId) {
        console.log('🤖 Iniciando análise com IA...');
        
        try {
          // Processar em background - não bloquear sucesso da submission
          processWithAI(submission, saveResult.submissionId)
            .then(analysisResult => {
              console.log('✅ Análise IA concluída:', analysisResult);
            })
            .catch(error => {
              console.error('⚠️ Erro na análise IA (não crítico):', error);
            });
          
        } catch (aiError) {
          // Análise IA é não-crítica, não falha submission
          console.error('⚠️ Erro ao iniciar análise IA:', aiError);
        }
      }
      
      // PASSO 3: Feedback ao usuário
      alert(`✅ Discovery Notecraft™ enviado com sucesso!
      
📊 Suas respostas foram salvas e nossa IA está analisando seu perfil.
      
💼 Nossa equipe entrará em contato em até 24h com o relatório personalizado.
      
🎯 ID da submissão: ${saveResult.submissionId}`);
      
      // Opcional: redirecionar para página de obrigado
      // window.location.href = '/obrigado?id=' + saveResult.submissionId;
      
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      
      // Feedback de erro mais detalhado
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`❌ Erro ao enviar formulário: ${errorMessage}
      
🔄 Tente novamente em alguns segundos.
      
📧 Se o problema persistir, entre em contato: suporte@notecraft.com.br`);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Development Test Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-gray-900/90 border border-gray-600 rounded-lg backdrop-blur-sm">
          <h3 className="text-white font-semibold mb-2">🧪 Painel de Testes</h3>
          <label className="flex items-center space-x-2 text-gray-300">
            <input
              type="checkbox"
              checked={useTestData}
              onChange={(e) => setUseTestData(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-teal-400 focus:ring-teal-400"
            />
            <span className="text-sm">Carregar dados fictícios</span>
          </label>
          {useTestData && (
            <p className="text-xs text-gray-400 mt-1">
              📊 Cenário: Silva & Associados Tributário
            </p>
          )}
          
          {/* Status indicators */}
          <div className="mt-3 space-y-1">
            <div className="text-xs text-green-400">✅ Supabase: Conectado</div>
            <div className="text-xs text-blue-400">🤖 IA Agentes: Ativo</div>
            <div className="text-xs text-purple-400">📊 Analytics: Habilitado</div>
          </div>
        </div>
      )}

      <DiscoveryForm 
        onSubmit={handleSubmit}
        initialData={useTestData ? MOCK_FORM_SUBMISSION : undefined}
        className="w-full"
      />
    </main>
  );
}