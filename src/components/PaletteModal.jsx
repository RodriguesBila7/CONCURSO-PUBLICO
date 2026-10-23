import React, { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { PRESET_THEMES } from '../themePresets';

export default function PaletteModal({
  currentColor,
  onSelectColor,
  isRandomActive,
  onToggleRandom,
  onRollDice,
  t
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const colorInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomColorChange = (e) => {
    onSelectColor(e.target.value);
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        type="button"
        className="top-control-btn circle"
        onClick={() => setIsOpen(!isOpen)}
        title="Paleta de Cores"
        aria-label="Paleta de Cores"
      >
        <Palette size={20} strokeWidth={2.2} />
      </button>

      {isOpen && (
        <div className="popover-dropdown palette-popover">
          <div className="palette-section-title">
            {t.preset_themes}
          </div>

          <div className="palette-grid">
            {PRESET_THEMES.map((theme) => {
              const isSelected = currentColor.toLowerCase() === theme.hex.toLowerCase();
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`color-swatch-circle ${isSelected ? 'active' : ''}`}
                  style={{ backgroundColor: theme.hex }}
                  onClick={() => onSelectColor(theme.hex)}
                  title={theme.name}
                  aria-label={theme.name}
                />
              );
            })}
          </div>

          <hr className="palette-divider" />

          <div className="palette-section-title">
            {t.custom_color}
          </div>

          <div className="custom-color-row">
            <div
              className="custom-color-preview-box"
              style={{ backgroundColor: currentColor }}
              onClick={() => colorInputRef.current && colorInputRef.current.click()}
              title="Clique para escolher uma cor personalizada"
            >
              <input
                ref={colorInputRef}
                type="color"
                value={currentColor}
                onChange={handleCustomColorChange}
              />
            </div>
            <span
              className="custom-color-label"
              onClick={() => colorInputRef.current && colorInputRef.current.click()}
            >
              {t.choose_color}
            </span>
          </div>

          <hr className="palette-divider" />

          <div className="random-colors-row">
            <div
              className={`random-colors-info ${isRandomActive ? 'random-active' : ''}`}
              onClick={onRollDice}
              title="Cores aleatórias (troca a cada 7 segundos) - Clique para sortear agora"
            >
              <span className="dice-icon-wrapper" role="img" aria-label="dados">
                🎲
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                <span>{t.random_colors}</span>
                <span style={{ fontSize: '0.7rem', color: isRandomActive ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                  {isRandomActive ? 'A trocar a cada 7s' : 'Troca a cada 7s'}
                </span>
              </div>
            </div>

            <label className="switch-control" title="Activar/Desactivar Cores Aleatórias (a cada 7s)">
              <input
                type="checkbox"
                checked={isRandomActive}
                onChange={(e) => onToggleRandom(e.target.checked)}
              />
              <span className="switch-slider" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
