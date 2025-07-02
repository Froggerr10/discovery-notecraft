'use client';

import React, { useState } from 'react';
import DiscoveryForm from '../components/DiscoveryForm';
import { FormSubmission } from '../lib/types';
import { MOCK_FORM_SUBMISSION } from '../lib/mock-data';

export default function HomePage() {
  const [useTestData, setUseTestData] = useState(false);

  const handleSubmit = async (submission: FormSubmission) => {
    try {
      console.log('Submission received:', submission);
      
      // Here we would integrate with Supabase
      // For now, just log the submission
      
      // Show success message
      alert('Discovery Notecraft™ enviado com sucesso! Entraremos em contato em breve.');
      
      // Optional: redirect to thank you page
      // window.location.href = '/obrigado';
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar formulário. Tente novamente.');
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