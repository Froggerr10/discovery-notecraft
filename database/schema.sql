-- =====================================================
-- DISCOVERY NOTECRAFT™ - SCHEMA SUPABASE COMPLETO
-- Criado: 30/06/2025 - Task Force 24h
-- =====================================================

-- =====================================================
-- 1. TABELA PRINCIPAL: SUBMISSÕES DO FORMULÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados do cliente
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_company VARCHAR(255) NOT NULL,
  client_position VARCHAR(255),
  client_phone VARCHAR(50),
  
  -- Metadados da submissão
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Status e análise
  is_completed BOOLEAN DEFAULT FALSE,
  analysis_completed BOOLEAN DEFAULT FALSE,
  
  -- Campos de análise
  package_recommended VARCHAR(50), -- 'entry', 'plus', 'premium'
  estimated_roi DECIMAL(5,2),
  implementation_priority VARCHAR(20) -- 'high', 'medium', 'low'
);

-- =====================================================
-- 2. RESPOSTAS DAS QUESTÕES (105 perguntas)
-- =====================================================
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES form_submissions(id) ON DELETE CASCADE,
  
  -- Identificação da questão
  section_number INTEGER NOT NULL, -- 1-17
  section_name VARCHAR(255) NOT NULL,
  question_id VARCHAR(50) NOT NULL, -- ex: 'q1-1', 'q1-2'
  question_text TEXT NOT NULL,
  
  -- Resposta estruturada
  response_type VARCHAR(50) NOT NULL, -- 'radio', 'checkbox', 'slider', 'text', 'select'
  response_value JSONB, -- Valor da resposta (flexível)
  
  -- Campos adicionais
  observations TEXT, -- Campo observações (visível)
  ai_aware_notes TEXT, -- Campo IA-Aware (oculto do cliente)
  
  -- Metadados
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices
  UNIQUE(submission_id, question_id)
);

-- =====================================================
-- 3. ANÁLISE GERAL DO DISCOVERY
-- =====================================================
CREATE TABLE IF NOT EXISTS discovery_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES form_submissions(id) ON DELETE CASCADE UNIQUE,
  
  -- Scores gerais
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  readiness_level VARCHAR(50), -- 'iniciante', 'intermediario', 'avancado'
  
  -- Scores por dimensão (JSON para flexibilidade)
  maturity_scores JSONB, -- {conhecimento: 45, processos: 78, ...}
  
  -- Recomendações
  recommended_package VARCHAR(50), -- 'entry', 'plus', 'premium'
  priority_focus TEXT, -- Foco principal recomendado
  
  -- Projeções financeiras
  roi_projection JSONB, -- {12months: 280, payback_months: 8, ...}
  investment_range JSONB, -- {min: 35000, max: 85000, recommended: 60000}
  
  -- Agentes priorizados
  priority_agents JSONB, -- Array de agentes recomendados
  
  -- Insights principais
  key_insights JSONB, -- Array dos 3 insights principais
  predicted_resistance JSONB, -- Resistências previstas
  
  -- Metadados
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyst_version VARCHAR(20) DEFAULT 'v1.0'
);

-- Continua com outras tabelas...
-- (Schema muito grande, criando em partes)