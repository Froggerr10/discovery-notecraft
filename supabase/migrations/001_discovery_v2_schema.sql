-- =====================================================
-- DISCOVERY NOTECRAFT™ - SCHEMA SUPABASE V2
-- Sistema completo com Seção 0 e responsáveis
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS section_progress CASCADE;
DROP TABLE IF EXISTS discovery_submissions CASCADE;

-- =====================================================
-- TABELA PRINCIPAL: DISCOVERY SUBMISSIONS
-- =====================================================
CREATE TABLE discovery_submissions (
  -- Identificação
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Seção 0: Dados CNPJ (automatizados)
  cnpj VARCHAR(14) NOT NULL,
  company_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- company_data contém:
  -- {
  --   "razaoSocial": "string",
  --   "nomeFantasia": "string", 
  --   "porte": "MEI|ME|EPP|MEDIO|GRANDE",
  --   "cnaesPrincipais": ["string"],
  --   "uf": "string",
  --   "cidade": "string",
  --   "capitalSocial": number,
  --   "dataAbertura": "string",
  --   "situacaoCadastral": "string",
  --   "naturezaJuridica": "string",
  --   "qtdSocios": number,
  --   "segmentoTributario": "string",
  --   "complexidadeFiscal": "BAIXA|MEDIA|ALTA"
  -- }
  
  -- Informações do contato principal
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  contact_position VARCHAR(100),
  
  -- Metadados do formulário
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'analyzing', 'analyzed')),
  
  -- Sistema de responsáveis por seção
  section_responsibilities JSONB DEFAULT '{}'::jsonb,
  -- Formato:
  -- {
  --   "1": {"email": "cfo@company.com", "name": "João Silva", "assignedAt": "2025-01-01T10:00:00Z"},
  --   "2": {"email": "cto@company.com", "name": "Maria Santos", "assignedAt": "2025-01-01T10:00:00Z"}
  -- }
  
  -- Respostas do questionário
  responses JSONB DEFAULT '[]'::jsonb,
  -- Array de QuestionResponse objects
  
  -- Análise IA
  analysis_completed BOOLEAN DEFAULT FALSE,
  analysis_started_at TIMESTAMP WITH TIME ZONE,
  analysis_completed_at TIMESTAMP WITH TIME ZONE,
  analysis_data JSONB,
  
  -- Campos IA-Aware (insights ocultos)
  ai_insights JSONB DEFAULT '{}'::jsonb,
  -- Formato:
  -- {
  --   "overallReadiness": "string",
  --   "hiddenOpportunities": ["string"],
  --   "resistanceFactors": ["string"],
  --   "priorityActions": ["string"]
  -- }
  
  -- Controle
  total_sections INTEGER DEFAULT 17,
  completed_sections INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00
);

-- =====================================================
-- TABELA: PROGRESSO POR SEÇÃO
-- =====================================================
CREATE TABLE section_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES discovery_submissions(id) ON DELETE CASCADE,
  section_number INTEGER NOT NULL,
  section_name VARCHAR(255) NOT NULL,
  
  -- Responsável
  responsible_email VARCHAR(255),
  responsible_name VARCHAR(255),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Progresso
  started_at TIMESTAMP WITH TIME ZONE,
  last_updated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Métricas
  questions_total INTEGER NOT NULL DEFAULT 0,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  
  -- Unique constraint
  UNIQUE(submission_id, section_number)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_submissions_cnpj ON discovery_submissions(cnpj);
CREATE INDEX idx_submissions_status ON discovery_submissions(status);
CREATE INDEX idx_submissions_created ON discovery_submissions(created_at DESC);
CREATE INDEX idx_progress_submission ON section_progress(submission_id);
CREATE INDEX idx_progress_status ON section_progress(status);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER update_discovery_submissions_updated_at 
  BEFORE UPDATE ON discovery_submissions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular progresso total
CREATE OR REPLACE FUNCTION calculate_submission_progress(submission_uuid UUID)
RETURNS TABLE (
  total_questions INTEGER,
  answered_questions INTEGER,
  completion_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(sp.questions_total), 0)::INTEGER,
    COALESCE(SUM(sp.questions_answered), 0)::INTEGER,
    CASE 
      WHEN COALESCE(SUM(sp.questions_total), 0) = 0 THEN 0.00
      ELSE ROUND((COALESCE(SUM(sp.questions_answered), 0)::DECIMAL / SUM(sp.questions_total)::DECIMAL) * 100, 2)
    END
  FROM section_progress sp
  WHERE sp.submission_id = submission_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View consolidada de submissions com progresso
