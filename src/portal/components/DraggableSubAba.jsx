import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Move } from 'lucide-react';

/**
 * DraggableSubAba
 * Componente que envolve qualquer sub-aba/modal do sistema permitindo:
 * 1. Mover livremente a janela pela tela (arrastando pelo cabeçalho ou pelo botão "Mover")
 * 2. Redimensionar a janela através da extensão no canto inferior direito
 */
export default function DraggableSubAba({
  children,
  className = 'modal-content-card',
  style = {},
  showMoveHandle = true,
  moveHandleLabel = 'Mover Sub-Aba',
  onClose,
  onClick,
  ...props
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: null, height: null });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const cardRef = useRef(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, startW: 0, startH: 0 });

  // Iniciar Arraste / Mover
  const handleDragStart = useCallback((e) => {
    // Não iniciar arraste se clicou em botões, links, formulários ou elementos marcados como no-drag
    if (e.target.closest('button, a, input, select, textarea, .no-drag, .sub-aba-corner-handle')) {
      return;
    }
    e.preventDefault();
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
      baseTop: rect.top - position.y,
      baseBottom: rect.bottom - position.y,
      baseLeft: rect.left - position.x,
      baseRight: rect.right - position.x
    };
  }, [position]);

  // Iniciar Redimensionamento pelo Canto Inferior Direito
  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!cardRef.current) return;

    setIsResizing(true);
    const rect = cardRef.current.getBoundingClientRect();
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: rect.width,
      startH: rect.height,
      rectTop: rect.top,
      rectLeft: rect.left
    };
  }, []);

  // Ouvintes globais de movimento do rato para Arraste com Clamping Rígido (Nunca sumir da tela)
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e) => {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const { posX, posY } = dragStartRef.current;

      // Movimentação livre sem limitação rígida de tela (conforme solicitado pelo utilizador)
      const newX = posX + dx;
      const newY = posY + dy;

      setPosition({
        x: newX,
        y: newY
      });

      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // Ouvintes globais de movimento do rato para Redimensionamento com Clamping
  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e) => {
      const dw = e.clientX - resizeStartRef.current.mouseX;
      const dh = e.clientY - resizeStartRef.current.mouseY;

      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const { rectTop, rectLeft, startW, startH } = resizeStartRef.current;

      // Limites ergonómicos mínimos e máximos da tela atual
      const minW = 400;
      const minH = 320;
      
      // O tamanho máximo para baixo e para os lados respeita a tela para nunca ultrapassar ou sumir
      const maxH = Math.max(minH, viewportH - rectTop - 20);
      const maxW = Math.max(minW, viewportW - rectLeft - 20);

      const newW = Math.min(maxW, Math.max(minW, startW + dw));
      const newH = Math.min(maxH, Math.max(minH, startH + dh));

      setSize({ width: newW, height: newH });
      if (cardRef.current) {
        cardRef.current.style.setProperty('width', `${newW}px`, 'important');
        cardRef.current.style.setProperty('max-width', `${newW}px`, 'important');
        cardRef.current.style.setProperty('height', `${newH}px`, 'important');
        cardRef.current.style.setProperty('max-height', `${newH}px`, 'important');
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);



  // Duplo clique na barra de movimentação para recentralizar a janela
  const handleResetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setSize({ width: null, height: null });
    if (cardRef.current) {
      cardRef.current.style.removeProperty('width');
      cardRef.current.style.removeProperty('max-width');
      cardRef.current.style.removeProperty('height');
      cardRef.current.style.removeProperty('min-height');
      cardRef.current.style.removeProperty('max-height');
      cardRef.current.style.transform = 'translate3d(0px, 0px, 0)';
    }
  };

  const cardStyle = {
    ...style,
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    ...(size.width ? { width: `${size.width}px`, maxWidth: `${size.width}px` } : {}),
    ...(size.height ? { height: `${size.height}px`, minHeight: `${size.height}px` } : {}),
    position: 'relative',
    userSelect: isDragging ? 'none' : 'auto',
    cursor: isDragging ? 'grabbing' : 'default'
  };

  return (
    <div
      ref={cardRef}
      className={`${className} ${isDragging ? 'is-dragging' : ''} ${isResizing ? 'is-resizing' : ''}`}
      style={cardStyle}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {/* BARRA SUPERIOR DE CONTROLO DE MOVIMENTO (OPÇÃO DE MOVER A SUB-ABA) */}
      {showMoveHandle && (
        <div 
          className="sub-aba-drag-bar" 
          onMouseDown={handleDragStart}
          onDoubleClick={handleResetPosition}
          title="Clique e arraste para mover a sub-aba pela tela (Duplo-clique para recentralizar)"
        >
          <div className="sub-aba-move-pill">
            <Move size={13} />
            <span>{moveHandleLabel}</span>
          </div>
          <div className="sub-aba-drag-controls no-drag" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="sub-aba-drag-hint">Arraste para mover • Duplo-clique p/ centralizar</span>
            {onClose && (
              <button
                type="button"
                className="sub-aba-header-close-btn no-drag"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                title="Fechar Sub-Aba"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL DA SUB-ABA */}
      <div className="sub-aba-inner-content">
        {children}
      </div>

      {/* EXTENSÃO NO CANTO INFERIOR DIREITO (GRIP DE REDIMENSIONAMENTO) */}
      <div
        className="sub-aba-corner-handle"
        onMouseDown={handleResizeStart}
        onDoubleClick={handleResetPosition}
        title="Extensão: Clique e arraste para redimensionar (Duplo-clique para restaurar tamanho)"
        aria-label="Redimensionar sub-aba"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="14" cy="14" r="1.4" />
          <circle cx="10" cy="14" r="1.4" />
          <circle cx="6" cy="14" r="1.4" />
          <circle cx="14" cy="10" r="1.4" />
          <circle cx="10" cy="10" r="1.4" />
          <circle cx="14" cy="6" r="1.4" />
        </svg>
      </div>
    </div>
  );
}
