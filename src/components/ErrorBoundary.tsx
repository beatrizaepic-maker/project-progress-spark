/**
 * Error Boundary Component
 * Captura erros de renderização React e exibe uma interface de fallback
 * Previne crashes da aplicação inteira
 */

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o estado para exibir a interface de fallback
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log detalhado do erro
    console.error('❌ Error Boundary capturou um erro:');
    console.error('   Erro:', error);
    console.error('   Info:', errorInfo);
    
    // Atualiza o estado com informações completas do erro
    this.setState(prevState => ({
      ...prevState,
      errorInfo
    }));
  }

  handleReset = () => {
    // Reseta o estado do Error Boundary
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Recarrega a página
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0F1E] to-[#1A1A2E] text-white">
          <div className="max-w-md w-full mx-4 p-8 bg-[#1A1A2E] border-2 border-[#FF0066]/30 rounded-lg shadow-2xl">
            {/* Ícone de erro */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full border-2 border-red-500/50">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-center mb-2">
              <span className="bg-gradient-to-r from-[#FF0066] to-[#FF6B9D] bg-clip-text text-transparent">
                Algo Deu Errado
              </span>
            </h1>

            {/* Mensagem */}
            <p className="text-center text-gray-400 mb-6 text-sm">
              Desculpe, encontramos um erro inesperado. A aplicação será reiniciada.
            </p>

            {/* Detalhes do erro (apenas em desenvolvimento) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-3 bg-gray-900/50 rounded border border-gray-700 text-xs font-mono overflow-auto max-h-32">
                <p className="text-red-400 font-bold mb-1">Detalhes do Erro:</p>
                <p className="text-gray-300">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details className="mt-2 cursor-pointer">
                    <summary className="text-gray-400">Stack Trace</summary>
                    <pre className="mt-2 text-gray-300 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Botão de ação */}
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#FF0066] to-[#6A0DAD] text-white font-semibold rounded-lg hover:from-[#FF0066]/80 hover:to-[#6A0DAD]/80 transition-all duration-200 transform hover:scale-105"
            >
              🔄 Tentar Novamente
            </button>

            {/* Link para suporte */}
            <p className="text-center text-gray-500 text-xs mt-4">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