CREATE OR REPLACE VIEW v_submissions_with_progress AS
SELECT 
  ds.*,
  COALESCE(progress.total_questions, 0) as total_questions,
  COALESCE(progress.answered_questions, 0) as answered_questions,
  COALESCE(progress.completion_percentage, 0.00) as calculated_completion
FROM discovery_submissions ds
LEFT JOIN LATERAL (
  SELECT * FROM calculate_submission_progress(ds.id)
) progress ON true;

-- =====================================================
-- SEGURANÇA: Row Level Security (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE discovery_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_progress ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessidade de autenticação)
-- Por enquanto, permitir todas as operações (desenvolvimento)
CREATE POLICY "Enable all for development" ON discovery_submissions
  FOR ALL USING (true);

CREATE POLICY "Enable all for development" ON section_progress
  FOR ALL USING (true);

-- =====================================================
-- DADOS INICIAIS: Metadados das seções
-- =====================================================

-- Criar tabela de metadados de seções (referência)
CREATE TABLE IF NOT EXISTS section_metadata (
  section_number INTEGER PRIMARY KEY,
  section_name VARCHAR(255) NOT NULL,
  suggested_role VARCHAR(100),
  suggested_department VARCHAR(100),
  priority_level VARCHAR(20) CHECK (priority_level IN ('critical', 'high', 'medium', 'low')),
  estimated_time_minutes INTEGER DEFAULT 15
);

-- Inserir metadados das seções
INSERT INTO section_metadata (section_number, section_name, suggested_role, suggested_department, priority_level, estimated_time_minutes) VALUES
(1, 'Escolha e Priorização de Serviços', 'Diretoria/Sócios', 'Estratégico', 'critical', 20),
(2, 'Base de Conhecimento Existente', 'Diretor Técnico/CTO', 'Tecnologia/Processos', 'high', 25),
(3, 'Visão de Automação e IA', 'Diretoria + Gerente Técnico', 'Estratégico/Tecnologia', 'critical', 25),
(4, 'Percepção de Valor', 'Diretoria/Sócios', 'Estratégico', 'high', 15),
(5, 'Cenário Comercial Futuro', 'Diretor Comercial', 'Comercial/Estratégico', 'high', 15),
(6, 'Ecossistema Tecnológico', 'Responsável TI/CTO', 'Tecnologia', 'medium', 15),
(7, 'Estrutura Organizacional', 'RH/Diretor Administrativo', 'Recursos Humanos', 'medium', 20),
(8, 'Performance e KPIs', 'Gerente/Controller', 'Financeiro/Controladoria', 'high', 20),
(9, 'Marketing e Prospecção', 'Diretor Comercial', 'Comercial/Marketing', 'high', 20),
(10, 'Fontes Jurídicas e Pesquisa', 'Coordenador Jurídico', 'Jurídico/Técnico', 'medium', 15),
(11, 'Maturidade Digital', 'CTO/Responsável TI', 'Tecnologia', 'medium', 15),
(12, 'Captura de Conversas', 'Gerente de Projetos', 'Operacional', 'low', 15),
(13, 'Suporte ao Cliente', 'Gerente de Relacionamento', 'Atendimento/CS', 'medium', 15),
(14, 'Comunicação Proativa', 'Customer Success', 'Relacionamento', 'low', 15),
(15, 'Expansão e Plataformização', 'Diretoria/Sócios', 'Estratégico', 'low', 15),
(16, 'Agentes Comerciais Principais', 'Diretor Comercial', 'Comercial', 'critical', 10),
(17, 'Agentes Avançados', 'CTO/Diretor Técnico', 'Tecnologia', 'low', 10);

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE discovery_submissions IS 'Tabela principal para armazenar submissões do questionário Discovery Notecraft™';
COMMENT ON TABLE section_progress IS 'Controle de progresso por seção com responsáveis designados';
COMMENT ON TABLE section_metadata IS 'Metadados estáticos sobre cada seção do questionário';

COMMENT ON COLUMN discovery_submissions.cnpj IS 'CNPJ da empresa (14 dígitos, sem formatação)';
COMMENT ON COLUMN discovery_submissions.company_data IS 'Dados completos obtidos via API CNPJ';
COMMENT ON COLUMN discovery_submissions.section_responsibilities IS 'Mapeamento de responsáveis por seção';
COMMENT ON COLUMN discovery_submissions.ai_insights IS 'Insights de IA não visíveis ao usuário final';
