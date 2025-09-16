export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  cargo: 'corretor' | 'admin';
  ativo: boolean;
  criadoEm: Date;
}

export interface Chave {
  id: string;
  codigoImovel: string;
  endereco: string;
  tipo: 'apartamento' | 'casa' | 'comercial' | 'terreno';
  armario: string;
  status: 'disponivel' | 'em_uso' | 'manutencao';
  qrCode: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface RegistroChave {
  id: string;
  chaveId: string;
  usuarioId: string;
  acao: 'retirada' | 'devolucao';
  dataHora: Date;
  observacoes?: string;
  atrasado?: boolean;
}

export interface DashboardStats {
  total: number;
  disponiveis: number;
  emUso: number;
  atrasadas: number;
}

export interface FiltroChaves {
  status?: 'todas' | 'disponiveis' | 'em_uso' | 'atrasadas';
  busca?: string;
  tipo?: string;
}