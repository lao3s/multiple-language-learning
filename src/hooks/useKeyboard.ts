import { useEffect, useCallback } from 'react';

interface UseKeyboardProps {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  disabled?: boolean;
}

export const useKeyboard = ({
  onEnter,
  onEscape,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  disabled = false,
}: UseKeyboardProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
    }
  }, [disabled, onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]);

  useEffect(() => {
    if (disabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, disabled]);
};
