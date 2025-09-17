'use client';

import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { getUsuarios } from '@/lib/supabase-data';

interface LoginFormProps {
  onLogin: (usuario: any) => void;
}

// Usuários de fallback para garantir acesso mesmo sem Supabase
const usuariosFallback = [
  {
    id: 'fallback-admin',
    nome: 'Maria Santos',
    email: 'maria@imobiliaria.com',
    senha: '123456',
    cargo: 'admin' as const,
    ativo: true,
    criadoEm: new Date()
  },
  {
    id: 'fallback-corretor',
    nome: 'João Silva',
    email: 'joao@imobiliaria.com',
    senha: '123456',
    cargo: 'corretor' as const,
    ativo: true,
    criadoEm: new Date()
  },
  {
    id: 'fallback-pedro',
    nome: 'Pedro Costa',
    email: 'pedro@imobiliaria.com',
    senha: '123456',
    cargo: 'corretor' as const,
    ativo: true,
    criadoEm: new Date()
  },
  {
    id: 'fallback-eduardo',
    nome: 'Eduardo Armito',
    email: 'eduarmito790@gmail.com',
    senha: '123456',
    cargo: 'admin' as const,
    ativo: true,
    criadoEm: new Date()
  }
];

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrarUsuario, setLembrarUsuario] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      console.log('🔐 Tentando autenticação...');
      
      // Primeiro tentar buscar usuários do Supabase
      let usuarios = await getUsuarios();
      
      // Se não conseguir dados do Supabase, usar fallback
      if (!usuarios || usuarios.length === 0) {
        console.log('⚠️ Supabase não disponível, usando usuários de fallback');
        usuarios = usuariosFallback;
      }

      const usuario = usuarios.find(u => u.email === email && u.senha === senha && u.ativo);

      if (usuario) {
        console.log('✅ Login realizado com sucesso:', usuario.nome);
        
        if (lembrarUsuario) {
          localStorage.setItem('lembrarUsuario', 'true');
          localStorage.setItem('emailUsuario', email);
        }
        
        onLogin(usuario);
      } else {
        console.log('❌ Credenciais inválidas');
        setErro('E-mail ou senha incorretos');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      // Em caso de erro, tentar com usuários de fallback
      console.log('🔄 Tentando com usuários de fallback...');
      const usuario = usuariosFallback.find(u => u.email === email && u.senha === senha && u.ativo);
      
      if (usuario) {
        console.log('✅ Login realizado com fallback:', usuario.nome);
        onLogin(usuario);
      } else {
        setErro('E-mail ou senha incorretos');
      }
    }

    setCarregando(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">JRS IMÓVEIS</h1>
        <p className="text-gray-600 mt-2">Sistema de Gerenciamento de Chaves</p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {erro}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            E-mail ou usuário
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Digite seu e-mail"
            required
          />
        </div>

        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
            Senha
          </label>
          <div className="relative">
            <input
              id="senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Digite sua senha"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="lembrar"
            type="checkbox"
            checked={lembrarUsuario}
            onChange={(e) => setLembrarUsuario(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="lembrar" className="ml-2 text-sm text-gray-700">
            Lembrar usuário
          </label>
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {carregando ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Entrando...
            </div>
          ) : (
            'Entrar'
          )}
        </button>
      </form>
    </div>
  );
}