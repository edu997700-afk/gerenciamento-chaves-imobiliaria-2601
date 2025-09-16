'use client';

import React, { useRef } from 'react';
import QRCode from 'qrcode.react';
import { Printer, Download, X } from 'lucide-react';
import { Chave } from '@/lib/types';

interface QRCodeGeneratorProps {
  chave: Chave;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeGenerator({ chave, isOpen, onClose }: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // URL que será codificada no QR Code - aponta para a página de detalhes da chave
  const qrUrl = `${window.location.origin}/chave/${chave.codigo}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && qrRef.current) {
      const qrContent = qrRef.current.innerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${chave.codigo}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
              }
              .qr-container {
                text-align: center;
                border: 2px solid #1e40af;
                border-radius: 12px;
                padding: 30px;
                background: white;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .qr-title {
                font-size: 24px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 10px;
              }
              .qr-subtitle {
                font-size: 16px;
                color: #64748b;
                margin-bottom: 20px;
              }
              .qr-info {
                margin-top: 20px;
                font-size: 14px;
                color: #475569;
              }
              .qr-code {
                margin: 20px 0;
              }
              @media print {
                body { margin: 0; }
                .qr-container { 
                  border: 2px solid #1e40af;
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-title">Chave ${chave.codigo}</div>
              <div class="qr-subtitle">${chave.endereco}</div>
              <div class="qr-code">
                ${qrContent}
              </div>
              <div class="qr-info">
                <div><strong>Tipo:</strong> ${chave.tipo}</div>
                <div><strong>Status:</strong> ${chave.status === 'disponivel' ? 'Disponível' : chave.status === 'emprestada' ? 'Emprestada' : 'Manutenção'}</div>
                <div style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
                  Escaneie este QR Code para acessar os detalhes da chave
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const canvas = document.querySelector('#qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${chave.codigo}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">QR Code da Chave</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="bg-blue-50 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Chave {chave.codigo}
            </h3>
            <p className="text-blue-600 text-sm mb-4">{chave.endereco}</p>
            
            <div ref={qrRef} className="flex justify-center">
              <QRCode
                id="qr-canvas"
                value={qrUrl}
                size={200}
                level="M"
                includeMargin={true}
                fgColor="#1e40af"
                bgColor="#ffffff"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            <p className="mb-2">
              <strong>Tipo:</strong> {chave.tipo} | 
              <strong> Status:</strong> {
                chave.status === 'disponivel' ? ' Disponível' :
                chave.status === 'emprestada' ? ' Emprestada' : ' Manutenção'
              }
            </p>
            <p className="text-xs text-gray-500">
              Escaneie este QR Code para acessar os detalhes da chave
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar PNG
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>Dica:</strong> O QR Code redireciona para a página de detalhes desta chave. 
            Ideal para colar no chaveiro ou na documentação do imóvel.
          </p>
        </div>
      </div>
    </div>
  );
}