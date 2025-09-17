"use client";
import { useState, useEffect } from 'react';
import { LogOut, QrCode, User, History } from 'lucide-react';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import ChaveDetalhes from '@/components/ChaveDetalhes';
import CadastroChave from '@/components/CadastroChave';
import QRScanner from '@/components/QRScanner';
import GerenciarUsuarios from '@/components/GerenciarUsuarios';
import { Chave, Usuario, RegistroChave } from '@/lib/types';
import { 
  inicializarDados,
  getChaves,
  getRegistrosChaves,
  getChaveById,
  getUsuarioById,
  removerChaveSupabase,
  escutarMudancasChaves,
  escutarMudancasRegistros
} from '@/lib/supabase-data';

type Tela = 'login' | 'dashboard' | 'detalhes' | 'cadastro' | 'scanner' | 'usuarios' | 'historico';

export default function Home() {
  const [telaAtiva, setTelaAtiva] = useState<Tela>('login');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [chaveSelecionada, setChaveSelecionada] = useState<Chave | null>(null);
  const [chaves, setChaves] = useState<Chave[]>([]);
  const [registros, setRegistros] = useState<RegistroChave[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const inicializar = async () => {
      try {
        // Inicializar dados se necessário
        await inicializarDados();
        
        // Carregar dados iniciais
        const [chavesData, registrosData] = await Promise.all([
          getChaves(),
          getRegistrosChaves()
        ]);
        
        setChaves(chavesData);
        setRegistros(registrosData);
        
        // Verificar se há usuário logado no localStorage
        const usuarioSalvo = localStorage.getItem('usuarioLogado');
        if (usuarioSalvo) {
          setUsuario(JSON.parse(usuarioSalvo));
          setTelaAtiva('dashboard');
        }
        
        setCarregando(false);
      } catch (error) {
        console.error('Erro ao inicializar:', error);
        setCarregando(false);
      }
    };

    inicializar();
  }, []);

  useEffect(() => {
    if (!carregando) {
      // Configurar escuta de mudanças em tempo real
      const unsubscribeChaves = escutarMudancasChaves((novasChaves) => {
        setChaves(novasChaves);
        
        // Atualizar chave selecionada se necessário
        if (chaveSelecionada) {
          const chaveAtualizada = novasChaves.find(c => c.id === chaveSelecionada.id);
          if (chaveAtualizada) {
            setChaveSelecionada(chaveAtualizada);
          }
        }
      });

      const unsubscribeRegistros = escutarMudancasRegistros((novosRegistros) => {
        setRegistros(novosRegistros);
      });

      return () => {
        unsubscribeChaves();
        unsubscribeRegistros();
      };
    }
  }, [carregando, chaveSelecionada]);

  const handleLogin = (usuarioLogado: Usuario) => {
    setUsuario(usuarioLogado);
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    setTelaAtiva('dashboard');
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuarioLogado');
    setTelaAtiva('login');
  };

  const handleVerDetalhes = async (chave: Chave) => {
    // Buscar chave atualizada do banco
    const chaveAtualizada = await getChaveById(chave.id);
    if (chaveAtualizada) {
      setChaveSelecionada(chaveAtualizada);
      setTelaAtiva('detalhes');
    }
  };

  const handleVoltarDashboard = () => {
    setChaveSelecionada(null);
    setTelaAtiva('dashboard');
  };

  const handleCadastrarChave = () => {
    setTelaAtiva('cadastro');
  };

  const handleChaveCadastrada = (novaChave: Chave) => {
    alert(`Chave ${novaChave.codigoImovel} cadastrada com sucesso!`);
    setTelaAtiva('dashboard');
  };

  const handleAbrirScanner = () => {
    setTelaAtiva('scanner');
  };

  const handleQRDetected = async (qrCode: string) => {
    const chave = chaves.find(c => c.qrCode === qrCode);
    if (chave) {
      const chaveAtualizada = await getChaveById(chave.id);
      if (chaveAtualizada) {
        setChaveSelecionada(chaveAtualizada);
        setTelaAtiva('detalhes');
      }
    } else {
      alert(`Chave não encontrada para o código: ${qrCode}`);
      setTelaAtiva('dashboard');
    }
  };

  const handleAtualizarChave = (chaveId: string, novoStatus: 'disponivel' | 'em_uso') => {
    // A atualização será feita via Supabase e o tempo real atualizará automaticamente
    console.log(`Chave ${chaveId} atualizada para ${novoStatus}`);
  };

  const handleGerenciarUsuarios = () => {
    setTelaAtiva('usuarios');
  };

  const handleHistorico = () => {
    setTelaAtiva('historico');
  };

  const handleRemoverChave = async (chaveId: string) => {
    if (usuario && usuario.cargo === 'admin') {
      const sucesso = await removerChaveSupabase(chaveId);
      if (sucesso) {
        alert('Chave removida com sucesso!');
        setTelaAtiva('dashboard');
      } else {
        alert('Erro ao remover a chave.');
      }
    } else {
      alert('Apenas administradores podem remover chaves.');
    }
  };

  // Mostrar loading enquanto inicializa
  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Renderizar tela de login
  if (telaAtiva === 'login') {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Header comum para telas autenticadas
  const HeaderComum = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">JRS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">JRS IMÓVEIS</h1>
              <p className="text-sm text-gray-600">Sistema de Gerenciamento</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {telaAtiva === 'dashboard' && (
              <button
                onClick={handleAbrirScanner}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Scanner
              </button>
            )}
            
            <button
              onClick={handleHistorico}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Histórico
            </button>

            <div className="flex items-center space-x-2 text-gray-700">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{usuario?.nome}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                usuario?.cargo === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {usuario?.cargo === 'admin' ? 'Admin' : 'Corretor'}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar telas baseado no estado
  switch (telaAtiva) {
    case 'dashboard':
      return (
        <div>
          <HeaderComum />
          <Dashboard
            usuario={usuario}
            onVerDetalhes={handleVerDetalhes}
            onCadastrarChave={handleCadastrarChave}
            onGerenciarUsuarios={handleGerenciarUsuarios}
            onRemoverChave={handleRemoverChave}
            chaves={chaves}
          />
        </div>
      );

    case 'detalhes':
      return chaveSelecionada ? (
        <ChaveDetalhes
          chave={chaveSelecionada}
          usuario={usuario}
          onVoltar={handleVoltarDashboard}
          onAtualizarChave={handleAtualizarChave}
        />
      ) : (
        <div>Chave não encontrada</div>
      );

    case 'cadastro':
      return (
        <CadastroChave
          usuario={usuario}
          onVoltar={handleVoltarDashboard}
          onChaveCadastrada={handleChaveCadastrada}
        />
      );

    case 'scanner':
      return (
        <QRScanner
          onVoltar={handleVoltarDashboard}
          onQRDetected={handleQRDetected}
        />
      );

    case 'usuarios':
      return (
        <GerenciarUsuarios
          usuario={usuario}
          onVoltar={handleVoltarDashboard}
        />
      );

    case 'historico':
      return (
        <div>
          <HeaderComum />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Histórico de Uso de Chaves</h2>
            <button
              onClick={handleVoltarDashboard}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors mb-4"
            >
              Voltar para o Dashboard
            </button>
            <div className="space-y-4">
              {registros.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum registro encontrado</p>
                </div>
              ) : (
                registros.map(registro => {
                  const chave = chaves.find(c => c.id === registro.chaveId);
                  
                  return (
                    <div key={registro.id} className="bg-white shadow-sm rounded-xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                          Chave: {chave?.codigoImovel || 'Não encontrada'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Usuário: {registro.usuarioId}
                        </p>
                      </div>
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Ação</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                registro.acao === 'retirada' 
                                  ? 'bg-orange-100 text-orange-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {registro.acao === 'retirada' ? 'Retirada' : 'Devolução'}
                              </span>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Data e Hora</dt>
                            <dd className="mt-1 text-sm text-gray-900">{registro.dataHora.toLocaleString()}</dd>
                          </div>
                          {registro.observacoes && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Observações</dt>
                              <dd className="mt-1 text-sm text-gray-900">{registro.observacoes}</dd>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      );

    default:
      return <div>Tela não encontrada</div>;
  }
}