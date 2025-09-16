import { Usuario, Chave, RegistroChave, DashboardStats } from './types';

// Lista de usuários para demonstração
export const usuarios: Usuario[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@imobiliaria.com',
    senha: '123456',
    cargo: 'corretor',
    ativo: true,
    criadoEm: new Date('2024-01-10')
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria@imobiliaria.com',
    senha: '123456',
    cargo: 'admin',
    ativo: true,
    criadoEm: new Date('2024-01-10')
  },
  {
    id: '3',
    nome: 'Pedro Costa',
    email: 'pedro@imobiliaria.com',
    senha: '123456',
    cargo: 'corretor',
    ativo: true,
    criadoEm: new Date('2024-01-12')
  },
  {
    id: '4',
    nome: 'Eduardo Armito',
    email: 'eduarmito790@gmail.com',
    senha: '123456',
    cargo: 'admin',
    ativo: true,
    criadoEm: new Date('2024-01-08')
  }
];

export let chaves: Chave[] = [
  {
    id: '1',
    codigoImovel: 'APT001',
    endereco: 'Rua das Flores, 123 - Apto 101',
    tipo: 'apartamento',
    armario: 'A1',
    status: 'disponivel',
    qrCode: 'QR_APT001',
    criadoEm: new Date('2024-01-15'),
    atualizadoEm: new Date('2024-01-15')
  },
  {
    id: '2',
    codigoImovel: 'APT002',
    endereco: 'Av. Central, 456 - Apto 205',
    tipo: 'apartamento',
    armario: 'A2',
    status: 'em_uso',
    qrCode: 'QR_APT002',
    criadoEm: new Date('2024-01-16'),
    atualizadoEm: new Date('2024-03-10')
  },
  {
    id: '3',
    codigoImovel: 'CASA001',
    endereco: 'Rua do Sol, 789',
    tipo: 'casa',
    armario: 'B1',
    status: 'disponivel',
    qrCode: 'QR_CASA001',
    criadoEm: new Date('2024-01-20'),
    atualizadoEm: new Date('2024-01-20')
  },
  {
    id: '4',
    codigoImovel: 'COM001',
    endereco: 'Rua Comercial, 321 - Loja 1',
    tipo: 'comercial',
    armario: 'C1',
    status: 'em_uso',
    qrCode: 'QR_COM001',
    criadoEm: new Date('2024-02-01'),
    atualizadoEm: new Date('2024-03-05')
  },
  {
    id: '5',
    codigoImovel: 'APT003',
    endereco: 'Rua Nova, 654 - Apto 302',
    tipo: 'apartamento',
    armario: 'A3',
    status: 'disponivel',
    qrCode: 'QR_APT003',
    criadoEm: new Date('2024-02-10'),
    atualizadoEm: new Date('2024-02-10')
  }
];

export const registrosChaves: RegistroChave[] = [
  {
    id: '1',
    chaveId: '2',
    usuarioId: '1',
    acao: 'retirada',
    dataHora: new Date('2024-03-10T09:30:00'),
    observacoes: 'Visita agendada para 14h'
  },
  {
    id: '2',
    chaveId: '4',
    usuarioId: '3',
    acao: 'retirada',
    dataHora: new Date('2024-03-05T10:15:00'),
    observacoes: 'Vistoria do imóvel',
    atrasado: true
  },
  {
    id: '3',
    chaveId: '1',
    usuarioId: '2',
    acao: 'retirada',
    dataHora: new Date('2024-03-08T11:00:00')
  },
  {
    id: '4',
    chaveId: '1',
    usuarioId: '2',
    acao: 'devolucao',
    dataHora: new Date('2024-03-08T16:30:00')
  }
];

// Funções utilitárias
export const getChaveById = (id: string): Chave | undefined => {
  return chaves.find(chave => chave.id === id);
};

export const getUsuarioById = (id: string): Usuario | undefined => {
  return usuarios.find(usuario => usuario.id === id);
};

