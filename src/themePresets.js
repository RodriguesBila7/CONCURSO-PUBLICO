export const PRESET_THEMES = [
  // Linha 1: Família dos Azuis & Marinhos (7 cores)
  { id: 'navy-classic', name: 'Azul Clássico', hex: '#1e3a5f' },
  { id: 'dark-navy', name: 'Azul Meia-Noite', hex: '#0f2240' },
  { id: 'royal-blue', name: 'Azul Real', hex: '#1976d2' },
  { id: 'azure', name: 'Azul Oceano', hex: '#0078d4' },
  { id: 'cobalt', name: 'Azul Cobalto', hex: '#0d47a1' },
  { id: 'deep-sea', name: 'Azul Safira', hex: '#0369a1' },
  { id: 'cyan-night', name: 'Ciano Noturno', hex: '#0e7490' },
  
  // Linha 2: Família dos Verdes & Esmeraldas (7 cores)
  { id: 'forest-green', name: 'Verde Floresta', hex: '#1b5e20' },
  { id: 'teal-green', name: 'Verde Petróleo', hex: '#00695c' },
  { id: 'olive-green', name: 'Verde Militar', hex: '#33691e' },
  { id: 'pine', name: 'Verde Esmeralda', hex: '#004d40' },
  { id: 'malachite', name: 'Verde Bandeira', hex: '#059669' },
  { id: 'jade-night', name: 'Verde Jade', hex: '#064e3b' },
  { id: 'moss-dark', name: 'Verde Musgo Escuro', hex: '#285238' },
  
  // Linha 3: Família dos Vermelhos, Carmesins & Vinho (7 cores)
  { id: 'sernic-red', name: 'Vermelho SERNIC (Oficial)', hex: '#c32026' },
  { id: 'crimson', name: 'Carmesim', hex: '#b71c1c' },
  { id: 'scarlet-ruby', name: 'Rubi Escarlate', hex: '#991b1b' },
  { id: 'burgundy', name: 'Borgonha Imperial', hex: '#7f1d1d' },
  { id: 'plum', name: 'Vinho / Ameixa', hex: '#880e4f' },
  { id: 'dark-raspberry', name: 'Framboesa Escura', hex: '#9d174d' },
  { id: 'cherry-night', name: 'Cereja Noturna', hex: '#be123c' },
  
  // Linha 4: Família dos Púrpuras, Violetas & Índigos (7 cores)
  { id: 'indigo', name: 'Índigo Profundo', hex: '#4a148c' },
  { id: 'purple', name: 'Púrpura Imperial', hex: '#7b1fa2' },
  { id: 'violet-royal', name: 'Violeta Real', hex: '#6d28d9' },
  { id: 'grape-dark', name: 'Uva Intensa', hex: '#581c87' },
  { id: 'amethyst', name: 'Ametista Nobre', hex: '#7e22ce' },
  { id: 'magenta-deep', name: 'Magenta Profundo', hex: '#831843' },
  { id: 'cardinal-purple', name: 'Púrpura Cardeal', hex: '#4c1d95' },
  
  // Linha 5: Família dos Âmbares, Terracotas & Dourados (7 cores)
  { id: 'rust', name: 'Terracota Queimado', hex: '#bf360c' },
  { id: 'amber', name: 'Âmbar Dourado', hex: '#e65100' },
  { id: 'copper-orange', name: 'Laranja Cobre', hex: '#c2410c' },
  { id: 'sernic-gold', name: 'Ouro SERNIC / Bronze', hex: '#d97706' },
  { id: 'warm-mustard', name: 'Mostarda Nobre', hex: '#b45309' },
  { id: 'royal-brown', name: 'Chocolate Real', hex: '#54382c' },
  { id: 'deep-caramel', name: 'Caramelo Intenso', hex: '#92400e' },
  
  // Linha 6: Família dos Grafites, Ardósias & Titânio (7 cores)
  { id: 'carbon', name: 'Preto Grafite', hex: '#1f242b' },
  { id: 'slate', name: 'Ardósia / Carvão', hex: '#37474f' },
  { id: 'midnight-lead', name: 'Chumbo Noturno', hex: '#1e293b' },
  { id: 'tempered-steel', name: 'Aço Temperado', hex: '#334155' },
  { id: 'titanium-ebony', name: 'Ébano Titânio', hex: '#0f172a' },
  { id: 'military-grey', name: 'Cinza Militar', hex: '#475569' },
  { id: 'onyx-black', name: 'Preto Ónix', hex: '#18181b' },
];

export const RANDOM_COLOR_PALETTE = PRESET_THEMES.map(theme => theme.hex);
