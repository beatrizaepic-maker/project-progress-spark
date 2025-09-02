import { useEffect, useCallback } from 'react';

export interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  disabled?: boolean;
}

/**
 * Hook para implementar navegação por teclado acessível
 * Fornece handlers para teclas comuns de navegação
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const {
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    disabled = false
  } = options;

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement> | KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
      case 'Tab':
        if (onTab) {
          onTab();
        }
        break;
    }
  }, [onEnter, onSpace, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, disabled]);

  useEffect(() => {
    if (!disabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, disabled]);

  return {
    keyboardProps: {
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => handleKeyDown(e),
      tabIndex: disabled ? -1 : 0
    }
  };
}

/**
 * Hook para criar um roving tabindex - navegação por setas dentro de um grupo
 */
export function useRovingTabIndex(items: HTMLElement[], currentIndex: number, setCurrentIndex: (index: number) => void) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(nextIndex);
        items[nextIndex]?.focus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        setCurrentIndex(prevIndex);
        items[prevIndex]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        setCurrentIndex(0);
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        const lastIndex = items.length - 1;
        setCurrentIndex(lastIndex);
        items[lastIndex]?.focus();
        break;
    }
  }, [items, currentIndex, setCurrentIndex]);

  return { handleKeyDown };
}
