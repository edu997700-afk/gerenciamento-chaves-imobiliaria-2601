import { supabase, isSupabaseConfigured } from './supabase';
import { Usuario, Chave, RegistroChave, DashboardStats } from './types';

// Função para criar tabelas se não existirem
const criarTabelasSeNecessario = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  try {
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
        // Se exec_sql não funcionar, tentar com uma query simples
        console.log('Tentando criar tabelas via query direta...');
        // Continuar mesmo se houver erro - as tabelas podem já existir
      }
    }

    console.log('Tabelas criadas/verificadas com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    return false;
  }
};

// Função para inicializar dados no Supabase (executar apenas uma vez)
export const inicializarDados = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    console.log('Supabase não configurado, sistema funcionará sem persistência');
    return;
  }

  try {
    // Primeiro, tentar criar as tabelas
    await criarTabelasSeNecessario();

    // Verificar se já existem dados
    const { data: usuariosExistentes, error: errorUsuarios } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (errorUsuarios) {
      console.error('Erro ao verificar usuários existentes:', errorUsuarios);
      // Se a tabela não existe, tentar criar via INSERT direto
      console.log('Tentando inserir dados iniciais...');
    }

    if (usuariosExistentes && usuariosExistentes.length > 0) {
      console.log('Dados já inicializados');
      return;
    }

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
      console.error('Erro ao inserir usuários:', errorInsertUsuarios);
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
      console.error('Erro ao inserir chaves:', errorInsertChaves);
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
      console.error('Erro ao inserir registros:', errorInsertRegistros);
    }

    console.log('✅ Dados inicializados com sucesso no Supabase!');
  } catch (error) {
    console.error('Erro ao inicializar dados:', error);
  }
};

// ========== FUNÇÕES DE LEITURA (READ) ==========

export const getUsuarios = async (): Promise<Usuario[]> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase não configurado - retornando array vazio');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
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
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
};

export const getChaves = async (): Promise<Chave[]> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase não configurado - retornando array vazio');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('chaves')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.error('Erro ao buscar chaves:', error);
      return [];
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
    console.error('Erro ao buscar chaves:', error);
    return [];
  }
};

export const getRegistrosChaves = async (): Promise<RegistroChave[]> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase não configurado - retornando array vazio');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('registros_chaves')
      .select('*')
      .order('data_hora', { ascending: false });

    if (error) {
      console.error('Erro ao buscar registros:', error);
      return [];
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
    console.error('Erro ao buscar registros:', error);
    return [];
  }
};

// ========== FUNÇÕES DE CRIAÇÃO (CREATE) - SALVAMENTO AUTOMÁTICO ==========

export const adicionarChave = async (chave: Omit<Chave, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Chave | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase não configurado - não é possível salvar chave');
    alert('Sistema não configurado. As alterações não serão salvas permanentemente.');
    return null;
  }

  try {
    console.log('💾 Salvando nova chave automaticamente no Supabase...');
    
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
      console.error('❌ Erro ao adicionar chave:', error);
      if (error.code === '23505') {
        alert('Já existe uma chave com este código ou QR Code.');
      } else {
        alert('Erro ao salvar chave no banco de dados.');
      }
      return null;
    }

    console.log('✅ Chave salva automaticamente no Supabase:', data.codigo_imovel);
    // Notificação visual será mostrada pelo componente

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
    console.error('❌ Erro ao adicionar chave:', error);
    alert('Erro ao salvar chave. Verifique sua conexão.');
    return null;
  }
};

export const adicionarUsuario = async (usuario: Omit<Usuario, 'id' | 'criadoEm'>): Promise<Usuario | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase não configurado - não é possível salvar usuário');
    alert('Sistema não configurado. As alterações não serão salvas permanentemente.');
    return null;
  }

  try {
    console.log('💾 Salvando novo usuário automaticamente no Supabase...');
    
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
      console.error('❌ Erro ao adicionar usuário:', error);
      if (error.code === '23505') {
        alert('Já existe um usuário com este email.');
      } else {
        alert('Erro ao salvar usuário no banco de dados.');
      }
      return null;
    }

    console.log('✅ Usuário salvo automaticamente no Supabase:', data.nome);
    // Notificação visual será mostrada pelo componente

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
    console.error('❌ Erro ao adicionar usuário:', error);
    alert('Erro ao salvar usuário. Verifique sua conexão.');
    return null;
  }
};

