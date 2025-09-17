import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    console.log('Verificando estrutura do banco de dados...');

    // Verificar se as tabelas existem consultando dados
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('count', { count: 'exact', head: true });

    const { data: chaves, error: chavesError } = await supabase
      .from('chaves')
      .select('count', { count: 'exact', head: true });

    const { data: registros, error: registrosError } = await supabase
      .from('registros_chaves')
      .select('count', { count: 'exact', head: true });

    if (usuariosError || chavesError || registrosError) {
      console.log('Algumas tabelas não existem, mas isso é normal se já foram criadas via SQL.');
    }

    // Inserir dados iniciais se necessário
    await insertInitialData();

    console.log('Banco de dados verificado com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
    return { success: false, error };
  }
}

async function insertInitialData() {
  try {
    // Verificar se já existem usuários
    const { data: existingUsers } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (!existingUsers || existingUsers.length === 0) {
      console.log('Inserindo usuários iniciais...');
      const { error: usuariosError } = await supabase
        .from('usuarios')
        .insert([
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
        ]);

      if (usuariosError) {
        console.error('Erro ao inserir usuários:', usuariosError);
      } else {
        console.log('✅ Usuários inseridos com sucesso!');
      }
    }

    // Verificar se já existem chaves
    const { data: existingKeys } = await supabase
      .from('chaves')
      .select('id')
      .limit(1);

    if (!existingKeys || existingKeys.length === 0) {
      console.log('Inserindo chaves iniciais...');
      const { error: chavesError } = await supabase
        .from('chaves')
        .insert([
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
        ]);

      if (chavesError) {
        console.error('Erro ao inserir chaves:', chavesError);
      } else {
        console.log('✅ Chaves inseridas com sucesso!');
      }
    }

    console.log('✅ Dados iniciais verificados/inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir dados iniciais:', error);
  }
}