'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, X, Scan } from 'lucide-react';

interface QRScannerProps {
  onVoltar: () => void;
  onQRDetected: (qrCode: string) => void;
}

export default function QRScanner({ onVoltar, onQRDetected }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError('');
      setScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Erro ao acessar a câmera. Verifique as permissões.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const simulateQRDetection = () => {
    // Simular detecção de QR Code para demonstração
    const qrCodes = ['QR_APT001', 'QR_APT002', 'QR_CASA001', 'QR_COM001'];
    const randomQR = qrCodes[Math.floor(Math.random() * qrCodes.length)];
    
    setTimeout(() => {
      onQRDetected(randomQR);
      stopCamera();
    }, 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onQRDetected(manualCode.trim());
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
              <h1 className="text-2xl font-bold text-gray-900">Scanner QR Code</h1>
              <p className="text-gray-600">Escaneie o código da chave</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Câmera</h2>
            
            <div className="relative">
              {!scanning ? (
                <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-center mb-4">
                    Clique no botão abaixo para iniciar o scanner
                  </p>
                  <button
                    onClick={startCamera}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                  >
                    <Scan className="w-5 h-5" />
                    Iniciar Scanner
                  </button>
                </div>
              ) : (
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    onLoadedMetadata={simulateQRDetection}
                  />
                  
                  {/* Overlay de scanning */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg animate-pulse">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                    </div>
                  </div>

                  <button
                    onClick={stopCamera}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-center">
                      <p className="text-sm">Posicione o QR Code dentro do quadrado</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Entrada Manual */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Entrada Manual</h2>
              
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label htmlFor="manualCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Código QR
                  </label>
                  <input
                    type="text"
                    id="manualCode"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Digite o código QR manualmente"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buscar Chave
                </button>
              </form>
            </div>

            {/* Códigos de Demonstração */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">🔍 Códigos para Teste</h3>
              <div className="space-y-2">
                {['QR_APT001', 'QR_APT002', 'QR_CASA001', 'QR_COM001'].map((code) => (
                  <button
                    key={code}
                    onClick={() => setManualCode(code)}
                    className="w-full text-left px-3 py-2 bg-white rounded-lg text-sm text-blue-800 hover:bg-blue-100 transition-colors font-mono"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">📱 Como usar</h3>
              <ul className="text-xs text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                  Clique em "Iniciar Scanner" para ativar a câmera
                </li>
                <li className="flex items-start">
                  <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                  Posicione o QR Code dentro do quadrado
                </li>
                <li className="flex items-start">
                  <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                  Aguarde a detecção automática
                </li>
                <li className="flex items-start">
                  <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                  Ou digite o código manualmente
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}