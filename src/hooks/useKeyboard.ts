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

    // 检查当前焦点是否在输入框上
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      (activeElement as HTMLElement).contentEditable === 'true'
    );

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
        // 如果输入框有焦点，不拦截方向键，让输入框处理
        if (!isInputFocused) {
          event.preventDefault();
          onArrowUp?.();
        }
        break;
      case 'ArrowDown':
        // 如果输入框有焦点，不拦截方向键，让输入框处理
        if (!isInputFocused) {
          event.preventDefault();
          onArrowDown?.();
        }
        break;
      case 'ArrowLeft':
        // 如果输入框有焦点，不拦截方向键，让输入框处理
        if (!isInputFocused) {
          event.preventDefault();
          onArrowLeft?.();
        }
        break;
      case 'ArrowRight':
        // 如果输入框有焦点，不拦截方向键，让输入框处理
        if (!isInputFocused) {
          event.preventDefault();
          onArrowRight?.();
        }
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
