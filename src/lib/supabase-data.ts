import { supabase } from './supabase';
import { Usuario, Chave, RegistroChave, DashboardStats } from './types';

// Dados locais de fallback
const dadosLocais = {
  usuarios: [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@imobiliaria.com',
      senha: '123456',
      cargo: 'corretor' as const,
      ativo: true,
      criadoEm: new Date('2024-01-01')
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@imobiliaria.com',
      senha: '123456',
      cargo: 'admin' as const,
      ativo: true,
      criadoEm: new Date('2024-01-01')
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      email: 'pedro@imobiliaria.com',
      senha: '123456',
      cargo: 'corretor' as const,
      ativo: true,
      criadoEm: new Date('2024-01-01')
    },
    {
      id: '4',
      nome: 'Eduardo Armito',
      email: 'eduarmito790@gmail.com',
      senha: '123456',
      cargo: 'admin' as const,
      ativo: true,
      criadoEm: new Date('2024-01-01')
    }
  ] as Usuario[],
  
  chaves: [
    {
      id: '1',
      codigoImovel: 'APT001',
      endereco: 'Rua das Flores, 123 - Apto 101',
      tipo: 'apartamento' as const,
      armario: 'A1',
      status: 'disponivel' as const,
      qrCode: 'QR_APT001',
      criadoEm: new Date('2024-01-01'),
      atualizadoEm: new Date('2024-01-01')
    },
    {
      id: '2',
      codigoImovel: 'APT002',
      endereco: 'Av. Central, 456 - Apto 205',
      tipo: 'apartamento' as const,
      armario: 'A2',
      status: 'em_uso' as const,
      qrCode: 'QR_APT002',
      criadoEm: new Date('2024-01-01'),
      atualizadoEm: new Date('2024-01-01')
    },
    {
      id: '3',
      codigoImovel: 'CASA001',
      endereco: 'Rua do Sol, 789',
      tipo: 'casa' as const,
      armario: 'B1',
      status: 'disponivel' as const,
      qrCode: 'QR_CASA001',
      criadoEm: new Date('2024-01-01'),
      atualizadoEm: new Date('2024-01-01')
    },
    {
      id: '4',
      codigoImovel: 'COM001',
      endereco: 'Rua Comercial, 321 - Loja 1',
      tipo: 'comercial' as const,
      armario: 'C1',
      status: 'em_uso' as const,
      qrCode: 'QR_COM001',
      criadoEm: new Date('2024-01-01'),
      atualizadoEm: new Date('2024-01-01')
    },
    {
      id: '5',
      codigoImovel: 'APT003',
      endereco: 'Rua Nova, 654 - Apto 302',
      tipo: 'apartamento' as const,
      armario: 'A3',
      status: 'disponivel' as const,
      qrCode: 'QR_APT003',
      criadoEm: new Date('2024-01-01'),
      atualizadoEm: new Date('2024-01-01')
    }
  ] as Chave[],
  
  registros: [
    {
      id: '1',
      chaveId: '2',
      usuarioId: '1',
      acao: 'retirada' as const,
      dataHora: new Date('2024-03-10T09:30:00'),
      observacoes: 'Visita agendada para 14h'
    },
    {
      id: '2',
      chaveId: '4',
      usuarioId: '3',
      acao: 'retirada' as const,
      dataHora: new Date('2024-03-05T10:15:00'),
      observacoes: 'Vistoria do imóvel',
      atrasado: true
    }
  ] as RegistroChave[]
};

// Estado para controlar se as tabelas existem
let tabelasExistem = {
  usuarios: false,
  chaves: false,
  registros: false
};

// Função para verificar se o Supabase está configurado
const isSupabaseConfigured = () => {
  try {
    // Tenta fazer uma operação simples para verificar se está configurado
    return supabase && supabase.supabaseUrl && supabase.supabaseKey;
  } catch {
    return false;
  }
};

