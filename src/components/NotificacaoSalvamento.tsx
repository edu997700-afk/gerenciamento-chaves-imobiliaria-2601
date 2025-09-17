'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface NotificacaoSalvamentoProps {
  tipo: 'sucesso' | 'erro' | 'info';
  mensagem: string;
  visivel: boolean;
  onFechar: () => void;
  autoFechar?: boolean;
  duracao?: number;
}

export default function NotificacaoSalvamento({ 
  tipo, 
  mensagem, 
  visivel, 
  onFechar, 
  autoFechar = true, 
  duracao = 3000 
}: NotificacaoSalvamentoProps) {
  useEffect(() => {
    if (visivel && autoFechar) {
      const timer = setTimeout(() => {
        onFechar();
      }, duracao);

      return () => clearTimeout(timer);
    }
  }, [visivel, autoFechar, duracao, onFechar]);

  if (!visivel) return null;

  const getEstilos = () => {
    switch (tipo) {
      case 'sucesso':
        return {
          bg: 'bg-green-50 border-green-200',
          texto: 'text-green-800',
          icone: <CheckCircle className="w-5 h-5 text-green-600" />
        };
      case 'erro':
        return {
          bg: 'bg-red-50 border-red-200',
          texto: 'text-red-800',
          icone: <AlertCircle className="w-5 h-5 text-red-600" />
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          texto: 'text-blue-800',
          icone: <CheckCircle className="w-5 h-5 text-blue-600" />
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          texto: 'text-gray-800',
          icone: <CheckCircle className="w-5 h-5 text-gray-600" />
        };
    }
  };

  const estilos = getEstilos();

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${estilos.bg} border rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-start space-x-3">
          {estilos.icone}
          <div className="flex-1">
            <p className={`text-sm font-medium ${estilos.texto}`}>
              {mensagem}
            </p>
          </div>
          <button
            onClick={onFechar}
            className={`${estilos.texto} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook para gerenciar notificações
export function useNotificacaoSalvamento() {
  const [notificacao, setNotificacao] = useState<{
    tipo: 'sucesso' | 'erro' | 'info';
    mensagem: string;
    visivel: boolean;
  }>({
    tipo: 'sucesso',
    mensagem: '',
    visivel: false
  });

  const mostrarNotificacao = (tipo: 'sucesso' | 'erro' | 'info', mensagem: string) => {
    setNotificacao({
      tipo,
      mensagem,
      visivel: true
    });
  };

  const fecharNotificacao = () => {
    setNotificacao(prev => ({ ...prev, visivel: false }));
  };

  const NotificacaoComponent = () => (
    <NotificacaoSalvamento
      tipo={notificacao.tipo}
      mensagem={notificacao.mensagem}
      visivel={notificacao.visivel}
      onFechar={fecharNotificacao}
    />
  );

  return {
    mostrarNotificacao,
    fecharNotificacao,
    NotificacaoComponent
  };
}