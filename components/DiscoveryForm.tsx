'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DISCOVERY_QUESTIONS } from '../lib/questions';
import { Question, FormSubmission, QuestionResponse } from '../lib/types';
import QuestionRenderer from './QuestionRenderer';
import SectionProgress from './SectionProgress';
import FormNavigation from './FormNavigation';

interface DiscoveryFormProps {
  onSubmit: (submission: FormSubmission) => Promise<void>;
  initialData?: Partial<FormSubmission>; // Partial<FormSubmission> é bom para dados iniciais, mas FormSubmission deve ter todos os campos
  className?: string;
}

export default function DiscoveryForm({
  onSubmit,
  initialData,
  className = ''
}: DiscoveryFormProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      if (initialData.responses) {
        const responsesMap: Record<string, QuestionResponse> = {};
        initialData.responses.forEach(response => {
          responsesMap[response.questionId] = response;
        });
        setResponses(responsesMap);
      }
      
      // Acessando as propriedades com optional chaining para evitar erros de tipo se initialData for Partial
      if (initialData.companyName) setClientInfo(prev => ({ ...prev, companyName: initialData.companyName! }));
      if (initialData.contactName) setClientInfo(prev => ({ ...prev, contactName: initialData.contactName! }));
      if (initialData.contactEmail) setClientInfo(prev => ({ ...prev, contactEmail: initialData.contactEmail! }));
      if (initialData.contactPhone) setClientInfo(prev => ({ ...prev, contactPhone: initialData.contactPhone! }));
    }
  }, [initialData]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        handleSave();
      }, 5000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, handleSave]); // Adicionado handleSave para useCallback

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            handlePrevious();
            break;
          case 'ArrowRight':
            e.preventDefault();
            handleNext();
            break;
          case 's':
            e.preventDefault();
            handleSave(); // Chamando handleSave aqui
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, handleSave]); // Dependências do useCallback

  // Get questions for current section
  const getCurrentSectionQuestions = (): Question[] => {
    return DISCOVERY_QUESTIONS.filter(q => q.sectionNumber === currentSection);
  };

  // Get section names
  const getSectionNames = (): string[] => {
    const sections: string[] = [];
    // Certifica-se de que a ordem das seções seja mantida
    const sectionNumbers = new Set(DISCOVERY_QUESTIONS.map(q => q.sectionNumber));
    const sortedSectionNumbers = Array.from(sectionNumbers).sort((a, b) => a - b);

    for (const num of sortedSectionNumbers) {
      const question = DISCOVERY_QUESTIONS.find(q => q.sectionNumber === num);
      if (question) {
        sections.push(question.sectionName);
      }
    }
    return sections;
  };

  // Validate current section
  const isCurrentSectionValid = (): boolean => {
    const currentQuestions = getCurrentSectionQuestions();
    
    // Validação das informações do cliente na primeira seção
    if (currentSection === 1) {
      if (!clientInfo.companyName.trim() || !clientInfo.contactName.trim() || !clientInfo.contactEmail.trim() || !clientInfo.contactPhone.trim()) {
        return false;
      }
    }

    return currentQuestions.every(question => {
      if (!question.required) return true;
      
      const response = responses[question.id];
      if (!response || response.response === undefined || response.response === null) {
        return false; // Resposta não existe ou é nula/indefinida
      }

      const value = response.response;
      
      switch (question.responseType) {
        case 'text':
          return typeof value === 'string' && value.trim() !== '';
        case 'number':
          // Garante que é um número e não NaN
          return typeof value === 'number' && !isNaN(value);
        case 'radio':
          return typeof value === 'string' && value !== '';
        case 'checkbox':
          return Array.isArray(value) && value.length > 0;
        case 'slider':
          // Para slider, espera-se um objeto com keys e valores, ou um único valor
          // A validação específica para slider pode depender da implementação do componente.
          // Aqui, verificamos se é um objeto e tem ao menos uma entrada.
          return typeof value === 'object' && value !== null && Object.keys(value).length > 0;
        default:
          return true;
      }
    });
  };

  // Handle response change
  const handleResponseChange = useCallback((questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId], // Mantém observations e aiAware se existirem
        questionId,
        response: value,
        updatedAt: new Date().toISOString()
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle observations change
  const handleObservationsChange = useCallback((questionId: string, observations: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId, // Garante que questionId esteja presente
        response: prev[questionId]?.response, // Mantém a resposta existente
        observations,
        updatedAt: new Date().toISOString()
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle AI-aware change
  const handleAiAwareChange = useCallback((questionId: string, aiAware: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId, // Garante que questionId esteja presente
        response: prev[questionId]?.response, // Mantém a resposta existente
        aiAware,
        updatedAt: new Date().toISOString()
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Save handler (Wrapped in useCallback)
  const handleSave = useCallback(async () => {
    try {
      // Simula uma chamada API de salvamento. Em um app real, você enviaria os dados para o backend.
      // Aqui você poderia chamar um `onSave` prop se quisesse salvar no componente pai.
      console.log('Salvando rascunho...', { clientInfo, responses });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula latência
      setHasUnsavedChanges(false);
      console.log('Rascunho salvo!');
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
    }
  }, [clientInfo, responses]); // Dependências do useCallback

  // Navigation handlers (Wrapped in useCallback)
  const handleNext = useCallback(() => {
    if (isCurrentSectionValid()) {
      if (!completedSections.includes(currentSection)) {
        setCompletedSections(prev => [...prev, currentSection]);
      }
      
      handleSave(); // Salva antes de avançar
      if (currentSection < 17) {
        setCurrentSection(prev => prev + 1);
      }
    } else {
      alert('Por favor, preencha todas as perguntas obrigatórias desta seção.');
    }
  }, [currentSection, completedSections, handleSave, isCurrentSectionValid]);

  const handlePrevious = useCallback(() => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    }
  }, [currentSection]);

  const handleSectionClick = useCallback((section: number) => {
    // Permite navegar para trás livremente ou para frente se a seção anterior foi validada
    if (section <= currentSection || completedSections.includes(section - 1)) {
      setCurrentSection(section);
    } else {
      alert('Por favor, preencha a seção atual e as anteriores antes de avançar.');
    }
  }, [currentSection, completedSections]);

  // Submit handler
  const handleSubmit = async () => {
    // Garante que a seção atual é válida e que as informações do cliente estão preenchidas (se for a primeira seção)
    if (!isCurrentSectionValid()) {
      alert('Por favor, preencha todas as perguntas obrigatórias da seção atual e as informações da empresa.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submission: FormSubmission = {
        id: initialData?.id || crypto.randomUUID(),
        companyName: clientInfo.companyName,
        contactName: clientInfo.contactName,
        contactEmail: clientInfo.contactEmail,
        contactPhone: clientInfo.contactPhone,
        responses: Object.values(responses),
        status: 'completed',
        submittedAt: new Date().toISOString(),
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSubmit(submission);
      setHasUnsavedChanges(false);
      alert('Formulário enviado com sucesso!'); // Feedback ao usuário
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.'); // Feedback de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestions = getCurrentSectionQuestions();
  const sectionNames = getSectionNames();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}>
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
               backgroundSize: '60px 60px'
             }}>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">∞</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Discovery Notecraft™
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Questionário estratégico para mapear oportunidades de IA em consultoria tributária
          </p>
        </div>

        {/* Client Info Section */}
        {currentSection === 1 && (
          <div className="mb-8 p-6 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Informações da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome da Empresa (Obrigatório)"
                value={clientInfo.companyName}
                onChange={(e) => {
                  setClientInfo(prev => ({ ...prev, companyName: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
              <input
                type="text"
                placeholder="Nome do Contato (Obrigatório)"
                value={clientInfo.contactName}
                onChange={(e) => {
                  setClientInfo(prev => ({ ...prev, contactName: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
              <input
                type="email"
                placeholder="E-mail de Contato (Obrigatório)"
                value={clientInfo.contactEmail}
                onChange={(e) => {
                  setClientInfo(prev => ({ ...prev, contactEmail: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
              <input
                type="tel"
                placeholder="Telefone de Contato (Obrigatório)"
                value={clientInfo.contactPhone}
                onChange={(e) => {
                  setClientInfo(prev => ({ ...prev, contactPhone: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Progress */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <SectionProgress
                currentSection={currentSection}
                totalSections={sectionNames.length} // Usar o número real de seções
                completedSections={completedSections}
                sectionNames={sectionNames}
                onSectionClick={handleSectionClick}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Questions */}
              <div className="p-8 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10">
                {currentQuestions.map((question, index) => (
                  <div key={question.id} className={index > 0 ? 'mt-12 pt-8 border-t border-white/10' : ''}>
                    <QuestionRenderer
                      question={question}
                      value={responses[question.id]?.response}
                      observationsValue={responses[question.id]?.observations || ''}
                      aiAwareValue={responses[question.id]?.aiAware || ''}
                      onChange={(value) => handleResponseChange(question.id, value)}
                      onObservationsChange={(value) => handleObservationsChange(question.id, value)}
                      onAiAwareChange={(value) => handleAiAwareChange(question.id, value)}
                    />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <FormNavigation
                currentSection={currentSection}
                totalSections={sectionNames.length} // Usar o número real de seções
                isCurrentSectionValid={isCurrentSectionValid()}
                isSubmitting={isSubmitting}
                hasUnsavedChanges={hasUnsavedChanges}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSave={handleSave}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