// Função para verificar se uma tabela existe
const verificarTabelaExiste = async (nomeTabela: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from(nomeTabela)
      .select('*')
      .limit(1);

    if (error) {
      // Se o erro é PGRST205, a tabela não existe
      if (error.code === 'PGRST205') {
        console.log(`ℹ️ Tabela '${nomeTabela}' não existe no Supabase - usando dados locais`);
        return false;
      }
      // Outros erros também indicam problema de acesso
      console.log(`⚠️ Erro ao acessar tabela '${nomeTabela}':`, error.message);
      return false;
    }

    console.log(`✅ Tabela '${nomeTabela}' existe e está acessível`);
    return true;
  } catch (error) {
    console.log(`❌ Erro ao verificar tabela '${nomeTabela}':`, error);
    return false;
  }
};

// Função para criar tabelas se não existirem
const criarTabelasSeNecessario = async () => {
  if (!isSupabaseConfigured()) {
    console.log('ℹ️ Supabase não configurado - usando dados locais');
    return false;
  }

  try {
    console.log('🔧 Tentando criar tabelas no Supabase...');
    
    // Tentar criar as tabelas usando SQL direto
    const sqlCommands = [
      // Criar tabela de usuários
      `CREATE TABLE IF NOT EXISTS public.usuarios (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        cargo VARCHAR(20) CHECK (cargo IN ('admin', 'corretor')) NOT NULL,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Criar tabela de chaves
      `CREATE TABLE IF NOT EXISTS public.chaves (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        codigo_imovel VARCHAR(100) UNIQUE NOT NULL,
        endereco TEXT NOT NULL,
        tipo VARCHAR(20) CHECK (tipo IN ('apartamento', 'casa', 'comercial', 'terreno')) NOT NULL,
        armario VARCHAR(10) NOT NULL,
        status VARCHAR(20) CHECK (status IN ('disponivel', 'em_uso', 'manutencao')) DEFAULT 'disponivel',
        qr_code VARCHAR(100) UNIQUE NOT NULL,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Criar tabela de registros
      `CREATE TABLE IF NOT EXISTS public.registros_chaves (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        chave_id UUID REFERENCES public.chaves(id) ON DELETE CASCADE,
        usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
        acao VARCHAR(20) CHECK (acao IN ('retirada', 'devolucao')) NOT NULL,
        data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        observacoes TEXT,
        atrasado BOOLEAN DEFAULT false
      );`,
      
      // Habilitar RLS
      `ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.chaves ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.registros_chaves ENABLE ROW LEVEL SECURITY;`,
      
      // Criar políticas permissivas
      `CREATE POLICY IF NOT EXISTS "Permitir tudo para usuários" ON public.usuarios FOR ALL USING (true);`,
      `CREATE POLICY IF NOT EXISTS "Permitir tudo para chaves" ON public.chaves FOR ALL USING (true);`,
      `CREATE POLICY IF NOT EXISTS "Permitir tudo para registros" ON public.registros_chaves FOR ALL USING (true);`
    ];

    // Executar comandos SQL um por um
    for (const sql of sqlCommands) {
      try {
        await supabase.rpc('exec_sql', { sql });
      } catch (error) {
        // Se exec_sql não funcionar, continuar - as tabelas podem já existir
        console.log('⚠️ Comando SQL falhou (pode ser normal):', error);
      }
    }

    console.log('✅ Processo de criação de tabelas concluído');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    return false;
  }
};

// Função para inicializar dados no Supabase (executar apenas uma vez)
export const inicializarDados = async () => {
  if (!isSupabaseConfigured()) {
    console.log('ℹ️ Supabase não configurado - sistema funcionará com dados locais');
    return;
  }

  try {
    console.log('🚀 Inicializando sistema...');

    // Primeiro, verificar se as tabelas existem
    const [usuariosExiste, chavesExiste, registrosExiste] = await Promise.all([
      verificarTabelaExiste('usuarios'),
      verificarTabelaExiste('chaves'),
      verificarTabelaExiste('registros_chaves')
    ]);

    // Atualizar estado das tabelas
    tabelasExistem = {
      usuarios: usuariosExiste,
      chaves: chavesExiste,
      registros: registrosExiste
    };

    // Se nenhuma tabela existe, tentar criar
    if (!usuariosExiste && !chavesExiste && !registrosExiste) {
      console.log('📋 Nenhuma tabela encontrada - tentando criar...');
      await criarTabelasSeNecessario();
      
      // Verificar novamente após tentativa de criação
      const [usuariosExiste2, chavesExiste2, registrosExiste2] = await Promise.all([
        verificarTabelaExiste('usuarios'),
        verificarTabelaExiste('chaves'),
        verificarTabelaExiste('registros_chaves')
      ]);

      tabelasExistem = {
        usuarios: usuariosExiste2,
        chaves: chavesExiste2,
        registros: registrosExiste2
      };
    }

    // Se as tabelas existem, tentar inserir dados iniciais
    if (tabelasExistem.usuarios && tabelasExistem.chaves) {
      await inserirDadosIniciais();
    }

    // Log do status final
    const statusMsg = Object.entries(tabelasExistem)
      .map(([tabela, existe]) => `${tabela}: ${existe ? '✅' : '❌'}`)
      .join(', ');
    
    console.log(`📊 Status das tabelas: ${statusMsg}`);
    
    if (!tabelasExistem.usuarios || !tabelasExistem.chaves || !tabelasExistem.registros) {
      console.log('ℹ️ Algumas tabelas não estão disponíveis - sistema funcionará com dados locais');
    }

  } catch (error) {
    console.error('❌ Erro durante inicialização:', error);
    console.log('ℹ️ Sistema funcionará com dados locais');
  }
};

// Função para inserir dados iniciais
const inserirDadosIniciais = async () => {
  try {
    // Verificar se já existem dados
    const { data: usuariosExistentes, error: errorUsuarios } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (errorUsuarios || !usuariosExistentes) {
      console.log('⚠️ Erro ao verificar usuários existentes - pulando inserção inicial');
      return;
    }

    if (usuariosExistentes.length > 0) {
      console.log('ℹ️ Dados já existem no banco');
      return;
    }

    console.log('📝 Inserindo dados iniciais...');

    // Inserir usuários iniciais
    const usuariosIniciais = [
      {
        nome: 'João Silva',
        email: 'joao@imobiliaria.com',
        senha: '123456',
        cargo: 'corretor' as const,
        ativo: true
      },
      {
        nome: 'Maria Santos',
        email: 'maria@imobiliaria.com',
        senha: '123456',
        cargo: 'admin' as const,
        ativo: true
      },
      {
        nome: 'Pedro Costa',
        email: 'pedro@imobiliaria.com',
        senha: '123456',
        cargo: 'corretor' as const,
        ativo: true
      },
      {
        nome: 'Eduardo Armito',
        email: 'eduarmito790@gmail.com',
        senha: '123456',
        cargo: 'admin' as const,
        ativo: true
      }
    ];

    const { data: usuariosInseridos, error: errorInsertUsuarios } = await supabase
      .from('usuarios')
      .insert(usuariosIniciais)
      .select();

    if (errorInsertUsuarios) {
      console.error('❌ Erro ao inserir usuários:', errorInsertUsuarios);
      return;
    }

    if (!usuariosInseridos) return;

    // Inserir chaves iniciais
    const chavesIniciais = [
      {
        codigo_imovel: 'APT001',
        endereco: 'Rua das Flores, 123 - Apto 101',
        tipo: 'apartamento' as const,
        armario: 'A1',
        status: 'disponivel' as const,
        qr_code: 'QR_APT001'
      },
      {
        codigo_imovel: 'APT002',
        endereco: 'Av. Central, 456 - Apto 205',
        tipo: 'apartamento' as const,
        armario: 'A2',
        status: 'em_uso' as const,
        qr_code: 'QR_APT002'
      },
      {
        codigo_imovel: 'CASA001',
        endereco: 'Rua do Sol, 789',
        tipo: 'casa' as const,
        armario: 'B1',
        status: 'disponivel' as const,
        qr_code: 'QR_CASA001'
      },
      {
        codigo_imovel: 'COM001',
        endereco: 'Rua Comercial, 321 - Loja 1',
        tipo: 'comercial' as const,
        armario: 'C1',
        status: 'em_uso' as const,
        qr_code: 'QR_COM001'
      },
      {
        codigo_imovel: 'APT003',
        endereco: 'Rua Nova, 654 - Apto 302',
        tipo: 'apartamento' as const,
        armario: 'A3',
        status: 'disponivel' as const,
        qr_code: 'QR_APT003'
      }
    ];

    const { data: chavesInseridas, error: errorInsertChaves } = await supabase
      .from('chaves')
      .insert(chavesIniciais)
      .select();

    if (errorInsertChaves) {
      console.error('❌ Erro ao inserir chaves:', errorInsertChaves);
      return;
    }

    if (!chavesInseridas || !usuariosInseridos) return;

    // Inserir alguns registros iniciais
    const registrosIniciais = [
      {
        chave_id: chavesInseridas[1].id, // APT002
        usuario_id: usuariosInseridos[0].id, // João Silva
        acao: 'retirada' as const,
        data_hora: new Date('2024-03-10T09:30:00').toISOString(),
        observacoes: 'Visita agendada para 14h'
      },
      {
        chave_id: chavesInseridas[3].id, // COM001
        usuario_id: usuariosInseridos[2].id, // Pedro Costa
        acao: 'retirada' as const,
        data_hora: new Date('2024-03-05T10:15:00').toISOString(),
        observacoes: 'Vistoria do imóvel',
        atrasado: true
      }
    ];

    const { error: errorInsertRegistros } = await supabase
      .from('registros_chaves')
      .insert(registrosIniciais);

    if (errorInsertRegistros) {
      console.error('❌ Erro ao inserir registros:', errorInsertRegistros);
    } else {
      console.log('✅ Dados iniciais inseridos com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error);
  }
};

// Funções para buscar dados do Supabase ou fallback local
export const getUsuarios = async (): Promise<Usuario[]> => {
  if (!isSupabaseConfigured() || !tabelasExistem.usuarios) {
    console.log('ℹ️ Usando dados locais para usuários');
    return [...dadosLocais.usuarios];
  }

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.log('⚠️ Erro ao buscar usuários do Supabase, usando dados locais:', error.message);
      return [...dadosLocais.usuarios];
    }

    return data.map(user => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      senha: user.senha,
      cargo: user.cargo as 'admin' | 'corretor',
      ativo: user.ativo,
      criadoEm: new Date(user.criado_em)
    }));
  } catch (error) {
    console.log('⚠️ Erro ao buscar usuários, usando dados locais:', error);
    return [...dadosLocais.usuarios];
  }
};

