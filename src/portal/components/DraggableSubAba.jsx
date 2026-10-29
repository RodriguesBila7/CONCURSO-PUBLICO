import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Move, X } from 'lucide-react';

// O body usa zoom CSS; as coordenadas do rato vêm em píxeis do ecrã
function getPageZoom() {
  const z = parseFloat(getComputedStyle(document.body).zoom);
  return Number.isFinite(z) && z > 0 ? z : 1;
}

/**
 * DraggableSubAba
 * Componente unificado que envolve qualquer sub-aba/modal do sistema permitindo:
 * 1. Mover livremente a janela pela tela (arrastando pelo cabeçalho ou barra de topo)
 * 2. Redimensionar a janela através da extensão no canto inferior direito
 * 3. Ancoragem estável do canto superior esquerdo durante a ampliação
 * 4. Proteção contra fecho acidental: isola cliques residuais e impede que o backdrop feche a janela ao arrastar/redimensionar
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
  const resizeStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    startW: 0,
    startH: 0,
    posX: 0,
    posY: 0,
    rectLeft: 0,
    rectTop: 0
  });

  // Flag global para suprimir o evento de clique que o browser dispara
  // imediatamente após soltar o botão do rato (mouseup) ao arrastar ou redimensionar.
  const suppressClickRef = useRef(false);
  const dragRafRef = useRef(null);
  const resizeRafRef = useRef(null);

  // Iniciar Arraste / Mover
  const handleDragStart = useCallback((e) => {
    // Não iniciar arraste se clicou em botões, links, formulários ou elementos marcados como no-drag
    if (e.target.closest('button, a, input, select, textarea, .no-drag, .sub-aba-corner-handle')) {
      return;
    }
    e.preventDefault();
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const zoom = getPageZoom();

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
      rectLeft: rect.left / zoom,
      rectTop: rect.top / zoom,
      lastX: position.x,
      lastY: position.y
    };
  }, [position]);

  // Iniciar Redimensionamento pelo Canto Inferior Direito
  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!cardRef.current) return;

    if (e.target && typeof e.target.setPointerCapture === 'function' && e.pointerId !== undefined) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    setIsResizing(true);
    const rect = cardRef.current.getBoundingClientRect();
    const zoom = getPageZoom();

    // Largura e altura atuais reais em píxeis de layout
    const currentW = cardRef.current.offsetWidth || (rect.width / zoom);
    const currentH = cardRef.current.offsetHeight || (rect.height / zoom);

    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: currentW,
      startH: currentH,
      posX: position.x,
      posY: position.y,
      rectLeft: rect.left / zoom,
      rectTop: rect.top / zoom
    };
  }, [position]);

  // Protecção do elemento pai (.modal-overlay / .gestor-modal-overlay)
  // Garante que o backdrop nunca feche acidentalmente se a interacção tiver começado
  // na sub-aba ou na alça de redimensionamento.
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;
    const parentEl = cardEl.parentElement;
    if (!parentEl) return;

    let mousedownWasOnBackdrop = false;

    const onParentMouseDown = (e) => {
      // Regista se o clique inicial começou genuinamente no backdrop exterior
      mousedownWasOnBackdrop = (e.target === parentEl);
    };

    const onParentClickCapture = (e) => {
      // Se acabou de arrastar/redimensionar, OU se o mousedown inicial não foi no backdrop,
      // suprime imediatamente o clique para impedir o encerramento da sub-aba!
      if (suppressClickRef.current || (!mousedownWasOnBackdrop && e.target === parentEl)) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
      }
      mousedownWasOnBackdrop = false;
    };

    parentEl.addEventListener('mousedown', onParentMouseDown, true);
    parentEl.addEventListener('click', onParentClickCapture, true);

    return () => {
      parentEl.removeEventListener('mousedown', onParentMouseDown, true);
      parentEl.removeEventListener('click', onParentClickCapture, true);
    };
  }, []);

  // Interceptor global de cliques na fase de CAPTURA da janela.
  // Garante de forma 100% segura que NENHUM manipulador de clique na página receba
  // o evento residual gerado ao soltar o rato após um arraste ou redimensionamento.
  useEffect(() => {
    const onWindowClickCapture = (e) => {
      if (suppressClickRef.current) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        suppressClickRef.current = false;
      }
    };

    window.addEventListener('click', onWindowClickCapture, true);
    return () => {
      window.removeEventListener('click', onWindowClickCapture, true);
    };
  }, []);

  // Ouvintes globais para Arraste / Mover com alta suavidade (requestAnimationFrame)
  useEffect(() => {
    if (!isDragging) return;

    let hasMoved = false;

    const onMouseMove = (e) => {
      const zoom = getPageZoom();
      const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
      const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        hasMoved = true;
      }

      const { posX, posY } = dragStartRef.current;
      const newX = Math.round(posX + dx);
      const newY = Math.round(posY + dy);

      dragStartRef.current.lastX = newX;
      dragStartRef.current.lastY = newY;

      if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = requestAnimationFrame(() => {
        if (cardRef.current) {
          cardRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
        }
      });
    };

    const onMouseUp = () => {
      if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
      setIsDragging(false);
      if (hasMoved) {
        suppressClickRef.current = true;
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 300);
      }

      if (dragStartRef.current.lastX !== undefined) {
        setPosition({
          x: dragStartRef.current.lastX,
          y: dragStartRef.current.lastY
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);
    return () => {
      if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onMouseUp);
    };
  }, [isDragging]);

  // Ouvintes globais para Redimensionamento com Ancoragem Firme
  useEffect(() => {
    if (!isResizing) return;

    let hasMoved = false;

    const onMouseMove = (e) => {
      const zoom = getPageZoom();
      const dw = (e.clientX - resizeStartRef.current.mouseX) / zoom;
      const dh = (e.clientY - resizeStartRef.current.mouseY) / zoom;

      if (Math.abs(dw) > 2 || Math.abs(dh) > 2) {
        hasMoved = true;
      }

      const viewportW = window.innerWidth / zoom;
      const viewportH = window.innerHeight / zoom;
      const { startW, startH, posX, posY, rectLeft, rectTop } = resizeStartRef.current;

      // Limites mínimos ergonómicos
      const minW = 380;
      const minH = 300;

      // Espaço máximo disponível a partir da posição atual do canto superior esquerdo
      const maxW = Math.max(minW, viewportW - Math.max(0, rectLeft) - 16);
      const maxH = Math.max(minH, viewportH - Math.max(0, rectTop) - 16);

      const newW = Math.round(Math.min(maxW, Math.max(minW, startW + dw)));
      const newH = Math.round(Math.min(maxH, Math.max(minH, startH + dh)));

      // Como o elemento está centralizado via flexbox, o aumento de tamanho expandiria
      // simetricamente em todas as direcções. Para ancorar o canto superior esquerdo no lugar
      // e fazer com que o canto inferior direito acompanhe o cursor do rato a 100%,
      // ajustamos o translate (position.x e position.y) pela metade da variação de tamanho:
      const deltaW = newW - startW;
      const deltaH = newH - startH;
      const newPosX = posX + (deltaW / 2);
      const newPosY = posY + (deltaH / 2);

      resizeStartRef.current.lastW = newW;
      resizeStartRef.current.lastH = newH;
      resizeStartRef.current.lastPosX = newPosX;
      resizeStartRef.current.lastPosY = newPosY;

      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = requestAnimationFrame(() => {
        if (cardRef.current) {
          cardRef.current.style.setProperty('width', `${newW}px`, 'important');
          cardRef.current.style.setProperty('max-width', `${newW}px`, 'important');
          cardRef.current.style.setProperty('height', `${newH}px`, 'important');
          cardRef.current.style.setProperty('min-height', `${newH}px`, 'important');
          cardRef.current.style.setProperty('max-height', `${newH}px`, 'important');
          cardRef.current.style.transform = `translate3d(${newPosX}px, ${newPosY}px, 0)`;
        }
      });
    };

    const onMouseUp = () => {
      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
      setIsResizing(false);
      if (hasMoved) {
        suppressClickRef.current = true;
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 300);
      }

      if (resizeStartRef.current.lastW && resizeStartRef.current.lastH) {
        setSize({
          width: resizeStartRef.current.lastW,
          height: resizeStartRef.current.lastH
        });
        setPosition({
          x: resizeStartRef.current.lastPosX,
          y: resizeStartRef.current.lastPosY
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);
    return () => {
      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onMouseUp);
    };
  }, [isResizing]);

  // Duplo clique na barra de movimentação ou na alça de extensão para recentralizar a janela
  const handleResetPosition = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
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
    ...(size.width ? { width: `${size.width}px !important`, maxWidth: `${size.width}px !important` } : {}),
    ...(size.height ? { height: `${size.height}px !important`, minHeight: `${size.height}px !important`, maxHeight: `${size.height}px !important` } : {}),
    position: 'relative',
    userSelect: (isDragging || isResizing) ? 'none' : 'auto',
    cursor: isDragging ? 'grabbing' : (isResizing ? 'se-resize' : 'default')
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
      onMouseDown={(e) => {
        // Impede que o evento de mousedown borbulhe para o backdrop
        e.stopPropagation();
      }}
      {...props}
    >
      {/* BARRA SUPERIOR DE CONTROLO DE MOVIMENTO (OPÇÃO DE MOVER A SUB-ABA) */}
      {showMoveHandle && (
        <div 
          className="sub-aba-drag-bar" 
          onMouseDown={handleDragStart}
          onDoubleClick={handleResetPosition}
          title="Clique e arraste para mover"
        >
          <div className="sub-aba-drag-handle-indicator">
            <Move size={14} />
          </div>
          <div className="sub-aba-drag-controls no-drag">
            {onClose && (
              <button
                type="button"
                className="sub-aba-header-close-btn no-drag"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                title="Fechar janela"
                aria-label="Fechar janela"
              >
                <X size={15} strokeWidth={2.5} />
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
