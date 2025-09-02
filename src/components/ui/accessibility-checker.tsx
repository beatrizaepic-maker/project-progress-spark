import React from 'react';
import { useContrastValidation, accessibleColors } from '@/utils/accessibility';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilityCheckerProps {
  foregroundColor: string;
  backgroundColor: string;
  textContent?: string;
  isLargeText?: boolean;
  className?: string;
}

/**
 * Componente para validar acessibilidade de cores em tempo de desenvolvimento
 * Só deve ser usado em NODE_ENV === 'development'
 */
export const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({
  foregroundColor,
  backgroundColor,
  textContent = 'Texto de exemplo',
  isLargeText = false,
  className
}) => {
  const { ratio, meetsAA, meetsAAA, suggestion } = useContrastValidation(
    foregroundColor,
    backgroundColor
  );

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusIcon = () => {
    if (meetsAAA) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (meetsAA) return <span className="text-blue-500">ℹ️</span>;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (meetsAAA) return 'Atende AAA';
    if (meetsAA) return 'Atende AA';
    return 'Não atende';
  };

  const getStatusColor = () => {
    if (meetsAAA) return 'text-green-600 bg-green-50 border-green-200';
    if (meetsAA) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className={cn(
      'fixed bottom-4 right-4 p-4 border rounded-lg shadow-lg bg-white z-50',
      'max-w-sm text-sm space-y-3',
      className
    )}>
      {/* Título */}
      <div className="flex items-center gap-2 font-medium">
        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
          ACESSIBILIDADE
        </span>
      </div>

      {/* Exemplo visual */}
      <div
        className="p-3 rounded border"
        style={{
          backgroundColor: backgroundColor,
          color: foregroundColor
        }}
      >
        <div className={isLargeText ? 'text-lg font-bold' : 'text-sm'}>
          {textContent}
        </div>
      </div>

      {/* Informações de contraste */}
      <div className="space-y-2">
        <div className={cn(
          'flex items-center gap-2 p-2 rounded border',
          getStatusColor()
        )}>
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>

        <div className="text-xs space-y-1">
          <div>
            <strong>Taxa de contraste:</strong> {ratio.toFixed(2)}:1
          </div>
          <div>
            <strong>Tipo de texto:</strong> {isLargeText ? 'Grande' : 'Normal'}
          </div>
          <div>
            <strong>Cores:</strong>
            <div className="flex gap-2 mt-1">
              <div
                className="w-4 h-4 border rounded"
                style={{ backgroundColor: foregroundColor }}
                title={`Texto: ${foregroundColor}`}
              />
              <div
                className="w-4 h-4 border rounded"
                style={{ backgroundColor: backgroundColor }}
                title={`Fundo: ${backgroundColor}`}
              />
            </div>
          </div>
        </div>

        {/* Sugestão de melhoria */}
        {suggestion && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="font-medium text-yellow-800 mb-1">
              Sugestão de melhoria:
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 border rounded"
                style={{ backgroundColor: suggestion }}
              />
              <code className="text-yellow-700">{suggestion}</code>
            </div>
          </div>
        )}

        {/* Cores acessíveis recomendadas */}
        <details className="text-xs">
          <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">
            Cores acessíveis recomendadas
          </summary>
          <div className="mt-2 space-y-2">
            <div>
              <div className="font-medium mb-1">Para fundos claros:</div>
              <div className="flex gap-1">
                {Object.entries(accessibleColors.texts).map(([key, color]) => (
                  key.includes('Light') && (
                    <div
                      key={key}
                      className="w-4 h-4 border rounded cursor-pointer"
                      style={{ backgroundColor: color }}
                      title={`${key}: ${color}`}
                      onClick={() => navigator.clipboard?.writeText(color)}
                    />
                  )
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">Para fundos escuros:</div>
              <div className="flex gap-1">
                {Object.entries(accessibleColors.texts).map(([key, color]) => (
                  key.includes('Dark') && (
                    <div
                      key={key}
                      className="w-4 h-4 border rounded cursor-pointer"
                      style={{ backgroundColor: color }}
                      title={`${key}: ${color}`}
                      onClick={() => navigator.clipboard?.writeText(color)}
                    />
                  )
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

/**
 * Hook para monitorar acessibilidade de um elemento
 */
export function useAccessibilityMonitor(elementRef: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || !elementRef.current) return;

    const element = elementRef.current;
    const styles = getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    // Converte RGB para HEX se necessário
    const rgbToHex = (rgb: string) => {
      const match = rgb.match(/\d+/g);
      if (!match) return rgb;
      const [r, g, b] = match.map(Number);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };

    const hexColor = color.startsWith('rgb') ? rgbToHex(color) : color;
    const hexBg = backgroundColor.startsWith('rgb') ? rgbToHex(backgroundColor) : backgroundColor;

    console.group('🎨 Verificação de Acessibilidade');
    console.log('Elemento:', element);
    console.log('Cor do texto:', hexColor);
    console.log('Cor do fundo:', hexBg);
    console.groupEnd();
  }, [elementRef]);
}

export default AccessibilityChecker;