export const getChaves = async (): Promise<Chave[]> => {
  if (!isSupabaseConfigured() || !tabelasExistem.chaves) {
    console.log('ℹ️ Usando dados locais para chaves');
    return [...dadosLocais.chaves];
  }

  try {
    const { data, error } = await supabase
      .from('chaves')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.log('⚠️ Erro ao buscar chaves do Supabase, usando dados locais:', error.message);
      return [...dadosLocais.chaves];
    }

    return data.map(chave => ({
      id: chave.id,
      codigoImovel: chave.codigo_imovel,
      endereco: chave.endereco,
      tipo: chave.tipo as 'apartamento' | 'casa' | 'comercial' | 'terreno',
      armario: chave.armario,
      status: chave.status as 'disponivel' | 'em_uso' | 'manutencao',
      qrCode: chave.qr_code,
      criadoEm: new Date(chave.criado_em),
      atualizadoEm: new Date(chave.atualizado_em)
    }));
  } catch (error) {
    console.log('⚠️ Erro ao buscar chaves, usando dados locais:', error);
    return [...dadosLocais.chaves];
  }
};

export const getRegistrosChaves = async (): Promise<RegistroChave[]> => {
  if (!isSupabaseConfigured() || !tabelasExistem.registros) {
    console.log('ℹ️ Usando dados locais para registros');
    return [...dadosLocais.registros];
  }

  try {
    const { data, error } = await supabase
      .from('registros_chaves')
      .select('*')
      .order('data_hora', { ascending: false });

    if (error) {
      console.log('⚠️ Erro ao buscar registros do Supabase, usando dados locais:', error.message);
      return [...dadosLocais.registros];
    }

    return data.map(registro => ({
      id: registro.id,
      chaveId: registro.chave_id,
      usuarioId: registro.usuario_id,
      acao: registro.acao as 'retirada' | 'devolucao',
      dataHora: new Date(registro.data_hora),
      observacoes: registro.observacoes || undefined,
      atrasado: registro.atrasado || undefined
    }));
  } catch (error) {
    console.log('⚠️ Erro ao buscar registros, usando dados locais:', error);
    return [...dadosLocais.registros];
  }
};

