/**
 * =====================================================
 * DISCOVERY NOTECRAFT™ - API DE CONSULTA CNPJ
 * Integração com múltiplas APIs para redundância
 * =====================================================
 */

export interface CNPJData {
  // Dados básicos
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  
  // Porte e classificação
  porte: 'MEI' | 'ME' | 'EPP' | 'MEDIO' | 'GRANDE';
  naturezaJuridica: string;
  
  // Atividades
  cnaesPrincipais: {
    codigo: string;
    descricao: string;
  }[];
  
  // Localização
  uf: string;
  cidade: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  cep?: string;
  
  // Dados financeiros e societários
  capitalSocial: number;
  dataAbertura: string;
  situacaoCadastral: string;
  dataSituacaoCadastral?: string;
  
  // Sócios (quando disponível)
  qtdSocios?: number;
  socios?: Array<{
    nome: string;
    qualificacao: string;
  }>;
  
  // Dados derivados (calculados pela nossa lógica)
  segmentoTributario?: string;
  complexidadeFiscal?: 'BAIXA' | 'MEDIA' | 'ALTA';
  idadeEmpresa?: number;
}

/**
 * APIs disponíveis para consulta (em ordem de prioridade)
 */
const CNPJ_APIS = {
  brasilAPI: {
    url: 'https://brasilapi.com.br/api/cnpj/v1/',
    rateLimit: 600, // requests por minuto
    formatter: formatBrasilAPIResponse
  },
  receitaWS: {
    url: 'https://receitaws.com.br/v1/cnpj/',
    rateLimit: 3, // requests por minuto (free tier)
    formatter: formatReceitaWSResponse
  }
};

/**
 * Formatar resposta da BrasilAPI
 */
function formatBrasilAPIResponse(data: any): CNPJData {
  return {
    cnpj: data.cnpj,
    razaoSocial: data.razao_social || data.nome_fantasia,
    nomeFantasia: data.nome_fantasia || data.razao_social,
    porte: mapPorteEmpresa(data.porte),
    naturezaJuridica: data.natureza_juridica,
    cnaesPrincipais: [{
      codigo: data.cnae_fiscal_principal,
      descricao: data.cnae_fiscal_descricao
    }],
    uf: data.uf,
    cidade: data.municipio,
    bairro: data.bairro,
    logradouro: data.logradouro,
    numero: data.numero,
    cep: data.cep,
    capitalSocial: parseFloat(data.capital_social) || 0,
    dataAbertura: data.data_inicio_atividade,
    situacaoCadastral: data.situacao_cadastral,
    dataSituacaoCadastral: data.data_situacao_cadastral,
    qtdSocios: data.qsa?.length || 0,
    socios: data.qsa?.map((socio: any) => ({
      nome: socio.nome_socio,
      qualificacao: socio.qualificacao_socio
    }))
  };
}

/**
 * Formatar resposta da ReceitaWS
 */
function formatReceitaWSResponse(data: any): CNPJData {
  return {
    cnpj: data.cnpj?.replace(/\D/g, ''),
    razaoSocial: data.nome,
    nomeFantasia: data.fantasia || data.nome,
    porte: mapPorteEmpresa(data.porte),
    naturezaJuridica: data.natureza_juridica,
    cnaesPrincipais: data.atividade_principal?.map((ativ: any) => ({
      codigo: ativ.code,
      descricao: ativ.text
    })) || [],
    uf: data.uf,
    cidade: data.municipio,
    bairro: data.bairro,
    logradouro: data.logradouro,
    numero: data.numero,
    cep: data.cep,
    capitalSocial: parseFloat(data.capital_social) || 0,
    dataAbertura: data.abertura,
    situacaoCadastral: data.situacao,
    dataSituacaoCadastral: data.data_situacao,
    qtdSocios: data.qsa?.length || 0,
    socios: data.qsa?.map((socio: any) => ({
      nome: socio.nome,
      qualificacao: socio.qual
    }))
  };
}

/**
 * Mapear porte da empresa para nosso padrão
 */
function mapPorteEmpresa(porte: string): CNPJData['porte'] {
  const porteUpper = porte?.toUpperCase() || '';
  
  if (porteUpper.includes('MEI')) return 'MEI';
  if (porteUpper.includes('ME') || porteUpper.includes('MICRO')) return 'ME';
  if (porteUpper.includes('EPP') || porteUpper.includes('PEQUENO')) return 'EPP';
  if (porteUpper.includes('MEDIO')) return 'MEDIO';
  if (porteUpper.includes('GRANDE')) return 'GRANDE';
  
  // Default baseado em outros critérios
  return 'ME';
}

/**
 * Calcular complexidade fiscal baseada em diversos fatores
 */
