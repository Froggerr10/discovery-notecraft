'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DISCOVERY_QUESTIONS } from '../lib/questions';
import { Question, FormSubmission, QuestionResponse } from '../lib/types';
import QuestionRenderer from './QuestionRenderer';
import SectionProgress from './SectionProgress';
import FormNavigation from './FormNavigation';

interface DiscoveryFormProps {
  onSubmit: (submission: FormSubmission) => Promise<void>;
  initialData?: Partial<FormSubmission>;
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
  }, [hasUnsavedChanges]);

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
            handleSave();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, responses]);

  // Get questions for current section
  const getCurrentSectionQuestions = (): Question[] => {
    return DISCOVERY_QUESTIONS.filter(q => q.sectionNumber === currentSection);
  };

  // Get section names
  const getSectionNames = (): string[] => {
    const sections: string[] = [];
    for (let i = 1; i <= 17; i++) {
      const question = DISCOVERY_QUESTIONS.find(q => q.sectionNumber === i);
      if (question) {
        sections.push(question.sectionName);
      }
    }
    return sections;
  };

  // Validate current section
  const isCurrentSectionValid = (): boolean => {
    const currentQuestions = getCurrentSectionQuestions();
    return currentQuestions.every(question => {
      if (!question.required) return true;
      
      const response = responses[question.id];
      if (!response) return false;

      const value = response.response;
      
      switch (question.responseType) {
        case 'text':
        case 'number':
          return value && value.toString().trim() !== '';
        case 'radio':
          return value && value !== '';
        case 'checkbox':
          return Array.isArray(value) && value.length > 0;
        case 'slider':
          return value && typeof value === 'object' && Object.keys(value).length > 0;
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
        ...prev[questionId],
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
        questionId,
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
        questionId,
        aiAware,
        updatedAt: new Date().toISOString()
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Navigation handlers
  const handleNext = () => {
    if (isCurrentSectionValid() && currentSection < 17) {
      if (!completedSections.includes(currentSection)) {
        setCompletedSections(prev => [...prev, currentSection]);
      }
      
      handleSave();
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleSectionClick = (section: number) => {
    if (section <= currentSection || completedSections.includes(section - 1)) {
      setCurrentSection(section);
    }
  };

  // Save handler
  const handleSave = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!isCurrentSectionValid()) return;

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
    } catch (error) {
      console.error('Error submitting form:', error);
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
                placeholder="Nome da Empresa"
                value={clientInfo.companyName}
                onChange={(e) => {
                  setClientInfo(prev => ({ ...prev, companyName: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
              <input
                type="text"
                placeholder="Nome do Contato"
                value={clientInfo.contactName}
                onChange={(e) => {
                  setClientInfo(prev => ({ ...prev, contactName: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
              <input
                type="email"
                placeholder="E-mail de Contato"
                value={clientInfo.contactEmail}
                onChange={(e) => {
                  setClientInfo(prev => ({ ...prev, contactEmail: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
              <input
                type="tel"
                placeholder="Telefone de Contato"
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
                totalSections={17}
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
                totalSections={17}
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