// Funções para operações CRUD
export const adicionarChave = async (chave: Omit<Chave, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Chave | null> => {
  if (!isSupabaseConfigured() || !tabelasExistem.chaves) {
    const novaChave: Chave = {
      ...chave,
      id: Date.now().toString(),
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };
    dadosLocais.chaves.push(novaChave);
    return novaChave;
  }

  try {
    const { data, error } = await supabase
      .from('chaves')
      .insert({
        codigo_imovel: chave.codigoImovel,
        endereco: chave.endereco,
        tipo: chave.tipo,
        armario: chave.armario,
        status: chave.status,
        qr_code: chave.qrCode
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar chave:', error);
      return null;
    }

    return {
      id: data.id,
      codigoImovel: data.codigo_imovel,
      endereco: data.endereco,
      tipo: data.tipo as 'apartamento' | 'casa' | 'comercial' | 'terreno',
      armario: data.armario,
      status: data.status as 'disponivel' | 'em_uso' | 'manutencao',
      qrCode: data.qr_code,
      criadoEm: new Date(data.criado_em),
      atualizadoEm: new Date(data.atualizado_em)
    };
  } catch (error) {
    console.error('Erro ao adicionar chave:', error);
    return null;
  }
};

export const atualizarChave = async (id: string, updates: Partial<Chave>): Promise<boolean> => {
  if (!isSupabaseConfigured() || !tabelasExistem.chaves) {
    const index = dadosLocais.chaves.findIndex(c => c.id === id);
    if (index !== -1) {
      dadosLocais.chaves[index] = { 
        ...dadosLocais.chaves[index], 
        ...updates, 
        atualizadoEm: new Date() 
      };
      return true;
    }
    return false;
  }

  try {
    const updateData: any = {};
    
    if (updates.codigoImovel) updateData.codigo_imovel = updates.codigoImovel;
    if (updates.endereco) updateData.endereco = updates.endereco;
    if (updates.tipo) updateData.tipo = updates.tipo;
    if (updates.armario) updateData.armario = updates.armario;
    if (updates.status) updateData.status = updates.status;
    if (updates.qrCode) updateData.qr_code = updates.qrCode;
    
    updateData.atualizado_em = new Date().toISOString();

    const { error } = await supabase
      .from('chaves')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar chave:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar chave:', error);
    return false;
  }
};

export const removerChaveSupabase = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !tabelasExistem.chaves) {
    const index = dadosLocais.chaves.findIndex(c => c.id === id);
    if (index !== -1) {
      dadosLocais.chaves.splice(index, 1);
      return true;
    }
    return false;
  }

  try {
    const { error } = await supabase
      .from('chaves')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover chave:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao remover chave:', error);
    return false;
  }
};

