/**
 * =====================================================
 * DISCOVERY NOTECRAFT™ - DADOS FICTÍCIOS PARA TESTE
 * Cenário: Escritório "Silva & Associados Tributário"
 * =====================================================
 */

import { FormSubmission, QuestionResponse } from './types';

export const MOCK_CLIENT_INFO = {
  companyName: "Silva & Associados Tributário",
  contactName: "Dr. Roberto Silva",
  contactEmail: "roberto.silva@silvaassociados.com.br",
  contactPhone: "(11) 99999-8888"
};

export const MOCK_RESPONSES: QuestionResponse[] = [
  // SEÇÃO 1: Escolha e Priorização de Serviços
  {
    questionId: 'q1-1',
    response: {
      'ICMS (estadual)': 35,
      'PIS/COFINS (federal)': 25,
      'Imposto de Renda (IR/CSLL)': 20,
      'ISS (municipal)': 10,
      'Folha de pagamento (INSS/FGTS)': 5,
      'Outros tributos': 5,
      additionalField: 'ICMS tem crescido muito por conta da mudança na legislação estadual'
    },
    observations: 'Nosso escritório se especializou em ICMS nos últimos 3 anos, principalmente após as mudanças na legislação do estado de SP.',
    aiAware: 'Cliente demonstra expertise em ICMS, oportunidade para automação de cálculos complexos',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q1-2',
    response: {
      'RCT (Recuperação de Créditos Tributários)': 40,
      'Planejamento Tributário': 30,
      'Auditoria Tributária': 15,
      'Consultoria Tributária': 10,
      'Outros serviços': 5
    },
    observations: 'RCT é nossa principal fonte de receita, seguida de planejamento para grandes empresas.',
    aiAware: 'RCT como prioridade - potencial para agente automatizado de análise de documentos fiscais',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q1-3',
    response: 'ICMS',
    observations: 'Temos 15 anos de experiência em ICMS e somos referência na região para indústrias.',
    aiAware: 'Especialização em ICMS confirmada - oportunidade para agente especializado em legislação estadual',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q1-4',
    response: ['RCT', 'Auditoria'],
    observations: 'RCT segue roteiros bem definidos, auditoria tem checklists padronizados que desenvolvemos.',
    aiAware: 'Processos padronizáveis identificados - alta viabilidade para automação IA',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q1-5',
    response: ['Planejamento Tributário (Alto risco)', 'Consultoria para Disputas (Alto risco)'],
    observations: 'Planejamento exige muito cuidado, especialmente com interpretações de lei. Disputas podem ter impacto financeiro alto.',
    aiAware: 'Cliente consciente dos riscos - oportunidade para IA de compliance e validação',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q1-6',
    response: 'Consultoria Digital/IA (diferenciação)',
    observations: 'Queremos nos diferenciar no mercado oferecendo serviços mais tecnológicos.',
    aiAware: 'Cliente quer diferenciação com IA - alinhado com proposta NeuroForge',
    updatedAt: new Date().toISOString()
  },

  // SEÇÃO 2: Base de Conhecimento Existente
  {
    questionId: 'q2-1',
    response: ['Nuvem (Google Drive, Dropbox, OneDrive)', 'Sistema de gestão de documentos (DMS)'],
    observations: 'Usamos Google Drive para documentos do dia a dia e um DMS específico para contratos e pareceres importantes.',
    aiAware: 'Base híbrida - oportunidade para centralização e indexação IA',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q2-2',
    response: ['Pareceres', 'Modelos de petições', 'Manuais internos', 'Legislação comentada', 'Jurisprudência selecionada'],
    observations: 'Temos uma biblioteca extensa de pareceres próprios que são nosso diferencial competitivo.',
    aiAware: 'Base rica de conhecimento proprietário - excelente para training de agentes especializados',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q2-3',
    response: 'Mais de 1000',
    observations: 'Estimamos ter cerca de 2.500 documentos entre pareceres, modelos e jurisprudência.',
    aiAware: 'Volume significativo para RAG - justifica investimento em Knowledge Vault',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q2-4',
    response: 'Indexação por palavras-chave',
    observations: 'Temos um sistema básico de tags por tributo e tipo de documento, mas ainda é muito manual.',
    aiAware: 'Sistema básico existente - oportunidade para upgrade com IA semântica',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q2-5',
    response: ['Sim, por tributo', 'Sim, por setor de atuação', 'Sim, por tipo de serviço'],
    observations: 'Organizamos por ICMS, PIS/COFINS, IR, e também por setor como indústria, comércio, serviços.',
    aiAware: 'Categorização estruturada - facilita implementação de agentes especializados',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q2-6',
    response: 'Equipe jurídica/tributária',
    observations: 'Cada consultor senior é responsável por manter sua área atualizada, coordenado pelo Dr. Silva.',
    aiAware: 'Responsabilidade distribuída - oportunidade para automação de updates',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q2-7',
    response: 'Restrito (por cargo/departamento)',
    observations: 'Sócios e seniors têm acesso completo, juniores têm acesso limitado conforme projetos.',
    aiAware: 'Controle de acesso estruturado - importante para governança IA',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q2-8',
    response: 'Sim, anual',
    observations: 'Temos orçamento de R$ 15.000/ano para atualização de bases e sistemas de pesquisa.',
    aiAware: 'Orçamento dedicado - viabiliza investimento em tecnologia',
    updatedAt: new Date().toISOString()
  },

  // SEÇÃO 3: Visão de Automação e IA
  {
    questionId: 'q3-1',
    response: ['Planilhas com macros/fórmulas avançadas', 'Sistemas que fazem cálculos automaticamente', 'Geração automática de relatórios'],
    observations: 'Usamos bastante Excel com macros para cálculos de ICMS e temos um sistema que gera relatórios básicos.',
    aiAware: 'Base de automação existente - facilita adoção de IA mais avançada',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q3-2',
    response: ['ChatGPT para pesquisas/textos', 'Google Gemini/Bard'],
    observations: 'Alguns consultores usam ChatGPT para pesquisas rápidas e elaboração de textos iniciais.',
    aiAware: 'Já experimentaram IA - receptividade alta para soluções profissionais',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q3-3',
    response: ['Pesquisa jurídica', 'Análise de documentos', 'Geração de relatórios', 'Controle de prazos e alertas'],
    observations: 'Perdemos muito tempo pesquisando jurisprudência e analisando documentos fiscais complexos.',
    aiAware: 'Áreas de alta prioridade identificadas - alinha com capacidades NeuroForge',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q3-4',
    response: 'Erro técnico que cause prejuízo financeiro ao cliente',
    observations: 'Nossa maior preocupação é a IA errar em um cálculo ou interpretação e isso gerar prejuízo para o cliente.',
    aiAware: 'Receio válido - precisa abordar confiabilidade e validação humana',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q3-5',
    response: ['Redução de tempo por caso', 'Maior precisão/menos erros', 'Aumento de escala/volume de casos', 'Diferenciação competitiva'],
    observations: 'Queremos atender mais clientes sem contratar proporcionalmente, e nos diferenciar no mercado.',
    aiAware: 'Expectativas alinhadas com benefícios reais da IA - ROI claro',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q3-6',
    response: 'Receptiva, mas com algumas preocupações',
    observations: 'A equipe está interessada mas tem receio de ser substituída. Precisamos de uma abordagem cuidadosa.',
    aiAware: 'Necessário change management - posicionar IA como amplificadora, não substituta',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q3-7',
    response: 'Sócio/Diretor seria o champion do projeto',
    observations: 'O Dr. Silva está muito interessado em tecnologia e seria o sponsor interno do projeto.',
    aiAware: 'Sponsor identificado - facilita implementação e adoção',
    updatedAt: new Date().toISOString()
  },
  {
    questionId: 'q3-8',
    response: 'ROI demonstrado em 12 meses',
    observations: 'Precisamos ver resultado financeiro claro em até 1 ano para justificar o investimento.',
    aiAware: 'Expectativa de ROI realista - foco em métricas tangíveis',
    updatedAt: new Date().toISOString()
  }

  // Adicione mais seções conforme necessário...
];

export const MOCK_FORM_SUBMISSION: FormSubmission = {
  id: 'test-submission-001',
  companyName: MOCK_CLIENT_INFO.companyName,
  contactName: MOCK_CLIENT_INFO.contactName,
  contactEmail: MOCK_CLIENT_INFO.contactEmail,
  contactPhone: MOCK_CLIENT_INFO.contactPhone,
  responses: MOCK_RESPONSES,
  status: 'draft',
  submittedAt: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};