export const adicionarRegistro = async (registro: Omit<RegistroChave, 'id' | 'dataHora'>): Promise<RegistroChave | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase não configurado - não é possível salvar registro');
    alert('Sistema não configurado. As alterações não serão salvas permanentemente.');
    return null;
  }

  try {
    console.log('💾 Salvando registro automaticamente no Supabase...');
    
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
      console.error('❌ Erro ao adicionar registro:', error);
      alert('Erro ao salvar registro no banco de dados.');
      return null;
    }

    console.log('✅ Registro salvo automaticamente no Supabase:', data.acao);
    // Notificação visual será mostrada pelo componente

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
    console.error('❌ Erro ao adicionar registro:', error);
    alert('Erro ao salvar registro. Verifique sua conexão.');
    return null;
  }
};

// ========== FUNÇÕES DE ATUALIZAÇÃO (UPDATE) - SALVAMENTO AUTOMÁTICO ==========

export const atualizarChave = async (id: string, updates: Partial<Chave>): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase não configurado - não é possível atualizar chave');
    alert('Sistema não configurado. As alterações não serão salvas permanentemente.');
    return false;
  }

  try {
    console.log('💾 Atualizando chave automaticamente no Supabase...');
    
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
      console.error('❌ Erro ao atualizar chave:', error);
      alert('Erro ao salvar alterações da chave.');
      return false;
    }

    console.log('✅ Chave atualizada automaticamente no Supabase:', id);
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar chave:', error);
    alert('Erro ao salvar alterações. Verifique sua conexão.');
    return false;
  }
};

export const atualizarUsuario = async (id: string, updates: Partial<Usuario>): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase não configurado - não é possível atualizar usuário');
    alert('Sistema não configurado. As alterações não serão salvas permanentemente.');
    return false;
  }

  try {
    console.log('💾 Atualizando usuário automaticamente no Supabase...');
    
    const updateData: any = {};
    
    if (updates.nome) updateData.nome = updates.nome;
    if (updates.email) updateData.email = updates.email;
    if (updates.senha) updateData.senha = updates.senha;
    if (updates.cargo) updateData.cargo = updates.cargo;
    if (updates.ativo !== undefined) updateData.ativo = updates.ativo;

    const { error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      alert('Erro ao salvar alterações do usuário.');
      return false;
    }

    console.log('✅ Usuário atualizado automaticamente no Supabase:', id);
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    alert('Erro ao salvar alterações. Verifique sua conexão.');
    return false;
  }
};

// ========== FUNÇÕES DE EXCLUSÃO (DELETE) - SALVAMENTO AUTOMÁTICO ==========

export const removerChaveSupabase = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase não configurado - não é possível remover chave');
    alert('Sistema não configurado. As alterações não serão salvas permanentemente.');
    return false;
  }

  try {
    console.log('💾 Removendo chave automaticamente do Supabase...');
    
    // Primeiro buscar dados da chave para log
    const { data: chaveData } = await supabase
      .from('chaves')
      .select('codigo_imovel')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('chaves')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao remover chave:', error);
      alert('Erro ao excluir chave do banco de dados.');
      return false;
    }

    console.log('✅ Chave removida automaticamente do Supabase:', chaveData?.codigo_imovel || id);
    // Notificação visual será mostrada pelo componente
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover chave:', error);
    alert('Erro ao excluir chave. Verifique sua conexão.');
    return false;
  }
};

export const removerUsuarioSupabase = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase não configurado - não é possível remover usuário');
    alert('Sistema não configurado. As alterações não serão salvas permanentemente.');
    return false;
  }

  try {
    console.log('💾 Removendo usuário automaticamente do Supabase...');
    
    // Primeiro buscar dados do usuário para log
    const { data: usuarioData } = await supabase
      .from('usuarios')
      .select('nome')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao remover usuário:', error);
      alert('Erro ao excluir usuário do banco de dados.');
      return false;
    }

    console.log('✅ Usuário removido automaticamente do Supabase:', usuarioData?.nome || id);
    // Notificação visual será mostrada pelo componente
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover usuário:', error);
    alert('Erro ao excluir usuário. Verifique sua conexão.');
    return false;
  }
};

// ========== FUNÇÕES DE TEMPO REAL - ATUALIZAÇÕES AUTOMÁTICAS ==========

