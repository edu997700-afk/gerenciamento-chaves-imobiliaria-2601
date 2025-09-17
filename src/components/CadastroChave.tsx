import { useState } from 'react';
import { ArrowLeft, Plus, QrCode, Save, Trash, Key, MapPin } from 'lucide-react';
import { Chave, Usuario } from '@/lib/types';
import { adicionarChave, getChaves, removerChaveSupabase } from '@/lib/supabase-data';

interface CadastroChaveProps {
  onVoltar: () => void;
  onChaveCadastrada: (chave: Chave | null) => void;
  usuario?: Usuario | null;
}

export default function CadastroChave({ onVoltar, onChaveCadastrada, usuario }: CadastroChaveProps) {
  const [formData, setFormData] = useState({
    codigoImovel: '',
    endereco: '',
    tipo: 'apartamento' as 'apartamento' | 'casa' | 'comercial' | 'terreno',
    armario: ''
  });
  const [carregando, setCarregando] = useState(false);
  const [qrCodeGerado, setQrCodeGerado] = useState('');
  const [mostrarLista, setMostrarLista] = useState(false);
  const [chaves, setChaves] = useState<Chave[]>([]);

  if (!usuario || usuario.cargo !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem cadastrar novas chaves.</p>
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

  const carregarChaves = async () => {
    const chavesData = await getChaves();
    setChaves(chavesData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const gerarQRCode = () => {
    if (!formData.codigoImovel) {
      alert('Digite o código do imóvel primeiro');
      return;
    }
    
    const qrCode = `QR_${formData.codigoImovel}_${Date.now()}`;
    setQrCodeGerado(qrCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigoImovel || !formData.endereco || !formData.armario) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setCarregando(true);

    try {
      const novaChave = await adicionarChave({
        codigoImovel: formData.codigoImovel,
        endereco: formData.endereco,
        tipo: formData.tipo,
        armario: formData.armario,
        status: 'disponivel',
        qrCode: qrCodeGerado || `QR_${formData.codigoImovel}`
      });

      if (novaChave) {
        setCarregando(false);
        onChaveCadastrada(novaChave);
      } else {
        setCarregando(false);
        alert('Erro ao cadastrar chave. Verifique se o código não está duplicado.');
      }
    } catch (error) {
      setCarregando(false);
      console.error('Erro ao cadastrar chave:', error);
      alert('Erro ao cadastrar chave. Tente novamente.');
    }
  };

  const handleDelete = async (chaveId: string) => {
    const chave = chaves.find(c => c.id === chaveId);
    if (!chave) {
      alert('Chave não encontrada.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir a chave ${chave.codigoImovel}?`)) {
      const sucesso = await removerChaveSupabase(chave.id);
      if (sucesso) {
        alert('Chave excluída com sucesso!');
        await carregarChaves(); // Recarregar lista
      } else {
        alert('Erro ao excluir a chave.');
      }
    }
  };

  const handleMostrarLista = async () => {
    if (!mostrarLista) {
      await carregarChaves();
    }
    setMostrarLista(!mostrarLista);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-100 text-green-800';
      case 'em_uso': return 'bg-orange-100 text-orange-800';
      case 'manutencao': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'em_uso': return 'Em uso';
      case 'manutencao': return 'Manutenção';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={onVoltar}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Chaves</h1>
                <p className="text-gray-600">Cadastre novas chaves ou gerencie as existentes</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMostrarLista}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                {mostrarLista ? 'Ocultar Lista' : 'Ver Chaves Cadastradas'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Lista de Chaves Existentes */}
        {mostrarLista && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Chaves Cadastradas</h2>
                <p className="text-gray-600">Total: {chaves.length} chaves</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {chaves.length === 0 ? (
                  <div className="p-8 text-center">
                    <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma chave cadastrada ainda</p>
                  </div>
                ) : (
                  chaves.map((chave) => (
                    <div key={chave.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{getTipoIcon(chave.tipo)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{chave.codigoImovel}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chave.status)}`}>
                                {getStatusText(chave.status)}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{chave.endereco}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Tipo: {chave.tipo.charAt(0).toUpperCase() + chave.tipo.slice(1)}</span>
                              <span>Armário: {chave.armario}</span>
                              <span>QR: {chave.qrCode}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDelete(chave.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                          >
                            <Trash className="w-4 h-4" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Formulário de Cadastro */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Cadastrar Nova Chave</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="codigoImovel" className="block text-sm font-medium text-gray-700 mb-2">
                    Código do Imóvel *
                  </label>
                  <input
                    type="text"
                    id="codigoImovel"
                    name="codigoImovel"
                    value={formData.codigoImovel}
                    onChange={handleInputChange}
                    placeholder="Ex: APT001, CASA001, COM001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço Completo *
                  </label>
                  <textarea
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    placeholder="Ex: Rua das Flores, 123 - Apto 101, Centro, São Paulo - SP"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo do Imóvel *
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="apartamento">🏢 Apartamento</option>
                      <option value="casa">🏠 Casa</option>
                      <option value="comercial">🏪 Comercial</option>
                      <option value="terreno">🌳 Terreno</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="armario" className="block text-sm font-medium text-gray-700 mb-2">
                      Armário *
                    </label>
                    <input
                      type="text"
                      id="armario"
                      name="armario"
                      value={formData.armario}
                      onChange={handleInputChange}
                      placeholder="Ex: A1, B2, C3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="button"
                    onClick={onVoltar}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={carregando}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {carregando ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Cadastrar Chave
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview e QR Code */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                {formData.codigoImovel ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getTipoIcon(formData.tipo)}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{formData.codigoImovel}</h4>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Disponível
                        </span>
                      </div>
                    </div>
                    
                    {formData.endereco && (
                      <p className="text-sm text-gray-600">{formData.endereco}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Tipo: {formData.tipo.charAt(0).toUpperCase() + formData.tipo.slice(1)}</span>
                      {formData.armario && <span>Armário: {formData.armario}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Preencha os dados para ver o preview</p>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
              
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={gerarQRCode}
                  disabled={!formData.codigoImovel}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Gerar QR Code
                </button>

                {qrCodeGerado && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-600 font-mono break-all">{qrCodeGerado}</p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <p>💡 O QR Code será gerado automaticamente se não for criado manualmente</p>
                </div>
              </div>
            </div>

            {/* Dicas */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Dicas</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use códigos únicos e padronizados</li>
                <li>• Inclua informações completas do endereço</li>
                <li>• O armário ajuda na localização física</li>
                <li>• O QR Code facilita o acesso rápido</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}