export const getCorretorPorId = (id: string): Usuario | undefined => {
  return usuarios.find(usuario => usuario.id === id && usuario.cargo === 'corretor');
};

export const getUltimoRegistro = (chaveId: string): RegistroChave | undefined => {
  return registrosChaves
    .filter(registro => registro.chaveId === chaveId)
    .sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime())[0];
};

export const getDashboardStats = (): DashboardStats => {
  const total = chaves.length;
  const disponiveis = chaves.filter(c => c.status === 'disponivel').length;
  const emUso = chaves.filter(c => c.status === 'em_uso').length;
  
  // Calcular chaves atrasadas (em uso há mais de 24 horas)
  const agora = new Date();
  const atrasadas = chaves.filter(chave => {
    if (chave.status !== 'em_uso') return false;
    const ultimoRegistro = getUltimoRegistro(chave.id);
    if (!ultimoRegistro || ultimoRegistro.acao !== 'retirada') return false;
    const horasEmUso = (agora.getTime() - ultimoRegistro.dataHora.getTime()) / (1000 * 60 * 60);
    return horasEmUso > 24;
  }).length;

  return { total, disponiveis, emUso, atrasadas };
};

export const filtrarChaves = (filtro: { status?: string; busca?: string; tipo?: string }) => {
  let chavesFiltradas = [...chaves];

  // Filtrar por status
  if (filtro.status && filtro.status !== 'todas') {
    if (filtro.status === 'atrasadas') {
      const agora = new Date();
      chavesFiltradas = chavesFiltradas.filter(chave => {
        if (chave.status !== 'em_uso') return false;
        const ultimoRegistro = getUltimoRegistro(chave.id);
        if (!ultimoRegistro || ultimoRegistro.acao !== 'retirada') return false;
        const horasEmUso = (agora.getTime() - ultimoRegistro.dataHora.getTime()) / (1000 * 60 * 60);
        return horasEmUso > 24;
      });
    } else {
      const statusMap: { [key: string]: string } = {
        'disponiveis': 'disponivel',
        'em_uso': 'em_uso'
      };
      chavesFiltradas = chavesFiltradas.filter(c => c.status === statusMap[filtro.status!]);
    }
  }

  // Filtrar por busca
  if (filtro.busca) {
    const busca = filtro.busca.toLowerCase();
    chavesFiltradas = chavesFiltradas.filter(chave =>
      chave.codigoImovel.toLowerCase().includes(busca) ||
      chave.endereco.toLowerCase().includes(busca)
    );
  }

  // Filtrar por tipo
  if (filtro.tipo && filtro.tipo !== 'todos') {
    chavesFiltradas = chavesFiltradas.filter(c => c.tipo === filtro.tipo);
  }

  return chavesFiltradas;
};

export const removerChave = (chaveId: string, usuario: Usuario): boolean => {
  if (usuario.cargo !== 'admin') {
    console.error('Apenas administradores podem remover chaves.');
    return false;
  }
  const index = chaves.findIndex(chave => chave.id === chaveId);
  if (index !== -1) {
    chaves.splice(index, 1);
    // Remover também os registros relacionados à chave
    for (let i = registrosChaves.length - 1; i >= 0; i--) {
      if (registrosChaves[i].chaveId === chaveId) {
        registrosChaves.splice(i, 1);
      }
    }
    return true;
  }
  return false;
};

export const adicionarUsuario = (novoUsuario: Omit<Usuario, 'id' | 'criadoEm'>): Usuario => {
  const usuario: Usuario = {
    ...novoUsuario,
    id: Date.now().toString(),
    criadoEm: new Date()
  };
  usuarios.push(usuario);
  return usuario;
};

export const removerUsuario = (usuarioId: string, usuarioLogado: Usuario): boolean => {
  if (usuarioLogado.cargo !== 'admin') {
    console.error('Apenas administradores podem remover usuários.');
    return false;
  }
  const index = usuarios.findIndex(usuario => usuario.id === usuarioId);
  if (index !== -1) {
    usuarios.splice(index, 1);
    return true;
  }
  return false;
};