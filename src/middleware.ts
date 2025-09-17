import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Criar resposta com headers CORS para permitir acesso externo
  const response = NextResponse.next();
  
  // Headers para permitir acesso de qualquer origem
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Permitir que o site seja incorporado em iframes
  response.headers.set('X-Frame-Options', 'ALLOWALL');
  
  // Configuração de segurança permissiva para acesso público
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors *; default-src 'self' 'unsafe-inline' 'unsafe-eval' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; img-src 'self' data: blob: *; connect-src 'self' *;"
  );
  
  // Headers adicionais para melhor compatibilidade
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}

// Aplicar middleware a todas as rotas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};