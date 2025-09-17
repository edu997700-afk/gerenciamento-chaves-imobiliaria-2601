'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Key, Clock, User, MapPin, QrCode, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Chave, RegistroChave, Usuario } from '@/lib/types';
import { 
  getUltimoRegistro, 
  getUsuarioById, 
  getRegistrosChaves,
  adicionarRegistro,
  atualizarChave,
  removerChaveSupabase 
} from '@/lib/supabase-data';

interface ChaveDetalhesProps {
  chave: Chave;
  usuario: Usuario;
  onVoltar: () => void;
  onAtualizarChave: (chaveId: string, novoStatus: 'disponivel' | 'em_uso') => void;
  onChaveExcluida?: () => void;
}

export default function ChaveDetalhes({ chave, usuario, onVoltar, onAtualizarChave, onChaveExcluida }: ChaveDetalhesProps) {
  const [observacoes, setObservacoes] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState<RegistroChave[]>([]);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [ultimoRegistro, setUltimoRegistro] = useState<RegistroChave | null>(null);
  const [usuarioComChave, setUsuarioComChave] = useState<Usuario | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      // Buscar histórico da chave
      const todosRegistros = await getRegistrosChaves();
      const historicoChave = todosRegistros
        .filter(registro => registro.chaveId === chave.id)
        .sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime());
      setHistorico(historicoChave);

      // Buscar último registro e usuário com a chave
      const ultimo = await getUltimoRegistro(chave.id);
      setUltimoRegistro(ultimo);
      
      if (ultimo && ultimo.acao === 'retirada') {
        const usuario = await getUsuarioById(ultimo.usuarioId);
        setUsuarioComChave(usuario);
      }
    };

    carregarDados();
  }, [chave.id]);

  const isAtrasada = () => {
    if (chave.status !== 'em_uso' || !ultimoRegistro || ultimoRegistro.acao !== 'retirada') return false;
    const agora = new Date();
    const horasEmUso = (agora.getTime() - ultimoRegistro.dataHora.getTime()) / (1000 * 60 * 60);
    return horasEmUso > 24;
  };

  const getTempoEmUso = () => {
    if (!ultimoRegistro || ultimoRegistro.acao !== 'retirada') return null;
    const agora = new Date();
    const diffMs = agora.getTime() - ultimoRegistro.dataHora.getTime();
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos}m`;
  };

  const handlePegarChave = async () => {
    if (chave.status !== 'disponivel') return;
    
    setCarregando(true);
    
    try {
      // Adicionar registro
      const novoRegistro = await adicionarRegistro({
        chaveId: chave.id,
        usuarioId: usuario.id,
        acao: 'retirada',
        observacoes: observacoes || undefined
      });

      if (novoRegistro) {
        // Atualizar status da chave
        await atualizarChave(chave.id, { status: 'em_uso' });
        onAtualizarChave(chave.id, 'em_uso');
        setObservacoes('');
      }
    } catch (error) {
      console.error('Erro ao pegar chave:', error);
      alert('Erro ao pegar a chave. Tente novamente.');
    }
    
    setCarregando(false);
  };

  const handleDevolverChave = async () => {
    if (chave.status !== 'em_uso') return;
    
    setCarregando(true);
    
    try {
      // Adicionar registro
      const novoRegistro = await adicionarRegistro({
        chaveId: chave.id,
        usuarioId: usuario.id,
        acao: 'devolucao',
        observacoes: observacoes || undefined
      });

      if (novoRegistro) {
        // Atualizar status da chave
        await atualizarChave(chave.id, { status: 'disponivel' });
        onAtualizarChave(chave.id, 'disponivel');
        setObservacoes('');
      }
    } catch (error) {
      console.error('Erro ao devolver chave:', error);
      alert('Erro ao devolver a chave. Tente novamente.');
    }
    
    setCarregando(false);
  };

  const handleExcluirChave = async () => {
    setExcluindo(true);
    
    try {
      const sucesso = await removerChaveSupabase(chave.id);
      
      if (sucesso) {
        setMostrarConfirmacao(false);
        setExcluindo(false);
        // Chamar callback para notificar que a chave foi excluída
        if (onChaveExcluida) {
          onChaveExcluida();
        }
        // Voltar para a tela anterior
        onVoltar();
      } else {
        setExcluindo(false);
        alert('Erro ao excluir chave. Tente novamente.');
      }
    } catch (error) {
      setExcluindo(false);
      console.error('Erro ao excluir chave:', error);
      alert('Erro ao excluir chave. Tente novamente.');
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

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={onVoltar}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalhes da Chave</h1>
              <p className="text-gray-600">{chave.codigoImovel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações da Chave */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Principal */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{getTipoIcon(chave.tipo)}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{chave.codigoImovel}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        chave.status === 'disponivel' 
                          ? 'bg-green-100 text-green-800'
                          : chave.status === 'em_uso'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {chave.status === 'disponivel' ? 'Disponível' : 
                         chave.status === 'em_uso' ? 'Em uso' : 'Manutenção'}
                      </span>
                      {isAtrasada() && (
                        <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          ATRASADA
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Key className="w-4 h-4 mr-1" />
                    <span className="text-sm">Armário {chave.armario}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Tipo: {chave.tipo.charAt(0).toUpperCase() + chave.tipo.slice(1)}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2 mb-6">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <p className="text-gray-700">{chave.endereco}</p>
              </div>

              {/* Status Atual */}
              {chave.status === 'em_uso' && usuarioComChave && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center text-orange-800 font-medium mb-1">
                        <User className="w-4 h-4 mr-2" />
                        Chave retirada por: {usuarioComChave.nome}
                      </div>
                      <div className="flex items-center text-orange-700 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        Há {getTempoEmUso()} • {formatarData(ultimoRegistro!.dataHora)}
                      </div>
                      {ultimoRegistro?.observacoes && (
                        <p className="text-orange-700 text-sm mt-2">
                          Obs: {ultimoRegistro.observacoes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <QrCode className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Código QR</span>
                  </div>
                  <span className="text-sm text-gray-600">{chave.qrCode}</span>
                </div>
              </div>
            </div>

            {/* Histórico */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Movimentações</h3>
              
              {historico.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma movimentação registrada</p>
              ) : (
                <div className="space-y-4">
                  {historico.map((registro) => (
                    <HistoricoItem key={registro.id} registro={registro} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Digite observações sobre a retirada/devolução..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {chave.status === 'disponivel' ? (
                  <button
                    onClick={handlePegarChave}
                    disabled={carregando}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {carregando ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processando...
                      </div>
                    ) : (
                      'Pegar Chave'
                    )}
                  </button>
                ) : chave.status === 'em_uso' ? (
                  <button
                    onClick={handleDevolverChave}
                    disabled={carregando}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {carregando ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processando...
                      </div>
                    ) : (
                      'Devolver Chave'
                    )}
                  </button>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Chave em manutenção</p>
                  </div>
                )}

                {/* Botão de Excluir - Apenas para Administradores */}
                {usuario.cargo === 'admin' && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setMostrarConfirmacao(true)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir Chave
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Criado em:</span>
                  <span className="text-gray-900">{formatarData(chave.criadoEm)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Atualizado em:</span>
                  <span className="text-gray-900">{formatarData(chave.atualizadoEm)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">QR Code:</span>
                  <span className="text-gray-900 font-mono">{chave.qrCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {mostrarConfirmacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Confirmar Exclusão
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Tem certeza que deseja excluir a chave <strong>{chave.codigoImovel}</strong>? 
              Esta ação não pode ser desfeita e todos os registros relacionados também serão removidos.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfirmacao(false)}
                disabled={excluindo}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleExcluirChave}
                disabled={excluindo}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {excluindo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente separado para item do histórico
function HistoricoItem({ registro }: { registro: RegistroChave }) {
  const [usuarioRegistro, setUsuarioRegistro] = useState<Usuario | null>(null);

  useEffect(() => {
    const carregarUsuario = async () => {
      const usuario = await getUsuarioById(registro.usuarioId);
      setUsuarioRegistro(usuario);
    };

    carregarUsuario();
  }, [registro.usuarioId]);

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${
        registro.acao === 'retirada' 
          ? 'bg-orange-100 text-orange-600' 
          : 'bg-green-100 text-green-600'
      }`}>
        {registro.acao === 'retirada' ? (
          <Key className="w-4 h-4" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900">
            {registro.acao === 'retirada' ? 'Chave retirada' : 'Chave devolvida'}
          </p>
          <span className="text-sm text-gray-500">
            {formatarData(registro.dataHora)}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          por {usuarioRegistro?.nome || 'Carregando...'}
        </p>
        {registro.observacoes && (
          <p className="text-sm text-gray-600 mt-1">
            Obs: {registro.observacoes}
          </p>
        )}
      </div>
    </div>
  );
}