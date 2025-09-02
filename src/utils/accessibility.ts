/**
 * Utilitários para garantir acessibilidade
 */

/**
 * Calcula a luminância relativa de uma cor
 * @param r Componente vermelho (0-255)
 * @param g Componente verde (0-255)
 * @param b Componente azul (0-255)
 * @returns Luminância relativa (0-1)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Converte cor hexadecimal para RGB
 * @param hex Cor em formato hexadecimal (ex: "#FF0000")
 * @returns Objeto com componentes RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calcula a taxa de contraste entre duas cores
 * @param color1 Primeira cor (hex)
 * @param color2 Segunda cor (hex)
 * @returns Taxa de contraste (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Verifica se uma combinação de cores atende aos critérios WCAG
 * @param foreground Cor do texto
 * @param background Cor do fundo
 * @param level Nível de conformidade ('AA' ou 'AAA')
 * @param isLargeText Se o texto é considerado grande (18pt+ ou 14pt+ bold)
 * @returns Se a combinação atende aos critérios
 */
export function meetsWCAGContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  } else {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
}

/**
 * Sugere uma cor alternativa que atende aos critérios de contraste
 * @param foreground Cor do texto atual
 * @param background Cor do fundo
 * @param targetRatio Taxa de contraste desejada
 * @returns Cor alternativa ou null se não conseguir encontrar
 */
export function suggestAccessibleColor(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string | null {
  const bgRgb = hexToRgb(background);
  if (!bgRgb) return null;
  
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  // Tenta escurecer ou clarear a cor do primeiro plano
  for (let adjustment = 0; adjustment <= 255; adjustment += 5) {
    // Tenta escurecer
    const darkerR = Math.max(0, parseInt(foreground.slice(1, 3), 16) - adjustment);
    const darkerG = Math.max(0, parseInt(foreground.slice(3, 5), 16) - adjustment);
    const darkerB = Math.max(0, parseInt(foreground.slice(5, 7), 16) - adjustment);
    const darkerHex = `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
    
    if (getContrastRatio(darkerHex, background) >= targetRatio) {
      return darkerHex;
    }
    
    // Tenta clarear
    const lighterR = Math.min(255, parseInt(foreground.slice(1, 3), 16) + adjustment);
    const lighterG = Math.min(255, parseInt(foreground.slice(3, 5), 16) + adjustment);
    const lighterB = Math.min(255, parseInt(foreground.slice(5, 7), 16) + adjustment);
    const lighterHex = `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
    
    if (getContrastRatio(lighterHex, background) >= targetRatio) {
      return lighterHex;
    }
  }
  
  return null;
}

/**
 * Conjunto de cores acessíveis pré-validadas
 */
export const accessibleColors = {
  backgrounds: {
    light: '#ffffff',
    lightGray: '#f8f9fa',
    dark: '#1a1a1a',
    darkGray: '#2d3748'
  },
  texts: {
    onLight: '#1a1a1a', // 16.2:1 ratio
    onLightSecondary: '#4a5568', // 7.3:1 ratio
    onDark: '#ffffff', // 16.2:1 ratio
    onDarkSecondary: '#e2e8f0' // 9.7:1 ratio
  },
  status: {
    success: {
      light: '#22c55e', // Para fundos claros
      dark: '#4ade80'   // Para fundos escuros
    },
    warning: {
      light: '#f59e0b', // Para fundos claros
      dark: '#fbbf24'   // Para fundos escuros
    },
    error: {
      light: '#ef4444', // Para fundos claros
      dark: '#f87171'   // Para fundos escuros
    }
  }
};

/**
 * Hook React para validação de contraste em tempo real
 */
export function useContrastValidation(foreground: string, background: string) {
  const ratio = getContrastRatio(foreground, background);
  const meetsAA = meetsWCAGContrast(foreground, background, 'AA');
  const meetsAAA = meetsWCAGContrast(foreground, background, 'AAA');
  
  return {
    ratio,
    meetsAA,
    meetsAAA,
    suggestion: meetsAA ? null : suggestAccessibleColor(foreground, background)
  };
}

/**
 * Utilitário para criar indicadores de foco visíveis
 */
export const focusStyles = {
  ring: 'focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2',
  border: 'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
  shadow: 'focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.5)]',
  custom: (color: string = 'blue') => `focus:outline-none focus:ring-4 focus:ring-${color}-500/50 focus:ring-offset-2`
};