function calculateComplexidadeFiscal(data: CNPJData): 'BAIXA' | 'MEDIA' | 'ALTA' {
  let score = 0;
  
  // Porte da empresa
  if (data.porte === 'GRANDE') score += 3;
  else if (data.porte === 'MEDIO') score += 2;
  else if (data.porte === 'EPP') score += 1;
  
  // Quantidade de CNAEs (atividades)
  if (data.cnaesPrincipais.length > 3) score += 2;
  else if (data.cnaesPrincipais.length > 1) score += 1;
  
  // Capital social
  if (data.capitalSocial > 10000000) score += 2;
  else if (data.capitalSocial > 1000000) score += 1;
  
  // Quantidade de sócios
  if ((data.qtdSocios || 0) > 5) score += 1;
  
  // Classificação
  if (score >= 5) return 'ALTA';
  if (score >= 2) return 'MEDIA';
  return 'BAIXA';
}

/**
 * Determinar segmento tributário baseado no CNAE
 */
function determineSegmentoTributario(cnae: string): string {
  const codigo = cnae?.substring(0, 2);
  
  const segmentos: Record<string, string> = {
    '01': 'Agronegócio',
    '05': 'Indústria Extrativa',
    '10': 'Indústria de Alimentos',
    '20': 'Indústria Química',
    '25': 'Indústria Metalúrgica',
    '35': 'Energia',
    '41': 'Construção Civil',
    '45': 'Comércio Automotivo',
    '47': 'Comércio Varejista',
    '49': 'Transporte Terrestre',
    '52': 'Logística',
    '62': 'Tecnologia da Informação',
    '64': 'Serviços Financeiros',
    '68': 'Atividades Imobiliárias',
    '69': 'Atividades Jurídicas e Contábeis',
    '70': 'Consultoria Empresarial',
    '85': 'Educação',
    '86': 'Saúde'
  };
  
  return segmentos[codigo] || 'Serviços Gerais';
}

/**
 * Função principal para consultar CNPJ
 */
export async function consultarCNPJ(cnpj: string): Promise<CNPJData> {
  // Limpar CNPJ
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14) {
    throw new Error('CNPJ inválido. Deve conter 14 dígitos.');
  }
  
  // Tentar APIs em ordem de prioridade
  const apis = Object.entries(CNPJ_APIS);
  let lastError: Error | null = null;
  
  for (const [apiName, config] of apis) {
    try {
      console.log(`Tentando consultar CNPJ via ${apiName}...`);
      
      const response = await fetch(`${config.url}${cnpjLimpo}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API ${apiName} retornou status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verificar se a resposta indica erro
      if (data.status === 'ERROR' || data.erro) {
        throw new Error(data.message || 'Erro na consulta');
      }
      
      // Formatar resposta
      const cnpjData = config.formatter(data);
      
      // Enriquecer com dados calculados
      cnpjData.complexidadeFiscal = calculateComplexidadeFiscal(cnpjData);
      cnpjData.segmentoTributario = determineSegmentoTributario(
        cnpjData.cnaesPrincipais[0]?.codigo || ''
      );
      
      // Calcular idade da empresa
      if (cnpjData.dataAbertura) {
        const abertura = new Date(cnpjData.dataAbertura);
        const hoje = new Date();
        cnpjData.idadeEmpresa = Math.floor(
          (hoje.getTime() - abertura.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
      }
      
      console.log(`Consulta CNPJ bem-sucedida via ${apiName}`);
      return cnpjData;
      
    } catch (error) {
      console.error(`Erro ao consultar ${apiName}:`, error);
      lastError = error as Error;
      // Continuar para próxima API
    }
  }
  
  // Se todas as APIs falharam
  throw new Error(
    `Não foi possível consultar o CNPJ. Última tentativa: ${lastError?.message}`
  );
}

/**
 * Função mock para desenvolvimento/testes
 */
export function getMockCNPJData(cnpj: string): CNPJData {
  return {
    cnpj: cnpj.replace(/\D/g, ''),
    razaoSocial: 'EMPRESA TESTE LTDA',
    nomeFantasia: 'Empresa Teste',
    porte: 'EPP',
    naturezaJuridica: 'Sociedade Empresária Limitada',
    cnaesPrincipais: [
      {
        codigo: '6920601',
        descricao: 'Atividades de contabilidade'
      }
    ],
    uf: 'SP',
    cidade: 'São Paulo',
    bairro: 'Vila Mariana',
    logradouro: 'Rua Exemplo',
    numero: '123',
    cep: '04000000',
    capitalSocial: 100000,
    dataAbertura: '2020-01-01',
    situacaoCadastral: 'ATIVA',
    qtdSocios: 2,
    segmentoTributario: 'Atividades Jurídicas e Contábeis',
    complexidadeFiscal: 'MEDIA',
    idadeEmpresa: 5
  };
}

// Exportar types adicionais
export type { CNPJData };
