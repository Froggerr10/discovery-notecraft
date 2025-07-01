/**
 * =====================================================
 * DISCOVERY NOTECRAFT™ - DADOS FICTÍCIOS PARA TESTE
 * Cenário: Escritório "Silva & Associados Tributário"
 * =====================================================
 */

import { FormSubmission, QuestionResponse, ClientProfile } from './types';

export const MOCK_CLIENT_INFO: ClientProfile = {
  company: "Silva & Associados Tributário",
  name: "Dr. Roberto Silva",
  email: "roberto.silva@silvaassociados.com.br",
  phone: "(11) 99999-8888"
};

export const MOCK_RESPONSES: QuestionResponse[] = [
  // SEÇÃO 1: Escolha e Priorização de Serviços
  {
    questionId: 'q1-1',
    sectionNumber: 1,
    sectionName: 'Escolha e Priorização de Serviços',
    questionText: 'Qual é a distribuição aproximada do volume de trabalho por especialidade tributária?',
    responseType: 'slider',
    responseValue: {
      'ICMS (estadual)': 35,
      'PIS/COFINS (federal)': 25,
      'Imposto de Renda (IR/CSLL)': 20,
      'ISS (municipal)': 10,
      'Folha de pagamento (INSS/FGTS)': 5,
      'Outros tributos': 5
    },
    observations: 'Nosso escritório se especializou em ICMS nos últimos 3 anos, principalmente após as mudanças na legislação do estado de SP.',
    aiAwareNotes: 'Cliente demonstra expertise em ICMS, oportunidade para automação de cálculos complexos',
    answeredAt: new Date().toISOString()
  },
  {
    questionId: 'q1-2',
    sectionNumber: 1,
    sectionName: 'Escolha e Priorização de Serviços',
    questionText: 'Qual o percentual aproximado de faturamento que cada serviço representa?',
    responseType: 'slider',
    responseValue: {
      'RCT (Recuperação de Créditos Tributários)': 40,
      'Planejamento Tributário': 30,
      'Auditoria Tributária': 15,
      'Consultoria Tributária': 10,
      'Outros serviços': 5
    },
    observations: 'RCT é nossa principal fonte de receita, seguida de planejamento para grandes empresas.',
    aiAwareNotes: 'RCT como prioridade - potencial para agente automatizado de análise de documentos fiscais',
    answeredAt: new Date().toISOString()
  },
  {
    questionId: 'q1-3',
    sectionNumber: 1,
    sectionName: 'Escolha e Priorização de Serviços',
    questionText: 'Em qual especialidade tributária vocês se consideram mais competitivos?',
    responseType: 'radio',
    responseValue: 'ICMS',
    observations: 'Temos 15 anos de experiência em ICMS e somos referência na região para indústrias.',
    aiAwareNotes: 'Especialização em ICMS confirmada - oportunidade para agente especializado em legislação estadual',
    answeredAt: new Date().toISOString()
  },
  {
    questionId: 'q1-4',
    sectionNumber: 1,
    sectionName: 'Escolha e Priorização de Serviços',
    questionText: 'Quais serviços são mais padronizáveis (seguem roteiros similares)?',
    responseType: 'checkbox',
    responseValue: ['RCT', 'Auditoria'],
    observations: 'RCT segue roteiros bem definidos, auditoria tem checklists padronizados que desenvolvemos.',
    aiAwareNotes: 'Processos padronizáveis identificados - alta viabilidade para automação IA',
    answeredAt: new Date().toISOString()
  },
  {
    questionId: 'q1-5',
    sectionNumber: 1,
    sectionName: 'Escolha e Priorização de Serviços',
    questionText: 'Há serviços com maior risco jurídico/compliance?',
    responseType: 'checkbox',
    responseValue: ['Planejamento Tributário (Alto risco)', 'Consultoria para Disputas (Alto risco)'],
    observations: 'Planejamento exige muito cuidado, especialmente com interpretações de lei. Disputas podem ter impacto financeiro alto.',
    aiAwareNotes: 'Cliente consciente dos riscos - oportunidade para IA de compliance e validação',
    answeredAt: new Date().toISOString()
  },
  {
    questionId: 'q1-6',
    sectionNumber: 1,
    sectionName: 'Escolha e Priorização de Serviços',
    questionText: 'Qual serviço/especialidade vocês gostariam de expandir mais nos próximos 2 anos?',
    responseType: 'radio',
    responseValue: 'Consultoria Digital/IA (diferenciação)',
    observations: 'Queremos nos diferenciar no mercado oferecendo serviços mais tecnológicos.',
    aiAwareNotes: 'Cliente quer diferenciação com IA - alinhado com proposta NeuroForge',
    answeredAt: new Date().toISOString()
  },

  // SEÇÃO 2: Base de Conhecimento Existente
  {
    questionId: 'q2-1',
    sectionNumber: 2,
    sectionName: 'Base de Conhecimento Existente',
    questionText: 'Onde está armazenada a base de conhecimento técnico da empresa?',
    responseType: 'checkbox',
    responseValue: ['Nuvem (Google Drive, Dropbox, OneDrive)', 'Sistema de gestão de documentos (DMS)'],
    observations: 'Usamos Google Drive para documentos do dia a dia e um DMS específico para contratos e pareceres importantes.',
    aiAwareNotes: 'Base híbrida - oportunidade para centralização e indexação IA',
    answeredAt: new Date().toISOString()
  },
  {
    questionId: 'q2-2',
    sectionNumber: 2,
    sectionName: 'Base de Conhecimento Existente',
    questionText: 'Que tipos de documentos vocês utilizam na base de conhecimento?',
    responseType: 'checkbox',
    responseValue: ['Pareceres', 'Modelos de petições', 'Manuais internos', 'Legislação comentada', 'Jurisprudência selecionada'],
    observations: 'Temos uma biblioteca extensa de pareceres próprios que são nosso diferencial competitivo.',
    aiAwareNotes: 'Base rica de conhecimento proprietário - excelente para training de agentes especializados',
    answeredAt: new Date().toISOString()
  },

  // SEÇÃO 3: Visão de Automação e IA
  {
    questionId: 'q3-1',
    sectionNumber: 3,
    sectionName: 'Visão de Automação e IA',
    questionText: 'Existem processos tributários já automatizados na empresa?',
    responseType: 'checkbox',
    responseValue: ['Planilhas com macros/fórmulas avançadas', 'Sistemas que fazem cálculos automaticamente', 'Geração automática de relatórios'],
    observations: 'Usamos bastante Excel com macros para cálculos de ICMS e temos um sistema que gera relatórios básicos.',
    aiAwareNotes: 'Base de automação existente - facilita adoção de IA mais avançada',
    answeredAt: new Date().toISOString()
  },
  {
    questionId: 'q3-2',
    sectionNumber: 3,
    sectionName: 'Visão de Automação e IA',
    questionText: 'Alguém na empresa já testou ferramentas de IA?',
    responseType: 'checkbox',
    responseValue: ['ChatGPT para pesquisas/textos', 'Google Gemini/Bard'],
    observations: 'Alguns consultores usam ChatGPT para pesquisas rápidas e elaboração de textos iniciais.',
    aiAwareNotes: 'Já experimentaram IA - receptividade alta para soluções profissionais',
    answeredAt: new Date().toISOString()
  }

  // Adicione mais respostas conforme necessário...
];

export const MOCK_FORM_SUBMISSION: FormSubmission = {
  id: 'test-submission-001',
  clientProfile: MOCK_CLIENT_INFO,
  responses: MOCK_RESPONSES,
  status: 'draft',
  submittedAt: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isCompleted: false,
  analysisCompleted: false
};