export const adicionarRegistro = async (registro: Omit<RegistroChave, 'id' | 'dataHora'>): Promise<RegistroChave | null> => {
  if (!isSupabaseConfigured() || !tabelasExistem.registros) {
    const novoRegistro: RegistroChave = {
      ...registro,
      id: Date.now().toString(),
      dataHora: new Date()
    };
    dadosLocais.registros.push(novoRegistro);
    return novoRegistro;
  }

  try {
    const { data, error } = await supabase
      .from('registros_chaves')
      .insert({
        chave_id: registro.chaveId,
        usuario_id: registro.usuarioId,
        acao: registro.acao,
        observacoes: registro.observacoes || null,
        atrasado: registro.atrasado || false
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar registro:', error);
      return null;
    }

    return {
      id: data.id,
      chaveId: data.chave_id,
      usuarioId: data.usuario_id,
      acao: data.acao as 'retirada' | 'devolucao',
      dataHora: new Date(data.data_hora),
      observacoes: data.observacoes || undefined,
      atrasado: data.atrasado || undefined
    };
  } catch (error) {
    console.error('Erro ao adicionar registro:', error);
    return null;
  }
};

export const adicionarUsuario = async (usuario: Omit<Usuario, 'id' | 'criadoEm'>): Promise<Usuario | null> => {
  if (!isSupabaseConfigured() || !tabelasExistem.usuarios) {
    const novoUsuario: Usuario = {
      ...usuario,
      id: Date.now().toString(),
      criadoEm: new Date()
    };
    dadosLocais.usuarios.push(novoUsuario);
    return novoUsuario;
  }

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha,
        cargo: usuario.cargo,
        ativo: usuario.ativo
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar usuário:', error);
      return null;
    }

    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      cargo: data.cargo as 'admin' | 'corretor',
      ativo: data.ativo,
      criadoEm: new Date(data.criado_em)
    };
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    return null;
  }
};

