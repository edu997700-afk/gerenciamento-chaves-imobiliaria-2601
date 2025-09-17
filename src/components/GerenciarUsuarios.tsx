'use client';

import { useState, useEffect } from 'react';
import { Trash, Plus, ArrowLeft } from 'lucide-react';
import { Usuario } from '@/lib/types';
import { getUsuarios, adicionarUsuario, removerUsuarioSupabase, escutarMudancasUsuarios } from '@/lib/supabase-data';
import NotificacaoSalvamento from '@/components/NotificacaoSalvamento';

interface GerenciarUsuariosProps {
  onVoltar: () => void;
  usuario?: Usuario | null;
}

export default function GerenciarUsuarios({ onVoltar, usuario }: GerenciarUsuariosProps) {
  const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([]);
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '', senha: '', cargo: 'corretor' as 'corretor' | 'admin' });
  const [carregando, setCarregando] = useState(false);
  const [mostrarNotificacao, setMostrarNotificacao] = useState(false);
  const [tipoNotificacao, setTipoNotificacao] = useState<'sucesso' | 'erro'>('sucesso');
  const [mensagemNotificacao, setMensagemNotificacao] = useState('');
  const [usuarioParaRemover, setUsuarioParaRemover] = useState<{id: string, nome: string} | null>(null);
  const [removendoUsuario, setRemovendoUsuario] = useState(false);

  useEffect(() => {
    const carregarUsuarios = async () => {
      console.log('🔄 Carregando usuários...');
      const usuarios = await getUsuarios();
      console.log('✅ Usuários carregados:', usuarios.length);
      setListaUsuarios(usuarios);
    };

    carregarUsuarios();

    // Escutar mudanças em tempo real
    const unsubscribe = escutarMudancasUsuarios((novosUsuarios) => {
      console.log('🔄 Usuários atualizados em tempo real:', novosUsuarios.length);
      setListaUsuarios(novosUsuarios);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const mostrarNotificacaoTemporaria = (tipo: 'sucesso' | 'erro', mensagem: string) => {
    setTipoNotificacao(tipo);
    setMensagemNotificacao(mensagem);
    setMostrarNotificacao(true);
    setTimeout(() => setMostrarNotificacao(false), 3000);
  };

  if (!usuario || usuario.cargo !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem gerenciar usuários.</p>
          <button
            onClick={onVoltar}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const handleAdicionarUsuario = async () => {
    if (novoUsuario.nome && novoUsuario.email && novoUsuario.senha) {
      // Verificar se email já existe
      const emailExiste = listaUsuarios.find(u => u.email === novoUsuario.email);
      if (emailExiste) {
        mostrarNotificacaoTemporaria('erro', 'Já existe um usuário com este email.');
        return;
      }

      setCarregando(true);
      console.log('💾 Adicionando novo usuário...');

      const usuarioAdicionado = await adicionarUsuario({
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        senha: novoUsuario.senha,
        cargo: novoUsuario.cargo,
        ativo: true
      });

      if (usuarioAdicionado) {
        setNovoUsuario({ nome: '', email: '', senha: '', cargo: 'corretor' });
        mostrarNotificacaoTemporaria('sucesso', `Usuário "${usuarioAdicionado.nome}" adicionado com sucesso!`);
        console.log('✅ Usuário adicionado com sucesso');
        
        // Recarregar lista para garantir sincronização
        const usuariosAtualizados = await getUsuarios();
        setListaUsuarios(usuariosAtualizados);
      } else {
        mostrarNotificacaoTemporaria('erro', 'Erro ao adicionar usuário. Verifique se o email não está duplicado.');
      }

      setCarregando(false);
    } else {
      mostrarNotificacaoTemporaria('erro', 'Por favor, preencha todos os campos.');
    }
  };

  const iniciarRemocaoUsuario = (usuarioId: string, nomeUsuario: string) => {
    if (usuarioId === usuario.id) {
      mostrarNotificacaoTemporaria('erro', 'Você não pode remover seu próprio usuário.');
      return;
    }
    console.log('🗑️ Iniciando remoção do usuário:', nomeUsuario);
    setUsuarioParaRemover({ id: usuarioId, nome: nomeUsuario });
  };

  const confirmarRemocaoUsuario = async () => {
    if (!usuarioParaRemover) return;

    setRemovendoUsuario(true);
    console.log('🗑️ Confirmando remoção do usuário:', usuarioParaRemover.nome);
    
    try {
      const sucesso = await removerUsuarioSupabase(usuarioParaRemover.id);
      
      if (sucesso) {
        mostrarNotificacaoTemporaria('sucesso', `Usuário "${usuarioParaRemover.nome}" removido com sucesso!`);
        console.log('✅ Usuário removido com sucesso');
        
        // Atualizar lista local imediatamente
        setListaUsuarios(prev => prev.filter(u => u.id !== usuarioParaRemover.id));
        
        // Recarregar dados para garantir sincronização
        setTimeout(async () => {
          const usuariosAtualizados = await getUsuarios();
          setListaUsuarios(usuariosAtualizados);
        }, 500);
      } else {
        mostrarNotificacaoTemporaria('erro', 'Erro ao remover usuário. Tente novamente.');
        console.error('❌ Falha ao remover usuário');
      }
    } catch (error) {
      console.error('❌ Erro ao remover usuário:', error);
      mostrarNotificacaoTemporaria('erro', 'Erro ao remover usuário. Verifique sua conexão.');
    }

    setRemovendoUsuario(false);
    setUsuarioParaRemover(null);
  };

  const cancelarRemocaoUsuario = () => {
    console.log('❌ Remoção cancelada pelo usuário');
    setUsuarioParaRemover(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notificação */}
      {mostrarNotificacao && (
        <NotificacaoSalvamento
          tipo={tipoNotificacao}
          mensagem={mensagemNotificacao}
          visivel={mostrarNotificacao}
          onFechar={() => setMostrarNotificacao(false)}
        />
      )}

      {/* Modal de Confirmação */}
      {usuarioParaRemover && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Confirmar Remoção</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja remover o usuário <strong>"{usuarioParaRemover.nome}"</strong>? 
              <br /><br />
              <span className="text-red-600 font-medium">Esta ação não pode ser desfeita e todos os dados do usuário serão perdidos permanentemente.</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelarRemocaoUsuario}
                disabled={removendoUsuario}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRemocaoUsuario}
                disabled={removendoUsuario}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {removendoUsuario ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Removendo...
                  </>
                ) : (
                  <>
                    <Trash className="w-4 h-4" />
                    Remover Definitivamente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={onVoltar}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
              <p className="text-gray-600">Adicione e gerencie usuários do sistema com salvamento automático</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Formulário para adicionar usuário */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Novo Usuário</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Nome completo"
              value={novoUsuario.nome}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email"
              value={novoUsuario.email}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Senha"
              value={novoUsuario.senha}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={novoUsuario.cargo}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, cargo: e.target.value as 'corretor' | 'admin' })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="corretor">Corretor</option>
              <option value="admin">Administrador</option>
            </select>
            <button
              onClick={handleAdicionarUsuario}
              disabled={carregando}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {carregando ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Adicionar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lista de usuários */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usuários Cadastrados ({listaUsuarios.length})</h2>
          {listaUsuarios.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">Nenhum usuário cadastrado ainda</p>
              <p className="text-gray-400 text-sm">Use o formulário acima para adicionar o primeiro usuário</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {listaUsuarios.map((usuarioItem) => (
                <div key={usuarioItem.id} className="py-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {usuarioItem.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{usuarioItem.nome}</p>
                      <p className="text-gray-600 text-sm">{usuarioItem.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          usuarioItem.cargo === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {usuarioItem.cargo === 'admin' ? 'Administrador' : 'Corretor'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          usuarioItem.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuarioItem.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      Criado em {usuarioItem.criadoEm.toLocaleDateString()}
                    </span>
                    {usuarioItem.id !== usuario.id && (
                      <button
                        onClick={() => iniciarRemocaoUsuario(usuarioItem.id, usuarioItem.nome)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 hover:shadow-lg"
                        title={`Remover usuário ${usuarioItem.nome}`}
                      >
                        <Trash className="w-4 h-4" />
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações importantes */}
        <div className="bg-blue-50 rounded-xl p-6 mt-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💾 Sistema de Salvamento Automático</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• ✅ Todas as alterações são salvas automaticamente no banco de dados Supabase</li>
            <li>• 🔄 Atualizações em tempo real - mudanças aparecem instantaneamente</li>
            <li>• 🛡️ Apenas administradores podem gerenciar usuários</li>
            <li>• 🚫 Você não pode remover seu próprio usuário</li>
            <li>• 👥 Administradores têm acesso completo ao sistema</li>
            <li>• 🔑 Corretores podem apenas visualizar e usar chaves</li>
          </ul>
        </div>
      </div>
    </div>
  );
}