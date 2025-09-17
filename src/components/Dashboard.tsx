import { useState, useEffect } from 'react';
import { Search, Filter, Key, Clock, CheckCircle, AlertTriangle, Plus, Trash, User } from 'lucide-react';
import { getDashboardStats, filtrarChaves, getUltimoRegistro, getUsuarioById } from '@/lib/supabase-data';
import { Chave, DashboardStats, Usuario } from '@/lib/types';

interface DashboardProps {
  usuario: Usuario | null;
  onVerDetalhes: (chave: Chave) => void;
  onCadastrarChave: () => void;
  onGerenciarUsuarios: () => void;
  onRemoverChave: (chaveId: string) => void;
  chaves: Chave[];
}

export default function Dashboard({ usuario, onVerDetalhes, onCadastrarChave, onGerenciarUsuarios, onRemoverChave, chaves }: DashboardProps) {
  const [filtroAtivo, setFiltroAtivo] = useState<'todas' | 'disponiveis' | 'em_uso' | 'atrasadas'>('todas');
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [stats, setStats] = useState<DashboardStats>({ total: 0, disponiveis: 0, emUso: 0, atrasadas: 0 });
  const [chavesFiltradas, setChavesFiltradas] = useState<Chave[]>([]);

  // Função para atualizar dados
  const atualizarDados = async () => {
    const novasStats = await getDashboardStats();
    setStats(novasStats);
    
    const chavesFiltradas = await filtrarChaves({
      status: filtroAtivo,
      busca,
      tipo: tipoFiltro
    });
    setChavesFiltradas(chavesFiltradas);
  };

  useEffect(() => {
    atualizarDados();
  }, [filtroAtivo, busca, tipoFiltro, chaves]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'text-green-600 bg-green-50';
      case 'em_uso': return 'text-orange-600 bg-orange-50';
      case 'manutencao': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'em_uso': return 'Em uso';
      case 'manutencao': return 'Manutenção';
      default: return status;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'apartamento': return '🏢';
      case 'casa': return '🏠';
      case 'comercial': return '🏪';
      case 'terreno': return '🌳';
      default: return '🏠';
    }
  };

  const isChaveAtrasada = async (chave: Chave) => {
    if (chave.status !== 'em_uso') return false;
    const ultimoRegistro = await getUltimoRegistro(chave.id);
    if (!ultimoRegistro || ultimoRegistro.acao !== 'retirada') return false;
    const agora = new Date();
    const horasEmUso = (agora.getTime() - ultimoRegistro.dataHora.getTime()) / (1000 * 60 * 60);
    return horasEmUso > 24;
  };

  const handleRemoverChave = (chaveId: string) => {
    if (!usuario || usuario.cargo !== 'admin') {
      alert('Apenas administradores podem remover chaves.');
      return;
    }

    if (confirm('Tem certeza que deseja remover esta chave? Esta ação não pode ser desfeita.')) {
      onRemoverChave(chaveId);
    }
  };

  const isAdmin = usuario?.cargo === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Bem-vindo, {usuario?.nome}</p>
            </div>
            <div className="flex space-x-4">
              {isAdmin && (
                <>
                  <button
                    onClick={onCadastrarChave}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Chave
                  </button>
                  <button
                    onClick={onGerenciarUsuarios}
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Gerenciar Usuários
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.disponiveis}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em uso</p>
                <p className="text-2xl font-bold text-gray-900">{stats.emUso}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.atrasadas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Abas de Status */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'todas', label: 'Todas', count: stats.total },
                { key: 'disponiveis', label: 'Disponíveis', count: stats.disponiveis },
                { key: 'em_uso', label: 'Em uso', count: stats.emUso },
                { key: 'atrasadas', label: 'Atrasadas', count: stats.atrasadas }
              ].map((filtro) => (
                <button
                  key={filtro.key}
                  onClick={() => setFiltroAtivo(filtro.key as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filtroAtivo === filtro.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filtro.label} ({filtro.count})
                </button>
              ))}
            </div>

            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por código ou endereço..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por Tipo */}
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os tipos</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="comercial">Comercial</option>
              <option value="terreno">Terreno</option>
            </select>
          </div>
        </div>

        {/* Lista de Chaves */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Chaves ({chavesFiltradas.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {chavesFiltradas.length === 0 ? (
              <div className="p-8 text-center">
                <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma chave encontrada</p>
              </div>
            ) : (
              chavesFiltradas.map((chave) => {
                return (
                  <ChaveItem
                    key={chave.id}
                    chave={chave}
                    onVerDetalhes={onVerDetalhes}
                    onRemoverChave={handleRemoverChave}
                    isAdmin={isAdmin}
                    getTipoIcon={getTipoIcon}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente separado para cada item de chave
function ChaveItem({ 
  chave, 
  onVerDetalhes, 
  onRemoverChave, 
  isAdmin, 
  getTipoIcon, 
  getStatusColor, 
  getStatusText 
}: {
  chave: Chave;
  onVerDetalhes: (chave: Chave) => void;
  onRemoverChave: (chaveId: string) => void;
  isAdmin: boolean;
  getTipoIcon: (tipo: string) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}) {
  const [ultimoRegistro, setUltimoRegistro] = useState<any>(null);
  const [usuarioComChave, setUsuarioComChave] = useState<any>(null);
  const [atrasada, setAtrasada] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      const registro = await getUltimoRegistro(chave.id);
      setUltimoRegistro(registro);
      
      if (registro && registro.acao === 'retirada') {
        const usuario = await getUsuarioById(registro.usuarioId);
        setUsuarioComChave(usuario);
        
        // Verificar se está atrasada
        const agora = new Date();
        const horasEmUso = (agora.getTime() - registro.dataHora.getTime()) / (1000 * 60 * 60);
        setAtrasada(horasEmUso > 24);
      }
    };

    carregarDados();
  }, [chave.id]);

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl">{getTipoIcon(chave.tipo)}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{chave.codigoImovel}</h3>
              {atrasada && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  ATRASADA
                </span>
              )}
            </div>
            <p className="text-gray-600">{chave.endereco}</p>
            <div className="flex items-center gap-4 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chave.status)}`}>
                {getStatusText(chave.status)}
              </span>
              <span className="text-sm text-gray-500">Armário: {chave.armario}</span>
              {usuarioComChave && (
                <span className="text-sm text-gray-500">
                  Com: {usuarioComChave.nome}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onVerDetalhes(chave)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ações
          </button>
          {isAdmin && (
            <button
              onClick={() => onRemoverChave(chave.id)}
              className="bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
              title="Remover chave"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}