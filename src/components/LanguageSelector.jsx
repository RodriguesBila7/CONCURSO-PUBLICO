import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function LanguageSelector({ currentLang, onSelectLang }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const altLang = currentLang === 'pt' ? 'en' : 'pt';
  const altLabel = currentLang === 'pt' ? 'EN' : 'PT';
  const currentLabel = currentLang === 'pt' ? 'PT' : 'EN';

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        type="button"
        className="top-control-btn pill"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Seleccionar Idioma / Select Language"
        title="Idioma"
      >
        <span>{currentLabel}</span>
        <ChevronDown size={15} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div className="popover-dropdown lang-dropdown">
          <button
            type="button"
            className="lang-option-btn"
            onClick={() => {
              onSelectLang(altLang);
              setIsOpen(false);
            }}
          >
            {altLabel}
          </button>
        </div>
      )}
    </div>
  );
}
