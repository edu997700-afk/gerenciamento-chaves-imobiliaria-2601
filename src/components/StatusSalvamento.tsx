'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, CheckCircle, AlertCircle } from 'lucide-react';

interface StatusSalvamentoProps {
  supabaseConectado: boolean;
  ultimaAtualizacao?: Date;
  className?: string;
}

export default function StatusSalvamento({ 
  supabaseConectado, 
  ultimaAtualizacao,
  className = '' 
}: StatusSalvamentoProps) {
  const [statusConexao, setStatusConexao] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    const verificarConexao = () => {
      setStatusConexao(navigator.onLine ? 'online' : 'offline');
    };

    // Verificar conexão inicial
    verificarConexao();

    // Escutar mudanças na conexão
    window.addEventListener('online', verificarConexao);
    window.addEventListener('offline', verificarConexao);

    return () => {
      window.removeEventListener('online', verificarConexao);
      window.removeEventListener('offline', verificarConexao);
    };
  }, []);

  const getStatusInfo = () => {
    if (statusConexao === 'offline') {
      return {
        icone: <WifiOff className="w-4 h-4 text-red-500" />,
        texto: 'Offline',
        cor: 'text-red-600',
        bg: 'bg-red-50 border-red-200'
      };
    }

    if (!supabaseConectado) {
      return {
        icone: <AlertCircle className="w-4 h-4 text-yellow-500" />,
        texto: 'Sem banco',
        cor: 'text-yellow-600',
        bg: 'bg-yellow-50 border-yellow-200'
      };
    }

    return {
      icone: <CheckCircle className="w-4 h-4 text-green-500" />,
      texto: 'Salvamento ativo',
      cor: 'text-green-600',
      bg: 'bg-green-50 border-green-200'
    };
  };

  const status = getStatusInfo();

  const formatarUltimaAtualizacao = () => {
    if (!ultimaAtualizacao) return '';
    
    const agora = new Date();
    const diff = agora.getTime() - ultimaAtualizacao.getTime();
    const segundos = Math.floor(diff / 1000);
    const minutos = Math.floor(segundos / 60);
    
    if (segundos < 60) {
      return `há ${segundos}s`;
    } else if (minutos < 60) {
      return `há ${minutos}m`;
    } else {
      return ultimaAtualizacao.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${status.bg} ${className}`}>
      <Database className="w-4 h-4 text-gray-500" />
      {status.icone}
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${status.cor}`}>
          {status.texto}
        </span>
        {ultimaAtualizacao && supabaseConectado && statusConexao === 'online' && (
          <span className="text-xs text-gray-500">
            {formatarUltimaAtualizacao()}
          </span>
        )}
      </div>
    </div>
  );
}

// Componente compacto para header
export function StatusSalvamentoCompacto({ 
  supabaseConectado, 
  className = '' 
}: { 
  supabaseConectado: boolean; 
  className?: string; 
}) {
  const [statusConexao, setStatusConexao] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    const verificarConexao = () => {
      setStatusConexao(navigator.onLine ? 'online' : 'offline');
    };

    verificarConexao();
    window.addEventListener('online', verificarConexao);
    window.addEventListener('offline', verificarConexao);

    return () => {
      window.removeEventListener('online', verificarConexao);
      window.removeEventListener('offline', verificarConexao);
    };
  }, []);

  const getStatusIcon = () => {
    if (statusConexao === 'offline') {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }

    if (!supabaseConectado) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }

    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getTooltip = () => {
    if (statusConexao === 'offline') {
      return 'Sem conexão com a internet';
    }

    if (!supabaseConectado) {
      return 'Banco de dados não configurado';
    }

    return 'Salvamento automático ativo';
  };

  return (
    <div 
      className={`inline-flex items-center space-x-1 ${className}`}
      title={getTooltip()}
    >
      <Database className="w-3 h-3 text-gray-400" />
      {getStatusIcon()}
    </div>
  );
}