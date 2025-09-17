'use client';

import { useState, useEffect } from 'react';
import { Key, LogOut, User, Settings } from 'lucide-react';
import { Usuario, Chave } from '@/lib/types';
import { 
  inicializarDados, 
  getChaves, 
  getUsuarios, 
  autenticarUsuario,
  escutarMudancasChaves,
  escutarMudancasUsuarios,
  removerChaveSupabase
} from '@/lib/supabase-data';

// Componentes
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import ChaveDetalhes from '@/components/ChaveDetalhes';
import CadastroChave from '@/components/CadastroChave';
import GerenciarUsuarios from '@/components/GerenciarUsuarios';
import { StatusSalvamentoCompacto } from '@/components/StatusSalvamento';

type TelaAtiva = 'login' | 'dashboard' | 'detalhes' | 'cadastro' | 'usuarios';

// Dados de fallback para garantir funcionamento
const chavesFallback: Chave[] = [
  {
    id: 'fallback-1',
    codigoImovel: 'APT001',
    endereco: 'Rua das Flores, 123 - Apto 101',
    tipo: 'apartamento',
    armario: 'A1',
    status: 'disponivel',
    qrCode: 'QR_APT001',
    criadoEm: new Date('2024-03-01'),
    atualizadoEm: new Date('2024-03-01')
  },
  {
    id: 'fallback-2',
    codigoImovel: 'APT002',
    endereco: 'Av. Central, 456 - Apto 205',
    tipo: 'apartamento',
    armario: 'A2',
    status: 'em_uso',
    qrCode: 'QR_APT002',
    criadoEm: new Date('2024-03-02'),
    atualizadoEm: new Date('2024-03-02')
  },
  {
    id: 'fallback-3',
    codigoImovel: 'CASA001',
    endereco: 'Rua do Sol, 789',
    tipo: 'casa',
    armario: 'B1',
    status: 'disponivel',
    qrCode: 'QR_CASA001',
    criadoEm: new Date('2024-03-03'),
    atualizadoEm: new Date('2024-03-03')
  },
  {
    id: 'fallback-4',
    codigoImovel: 'COM001',
    endereco: 'Rua Comercial, 321 - Loja 1',
    tipo: 'comercial',
    armario: 'C1',
    status: 'em_uso',
    qrCode: 'QR_COM001',
    criadoEm: new Date('2024-03-04'),
    atualizadoEm: new Date('2024-03-04')
  },
  {
    id: 'fallback-5',
    codigoImovel: 'APT003',
    endereco: 'Rua Nova, 654 - Apto 302',
    tipo: 'apartamento',
    armario: 'A3',
    status: 'disponivel',
    qrCode: 'QR_APT003',
    criadoEm: new Date('2024-03-05'),
    atualizadoEm: new Date('2024-03-05')
  }
];