export const removerUsuarioSupabase = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !tabelasExistem.usuarios) {
    const index = dadosLocais.usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      dadosLocais.usuarios.splice(index, 1);
      return true;
    }
    return false;
  }

  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover usuário:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return false;
  }
};

// Função para escutar mudanças em tempo real (apenas se Supabase configurado)
export const escutarMudancasChaves = (callback: (chaves: Chave[]) => void) => {
  if (!isSupabaseConfigured() || !tabelasExistem.chaves) {
    // Para dados locais, não há mudanças em tempo real
    return () => {};
  }

  const channel = supabase
    .channel('chaves-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'chaves' },
      async () => {
        const chaves = await getChaves();
        callback(chaves);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const escutarMudancasRegistros = (callback: (registros: RegistroChave[]) => void) => {
  if (!isSupabaseConfigured() || !tabelasExistem.registros) {
    return () => {};
  }

  const channel = supabase
    .channel('registros-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'registros_chaves' },
      async () => {
        const registros = await getRegistrosChaves();
        callback(registros);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const escutarMudancasUsuarios = (callback: (usuarios: Usuario[]) => void) => {
  if (!isSupabaseConfigured() || !tabelasExistem.usuarios) {
    return () => {};
  }

  const channel = supabase
    .channel('usuarios-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'usuarios' },
      async () => {
        const usuarios = await getUsuarios();
        callback(usuarios);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Funções utilitárias
export const getChaveById = async (id: string): Promise<Chave | null> => {
  if (!isSupabaseConfigured() || !tabelasExistem.chaves) {
    return dadosLocais.chaves.find(c => c.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('chaves')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.log('⚠️ Erro ao buscar chave por ID, usando dados locais:', error.message);
      return dadosLocais.chaves.find(c => c.id === id) || null;
    }

    return {
      id: data.id,
      codigoImovel: data.codigo_imovel,
      endereco: data.endereco,
      tipo: data.tipo as 'apartamento' | 'casa' | 'comercial' | 'terreno',
      armario: data.armario,
      status: data.status as 'disponivel' | 'em_uso' | 'manutencao',
      qrCode: data.qr_code,
      criadoEm: new Date(data.criado_em),
      atualizadoEm: new Date(data.atualizado_em)
    };
  } catch (error) {
    console.log('⚠️ Erro ao buscar chave por ID, usando dados locais:', error);
    return dadosLocais.chaves.find(c => c.id === id) || null;
  }
};

export const getUsuarioById = async (id: string): Promise<Usuario | null> => {
  if (!isSupabaseConfigured() || !tabelasExistem.usuarios) {
    return dadosLocais.usuarios.find(u => u.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.log('⚠️ Erro ao buscar usuário por ID, usando dados locais:', error.message);
      return dadosLocais.usuarios.find(u => u.id === id) || null;
    }

    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      cargo: data.cargo as 'admin' | 'corretor',
      ativo: data.ativo,
      criadoEm: new Date(data.criado_em)
    };
  } catch (error) {
    console.log('⚠️ Erro ao buscar usuário por ID, usando dados locais:', error);
    return dadosLocais.usuarios.find(u => u.id === id) || null;
  }
};

export const getUltimoRegistro = async (chaveId: string): Promise<RegistroChave | null> => {
  if (!isSupabaseConfigured() || !tabelasExistem.registros) {
    const registros = dadosLocais.registros
      .filter(r => r.chaveId === chaveId)
      .sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime());
    return registros[0] || null;
  }

  try {
    const { data, error } = await supabase
      .from('registros_chaves')
      .select('*')
      .eq('chave_id', chaveId)
      .order('data_hora', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return {
      id: data.id,
      chaveId: data.chave_id,
      usuarioId: data.usuario_id,
      acao: data.acao as 'retirada' | 'devolucao',
      dataHora: new Date(data.data_hora),
      observacoes: data.observacoes || undefined,
      atrasado: data.atrasado || undefined
    };
  } catch (error) {
    return null;
  }
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const chaves = await getChaves();
  const total = chaves.length;
  const disponiveis = chaves.filter(c => c.status === 'disponivel').length;
  const emUso = chaves.filter(c => c.status === 'em_uso').length;
  
  // Calcular chaves atrasadas (em uso há mais de 24 horas)
  const agora = new Date();
  let atrasadas = 0;
  
  for (const chave of chaves) {
    if (chave.status === 'em_uso') {
      const ultimoRegistro = await getUltimoRegistro(chave.id);
      if (ultimoRegistro && ultimoRegistro.acao === 'retirada') {
        const horasEmUso = (agora.getTime() - ultimoRegistro.dataHora.getTime()) / (1000 * 60 * 60);
        if (horasEmUso > 24) {
          atrasadas++;
        }
      }
    }
  }

  return { total, disponiveis, emUso, atrasadas };
};

export const filtrarChaves = async (filtro: { status?: string; busca?: string; tipo?: string }): Promise<Chave[]> => {
  const todasChaves = await getChaves();
  let chavesFiltradas = [...todasChaves];

  // Filtrar por status
  if (filtro.status && filtro.status !== 'todas') {
    if (filtro.status === 'disponiveis') {
      chavesFiltradas = chavesFiltradas.filter(c => c.status === 'disponivel');
    } else if (filtro.status === 'em_uso') {
      chavesFiltradas = chavesFiltradas.filter(c => c.status === 'em_uso');
    } else if (filtro.status === 'atrasadas') {
      const agora = new Date();
      const chavesAtrasadas = [];
      
      for (const chave of chavesFiltradas) {
        if (chave.status === 'em_uso') {
          const ultimoRegistro = await getUltimoRegistro(chave.id);
          if (ultimoRegistro && ultimoRegistro.acao === 'retirada') {
            const horasEmUso = (agora.getTime() - ultimoRegistro.dataHora.getTime()) / (1000 * 60 * 60);
            if (horasEmUso > 24) {
              chavesAtrasadas.push(chave);
            }
          }
        }
      }
      
      return chavesAtrasadas;
    }
  }

  // Filtrar por tipo
  if (filtro.tipo && filtro.tipo !== 'todos') {
    chavesFiltradas = chavesFiltradas.filter(c => c.tipo === filtro.tipo);
  }

  // Filtrar por busca
  if (filtro.busca) {
    const busca = filtro.busca.toLowerCase();
    chavesFiltradas = chavesFiltradas.filter(chave =>
      chave.codigoImovel.toLowerCase().includes(busca) ||
      chave.endereco.toLowerCase().includes(busca)
    );
  }

  return chavesFiltradas;
};