import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeModeButton({ mode, onToggleMode, t }) {
  // Determine icon to render
  const renderIcon = () => {
    if (mode === 'dark') {
      return <Moon size={20} strokeWidth={2.2} />;
    }
    if (mode === 'light') {
      return <Sun size={20} strokeWidth={2.2} />;
    }
    // Default theme (split circle icon matching Image 1 & 2)
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
      </svg>
    );
  };

  const getTitle = () => {
    if (mode === 'default_red') return t.theme_default;
    if (mode === 'dark') return t.theme_dark;
    return t.theme_light;
  };

  return (
    <button
      type="button"
      className="top-control-btn circle"
      onClick={onToggleMode}
      title={getTitle()}
      aria-label={getTitle()}
    >
      {renderIcon()}
    </button>
  );
}