export default function Home() {
  const [telaAtiva, setTelaAtiva] = useState<TelaAtiva>('login');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [chaves, setChaves] = useState<Chave[]>([]);
  const [chaveSelecionada, setChaveSelecionada] = useState<Chave | null>(null);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [supabaseConectado, setSupabaseConectado] = useState(false);

  // Inicializar dados e configurar listeners
  useEffect(() => {
    const inicializar = async () => {
      console.log('🚀 Inicializando sistema...');
      
      try {
        // Tentar inicializar dados no Supabase
        await inicializarDados();
        
        // Tentar carregar dados do Supabase
        const chavesSupabase = await getChaves();
        
        if (chavesSupabase && chavesSupabase.length > 0) {
          console.log('✅ Dados carregados do Supabase:', chavesSupabase.length, 'chaves');
          setChaves(chavesSupabase);
          setSupabaseConectado(true);
        } else {
          console.log('⚠️ Supabase não disponível, usando dados de fallback');
          setChaves(chavesFallback);
          setSupabaseConectado(false);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        console.log('🔄 Usando dados de fallback para garantir funcionamento');
        setChaves(chavesFallback);
        setSupabaseConectado(false);
      }
      
      setCarregandoInicial(false);
      console.log('✅ Sistema inicializado com sucesso!');
    };

    inicializar();
  }, []);

  // Configurar listeners de tempo real quando usuário faz login
  useEffect(() => {
    if (!usuario || !supabaseConectado) return;

    console.log('🔄 Configurando atualizações automáticas em tempo real...');

    // Escutar mudanças em chaves
    const unsubscribeChaves = escutarMudancasChaves((novasChaves) => {
      console.log('🔄 Chaves atualizadas automaticamente:', novasChaves.length);
      setChaves(novasChaves);
    });

    // Escutar mudanças em usuários (para admins)
    const unsubscribeUsuarios = escutarMudancasUsuarios((novosUsuarios) => {
      console.log('🔄 Usuários atualizados automaticamente:', novosUsuarios.length);
    });

    return () => {
      console.log('🔄 Desativando listeners de tempo real...');
      unsubscribeChaves();
      unsubscribeUsuarios();
    };
  }, [usuario, supabaseConectado]);

  const handleLogin = async (usuarioLogado: Usuario) => {
    console.log('✅ Login realizado:', usuarioLogado.nome);
    setUsuario(usuarioLogado);
    setTelaAtiva('dashboard');
    
    // Recarregar dados após login se Supabase estiver disponível
    if (supabaseConectado) {
      try {
        const chavesAtualizadas = await getChaves();
        if (chavesAtualizadas && chavesAtualizadas.length > 0) {
          setChaves(chavesAtualizadas);
        }
      } catch (error) {
        console.log('⚠️ Erro ao recarregar dados, mantendo dados atuais');
      }
    }
  };

  const handleLogout = () => {
    console.log('👋 Fazendo logout...');
    setUsuario(null);
    setChaveSelecionada(null);
    setTelaAtiva('login');
  };

  const handleVerDetalhes = (chave: Chave) => {
    setChaveSelecionada(chave);
    setTelaAtiva('detalhes');
  };

  const handleVoltarDashboard = () => {
    setChaveSelecionada(null);
    setTelaAtiva('dashboard');
  };

  const handleCadastrarChave = () => {
    setTelaAtiva('cadastro');
  };

  const handleGerenciarUsuarios = () => {
    setTelaAtiva('usuarios');
  };

  const handleChaveCadastrada = async (novaChave: Chave | null) => {
    if (novaChave) {
      console.log('✅ Nova chave cadastrada:', novaChave.codigoImovel);
      
      if (supabaseConectado) {
        // Se Supabase estiver conectado, recarregar dados
        try {
          const chavesAtualizadas = await getChaves();
          if (chavesAtualizadas && chavesAtualizadas.length > 0) {
            setChaves(chavesAtualizadas);
          }
        } catch (error) {
          console.log('⚠️ Erro ao recarregar, adicionando localmente');
          setChaves(prev => [...prev, novaChave]);
        }
      } else {
        // Se não estiver conectado, adicionar localmente
        setChaves(prev => [...prev, novaChave]);
      }
    }
    setTelaAtiva('dashboard');
  };

  const handleAtualizarChave = async (chaveId: string, novoStatus: 'disponivel' | 'em_uso') => {
    console.log('🔄 Atualizando status da chave:', chaveId, novoStatus);
    
    // Atualizar estado local imediatamente para UX responsiva
    setChaves(prevChaves => 
      prevChaves.map(chave => 
        chave.id === chaveId 
          ? { ...chave, status: novoStatus, atualizadoEm: new Date() }
          : chave
      )
    );

    // Atualizar chave selecionada se for a mesma
    if (chaveSelecionada && chaveSelecionada.id === chaveId) {
      setChaveSelecionada(prev => prev ? { ...prev, status: novoStatus, atualizadoEm: new Date() } : null);
    }

    // Se Supabase estiver conectado, tentar sincronizar
    if (supabaseConectado) {
      setTimeout(async () => {
        try {
          const chavesAtualizadas = await getChaves();
          if (chavesAtualizadas && chavesAtualizadas.length > 0) {
            setChaves(chavesAtualizadas);
          }
        } catch (error) {
          console.log('⚠️ Erro ao sincronizar, mantendo dados locais');
        }
      }, 1000);
    }
  };

  const handleRemoverChave = async (chaveId: string) => {
    console.log('🗑️ Removendo chave:', chaveId);
    
    if (supabaseConectado) {
      // Tentar remover do Supabase
      const sucesso = await removerChaveSupabase(chaveId);
      
      if (sucesso) {
        // Atualizar estado local
        setChaves(prevChaves => prevChaves.filter(chave => chave.id !== chaveId));
        
        // Se a chave removida estava selecionada, voltar ao dashboard
        if (chaveSelecionada && chaveSelecionada.id === chaveId) {
          setChaveSelecionada(null);
          setTelaAtiva('dashboard');
        }
        
        // Recarregar dados para garantir sincronização
        setTimeout(async () => {
          try {
            const chavesAtualizadas = await getChaves();
            if (chavesAtualizadas) {
              setChaves(chavesAtualizadas);
            }
          } catch (error) {
            console.log('⚠️ Erro ao recarregar após remoção');
          }
        }, 500);
      }
    } else {
      // Se não estiver conectado, remover localmente
      setChaves(prevChaves => prevChaves.filter(chave => chave.id !== chaveId));
      
      if (chaveSelecionada && chaveSelecionada.id === chaveId) {
        setChaveSelecionada(null);
        setTelaAtiva('dashboard');
      }
    }
  };

  const handleChaveExcluida = () => {
    console.log('✅ Chave excluída, voltando ao dashboard...');
    handleVoltarDashboard();
  };

  if (carregandoInicial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Inicializando Sistema</h2>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Renderizar tela baseada no estado atual
  switch (telaAtiva) {
    case 'login':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Chaves</h1>
                <p className="text-gray-600">Gerencie chaves de imóveis</p>
                
                {/* Status do sistema */}
                <div className={`mt-4 px-4 py-2 rounded-lg text-sm ${
                  supabaseConectado 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {supabaseConectado 
                    ? '✅ Sistema conectado - dados salvos automaticamente' 
                    : '⚠️ Modo offline - dados temporários'
                  }
                </div>
              </div>

              <LoginForm onLogin={handleLogin} />

              {/* Informações do sistema */}
              <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">✨ Recursos do Sistema</h3>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 🔐 Controle de acesso por perfil</li>
                  <li>• 📊 Dashboard com estatísticas</li>
                  <li>• 📱 Interface responsiva</li>
                  <li>• {supabaseConectado ? '💾 Salvamento automático' : '📝 Dados temporários'}</li>
                  <li>• {supabaseConectado ? '🔄 Atualizações em tempo real' : '🔄 Atualizações locais'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );

    case 'dashboard':
      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header Global */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Key className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Sistema de Chaves</h1>
                    <p className="text-xs text-gray-600">
                      {supabaseConectado ? 'Salvamento automático ativo' : 'Modo offline'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <StatusSalvamentoCompacto supabaseConectado={supabaseConectado} />
                  
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{usuario?.nome}</span>
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
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Dashboard
            usuario={usuario}
            chaves={chaves}
            onVerDetalhes={handleVerDetalhes}
            onCadastrarChave={handleCadastrarChave}
            onGerenciarUsuarios={handleGerenciarUsuarios}
            onRemoverChave={handleRemoverChave}
          />
        </div>
      );

    case 'detalhes':
      if (!chaveSelecionada || !usuario) return null;
      return (
        <ChaveDetalhes
          chave={chaveSelecionada}
          usuario={usuario}
          onVoltar={handleVoltarDashboard}
          onAtualizarChave={handleAtualizarChave}
          onChaveExcluida={handleChaveExcluida}
        />
      );

    case 'cadastro':
      return (
        <CadastroChave
          onVoltar={handleVoltarDashboard}
          onChaveCadastrada={handleChaveCadastrada}
          usuario={usuario}
        />
      );

    case 'usuarios':
      return (
        <GerenciarUsuarios
          onVoltar={handleVoltarDashboard}
          usuario={usuario}
        />
      );

    default:
      return null;
  }
}