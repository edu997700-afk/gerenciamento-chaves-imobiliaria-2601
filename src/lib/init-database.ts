import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    console.log('Inicializando banco de dados...');

    // Criar tabela de usuários
    const { error: usuariosError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.usuarios (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          senha VARCHAR(255) NOT NULL,
          cargo VARCHAR(20) CHECK (cargo IN ('admin', 'corretor')) NOT NULL,
          ativo BOOLEAN DEFAULT true,
          criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usuariosError) {
      console.error('Erro ao criar tabela usuarios:', usuariosError);
    }

    // Criar tabela de chaves
    const { error: chavesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.chaves (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          codigo_imovel VARCHAR(100) UNIQUE NOT NULL,
          endereco TEXT NOT NULL,
          tipo VARCHAR(20) CHECK (tipo IN ('apartamento', 'casa', 'comercial', 'terreno')) NOT NULL,
          armario VARCHAR(10) NOT NULL,
          status VARCHAR(20) CHECK (status IN ('disponivel', 'em_uso', 'manutencao')) DEFAULT 'disponivel',
          qr_code VARCHAR(100) UNIQUE NOT NULL,
          criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (chavesError) {
      console.error('Erro ao criar tabela chaves:', chavesError);
    }

    // Criar tabela de registros
    const { error: registrosError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.registros_chaves (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          chave_id UUID REFERENCES public.chaves(id) ON DELETE CASCADE,
          usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
          acao VARCHAR(20) CHECK (acao IN ('retirada', 'devolucao')) NOT NULL,
          data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          observacoes TEXT,
          atrasado BOOLEAN DEFAULT false
        );
      `
    });

    if (registrosError) {
      console.error('Erro ao criar tabela registros_chaves:', registrosError);
    }

    // Habilitar RLS e criar políticas
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.chaves ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.registros_chaves ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Permitir tudo para usuários" ON public.usuarios FOR ALL USING (true);
        CREATE POLICY IF NOT EXISTS "Permitir tudo para chaves" ON public.chaves FOR ALL USING (true);
        CREATE POLICY IF NOT EXISTS "Permitir tudo para registros" ON public.registros_chaves FOR ALL USING (true);
      `
    });

    // Inserir dados iniciais
    await insertInitialData();

    console.log('Banco de dados inicializado com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return { success: false, error };
  }
}

async function insertInitialData() {
  // Inserir usuários iniciais
  const { error: usuariosError } = await supabase
    .from('usuarios')
    .upsert([
      {
        nome: 'João Silva',
        email: 'joao@imobiliaria.com',
        senha: '123456',
        cargo: 'corretor',
        ativo: true
      },
      {
        nome: 'Maria Santos',
        email: 'maria@imobiliaria.com',
        senha: '123456',
        cargo: 'admin',
        ativo: true
      },
      {
        nome: 'Pedro Costa',
        email: 'pedro@imobiliaria.com',
        senha: '123456',
        cargo: 'corretor',
        ativo: true
      },
      {
        nome: 'Eduardo Armito',
        email: 'eduarmito790@gmail.com',
        senha: '123456',
        cargo: 'admin',
        ativo: true
      }
    ], { onConflict: 'email' });

  if (usuariosError) {
    console.error('Erro ao inserir usuários:', usuariosError);
  }

  // Inserir chaves iniciais
  const { error: chavesError } = await supabase
    .from('chaves')
    .upsert([
      {
        codigo_imovel: 'APT001',
        endereco: 'Rua das Flores, 123 - Apto 101',
        tipo: 'apartamento',
        armario: 'A1',
        status: 'disponivel',
        qr_code: 'QR_APT001'
      },
      {
        codigo_imovel: 'APT002',
        endereco: 'Av. Central, 456 - Apto 205',
        tipo: 'apartamento',
        armario: 'A2',
        status: 'em_uso',
        qr_code: 'QR_APT002'
      },
      {
        codigo_imovel: 'CASA001',
        endereco: 'Rua do Sol, 789',
        tipo: 'casa',
        armario: 'B1',
        status: 'disponivel',
        qr_code: 'QR_CASA001'
      },
      {
        codigo_imovel: 'COM001',
        endereco: 'Rua Comercial, 321 - Loja 1',
        tipo: 'comercial',
        armario: 'C1',
        status: 'em_uso',
        qr_code: 'QR_COM001'
      },
      {
        codigo_imovel: 'APT003',
        endereco: 'Rua Nova, 654 - Apto 302',
        tipo: 'apartamento',
        armario: 'A3',
        status: 'disponivel',
        qr_code: 'QR_APT003'
      }
    ], { onConflict: 'codigo_imovel' });

  if (chavesError) {
    console.error('Erro ao inserir chaves:', chavesError);
  }
}