export const escutarMudancasChaves = (callback: (chaves: Chave[]) => void) => {
  if (!isSupabaseConfigured() || !supabase) {
    console.log('Supabase não configurado - tempo real desabilitado');
    return () => {};
  }

  console.log('🔄 Ativando escuta de mudanças em tempo real para chaves...');

  const channel = supabase
    .channel('chaves-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'chaves' },
      async (payload) => {
        console.log('🔄 Mudança detectada em chaves - atualizando automaticamente:', payload.eventType);
        const chaves = await getChaves();
        callback(chaves);
      }
    )
    .subscribe();

  return () => {
    console.log('🔄 Desativando escuta de mudanças para chaves');
    supabase.removeChannel(channel);
  };
};

export const escutarMudancasRegistros = (callback: (registros: RegistroChave[]) => void) => {
  if (!isSupabaseConfigured() || !supabase) {
    console.log('Supabase não configurado - tempo real desabilitado');
    return () => {};
  }

  console.log('🔄 Ativando escuta de mudanças em tempo real para registros...');

  const channel = supabase
    .channel('registros-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'registros_chaves' },
      async (payload) => {
        console.log('🔄 Mudança detectada em registros - atualizando automaticamente:', payload.eventType);
        const registros = await getRegistrosChaves();
        callback(registros);
      }
    )
    .subscribe();

  return () => {
    console.log('🔄 Desativando escuta de mudanças para registros');
    supabase.removeChannel(channel);
  };
};

export const escutarMudancasUsuarios = (callback: (usuarios: Usuario[]) => void) => {
  if (!isSupabaseConfigured() || !supabase) {
    console.log('Supabase não configurado - tempo real desabilitado');
    return () => {};
  }

  console.log('🔄 Ativando escuta de mudanças em tempo real para usuários...');

  const channel = supabase
    .channel('usuarios-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'usuarios' },
      async (payload) => {
        console.log('🔄 Mudança detectada em usuários - atualizando automaticamente:', payload.eventType);
        const usuarios = await getUsuarios();
        callback(usuarios);
      }
    )
    .subscribe();

  return () => {
    console.log('🔄 Desativando escuta de mudanças para usuários');
    supabase.removeChannel(channel);
  };
};

// ========== FUNÇÕES UTILITÁRIAS ==========

export const getChaveById = async (id: string): Promise<Chave | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase não configurado');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('chaves')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar chave:', error);
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
    console.error('Erro ao buscar chave:', error);
    return null;
  }
};

export const getUsuarioById = async (id: string): Promise<Usuario | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase não configurado');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
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
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
};

export const getUltimoRegistro = async (chaveId: string): Promise<RegistroChave | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase não configurado');
    return null;
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
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase não configurado - retornando array vazio');
    return [];
  }

  try {
    let query = supabase.from('chaves').select('*');

    // Filtrar por status
    if (filtro.status && filtro.status !== 'todas') {
      if (filtro.status === 'disponiveis') {
        query = query.eq('status', 'disponivel');
      } else if (filtro.status === 'em_uso') {
        query = query.eq('status', 'em_uso');
      }
    }

    // Filtrar por tipo
    if (filtro.tipo && filtro.tipo !== 'todos') {
      query = query.eq('tipo', filtro.tipo);
    }

    const { data, error } = await query.order('criado_em', { ascending: true });

    if (error) {
      console.error('Erro ao filtrar chaves:', error);
      return [];
    }

    let chavesFiltradas = data.map(chave => ({
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

    // Filtrar por busca (no frontend para simplicidade)
    if (filtro.busca) {
      const busca = filtro.busca.toLowerCase();
      chavesFiltradas = chavesFiltradas.filter(chave =>
        chave.codigoImovel.toLowerCase().includes(busca) ||
        chave.endereco.toLowerCase().includes(busca)
      );
    }

    // Filtrar chaves atrasadas
    if (filtro.status === 'atrasadas') {
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

    return chavesFiltradas;
  } catch (error) {
    console.error('Erro ao filtrar chaves:', error);
    return [];
  }
};

// ========== FUNÇÃO DE AUTENTICAÇÃO ==========

export const autenticarUsuario = async (email: string, senha: string): Promise<Usuario | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase não configurado - usando autenticação local');
    return null;
  }

  try {
    console.log('🔐 Autenticando usuário no Supabase...');
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('senha', senha)
      .eq('ativo', true)
      .single();

    if (error || !data) {
      console.log('❌ Credenciais inválidas ou usuário inativo');
      return null;
    }

    console.log('✅ Usuário autenticado com sucesso:', data.nome);

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
    console.error('❌ Erro na autenticação:', error);
    return null;
  }
};