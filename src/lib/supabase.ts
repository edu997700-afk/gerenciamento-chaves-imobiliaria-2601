import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nome: string;
          email: string;
          senha: string;
          cargo: 'admin' | 'corretor';
          ativo: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          senha: string;
          cargo: 'admin' | 'corretor';
          ativo?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          senha?: string;
          cargo?: 'admin' | 'corretor';
          ativo?: boolean;
          criado_em?: string;
        };
      };
      chaves: {
        Row: {
          id: string;
          codigo_imovel: string;
          endereco: string;
          tipo: 'apartamento' | 'casa' | 'comercial' | 'terreno';
          armario: string;
          status: 'disponivel' | 'em_uso' | 'manutencao';
          qr_code: string;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          codigo_imovel: string;
          endereco: string;
          tipo: 'apartamento' | 'casa' | 'comercial' | 'terreno';
          armario: string;
          status?: 'disponivel' | 'em_uso' | 'manutencao';
          qr_code: string;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          codigo_imovel?: string;
          endereco?: string;
          tipo?: 'apartamento' | 'casa' | 'comercial' | 'terreno';
          armario?: string;
          status?: 'disponivel' | 'em_uso' | 'manutencao';
          qr_code?: string;
          criado_em?: string;
          atualizado_em?: string;
        };
      };
      registros_chaves: {
        Row: {
          id: string;
          chave_id: string;
          usuario_id: string;
          acao: 'retirada' | 'devolucao';
          data_hora: string;
          observacoes: string | null;
          atrasado: boolean | null;
        };
        Insert: {
          id?: string;
          chave_id: string;
          usuario_id: string;
          acao: 'retirada' | 'devolucao';
          data_hora?: string;
          observacoes?: string | null;
          atrasado?: boolean | null;
        };
        Update: {
          id?: string;
          chave_id?: string;
          usuario_id?: string;
          acao?: 'retirada' | 'devolucao';
          data_hora?: string;
          observacoes?: string | null;
          atrasado?: boolean | null;
        };
      };
    };
  };
}