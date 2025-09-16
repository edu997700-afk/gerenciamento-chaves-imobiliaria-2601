'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Key, User, Clock, MapPin, QrCode, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { Chave } from '@/lib/types';
import { chaves, getUltimoRegistro } from '@/lib/data';

export default function ChavePage() {
  const params = useParams();
  const router = useRouter();
  const [chave, setChave] = useState<Chave | null>(null);
  const [ultimoRegistro, setUltimoRegistro] = useState<any>(null);

  useEffect(() => {
    const codigo = params.codigo as string;
    const chaveEncontrada = chaves.find(c => c.codigo === codigo);
    
    if (chaveEncontrada) {
      setChave(chaveEncontrada);
      const registro = getUltimoRegistro(codigo);
      setUltimoRegistro(registro);
    }
  }, [params.codigo]);

  if (!chave) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Chave não encontrada</h1>
          <p className="text-gray-600 mb-6">O código da chave não foi encontrado no sistema.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'disponivel':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'emprestada':
        return <Key className="w-5 h-5 text-yellow-600" />;
      case 'manutencao':
        return <Wrench className="w-5 h-5 text-red-600" />;
      default:
        return <Key className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'emprestada':
        return 'Emprestada';
      case 'manutencao':
        return 'Em Manutenção';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'emprestada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'manutencao':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Detalhes via QR Code</h1>
                <p className="text-sm text-gray-600">Chave {chave.codigo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header da Chave */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Chave {chave.codigo}</h2>
                  <p className="text-blue-100">{chave.tipo}</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full border ${getStatusColor(chave.status)} bg-white`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(chave.status)}
                  <span className="font-medium">{getStatusText(chave.status)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Chave */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações do Imóvel</h3>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Endereço</p>
                    <p className="text-gray-600">{chave.endereco}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Tipo de Imóvel</p>
                    <p className="text-gray-600">{chave.tipo}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Status Atual</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(chave.status)}
                      <span className="text-gray-600">{getStatusText(chave.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Último Movimento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Último Movimento</h3>
                
                {ultimoRegistro ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Corretor Responsável</p>
                        <p className="text-gray-600">{ultimoRegistro.corretor}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Data e Hora</p>
                        <p className="text-gray-600">
                          {new Date(ultimoRegistro.dataHora).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                        <div className={`w-3 h-3 rounded-full ${
                          ultimoRegistro.tipo === 'retirada' ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Tipo de Movimento</p>
                        <p className="text-gray-600 capitalize">{ultimoRegistro.tipo}</p>
                      </div>
                    </div>

                    {ultimoRegistro.observacoes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="font-medium text-gray-800 mb-1">Observações</p>
                        <p className="text-gray-600 text-sm">{ultimoRegistro.observacoes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Nenhum movimento registrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Acesso via QR Code • Sistema de Gestão de Chaves
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Acessar Sistema Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}