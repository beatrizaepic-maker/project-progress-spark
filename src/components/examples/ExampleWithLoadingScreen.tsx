import React from 'react';
import LoadingScreen from '../ui/LoadingScreen';
import { useLoadingScreen } from '../../hooks/useLoadingScreen';

// Exemplo de componente que usa a tela de carregamento
const ExampleWithLoadingScreen: React.FC = () => {
  const { isLoading, showLoading, hideLoading } = useLoadingScreen({
    duration: 4000, // 4 segundos
    autoShow: true, // Mostra automaticamente ao montar
    onComplete: () => {
      console.log('🎉 Carregamento concluído!');
    }
  });

  return (
    <>
      {/* Sua tela de carregamento incrível */}
      <LoadingScreen 
        isVisible={isLoading}
        onComplete={hideLoading}
        duration={4000}
      />

      {/* Conteúdo principal da aplicação */}
      {!isLoading && (
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Bem-vindo ao EPIC Project Spark! 🚀
          </h1>
          
          <button 
            onClick={showLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Mostrar Tela de Carregamento Novamente
          </button>
        </div>
      )}
    </>
  );
};

export default ExampleWithLoadingScreen;
