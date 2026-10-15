import fs from 'fs';
import path from 'path';

const vjs = [
  { id: 'vj-junior', name: 'VJ Junior', initials: 'JR', bg: '#00df82', secondary: '#052e16', text: '#ffffff', icon: 'crown' },
  { id: 'vj-jingo', name: 'VJ Jingo', initials: 'JG', bg: '#3b82f6', secondary: '#1e3a8a', text: '#ffffff', icon: 'mic' },
  { id: 'vj-unclet', name: 'VJ Uncle T', initials: 'UT', bg: '#f59e0b', secondary: '#78350f', text: '#ffffff', icon: 'star' },
  { id: 'vj-emmy', name: 'VJ Emmy', initials: 'EM', bg: '#ec4899', secondary: '#831843', text: '#ffffff', icon: 'headphones' },
  { id: 'vj-kevo', name: 'VJ Kevo', initials: 'KV', bg: '#8b5cf6', secondary: '#4c1d95', text: '#ffffff', icon: 'flame' },
  { id: 'vj-icep', name: 'VJ Ice P', initials: 'IP', bg: '#06b6d4', secondary: '#164e63', text: '#ffffff', icon: 'zap' },
  { id: 'vj-mark', name: 'VJ Mark', initials: 'MK', bg: '#ef4444', secondary: '#7f1d1d', text: '#ffffff', icon: 'film' },
  { id: 'vj-omutaka', name: 'VJ Omutaka', initials: 'OM', bg: '#10b981', secondary: '#064e3b', text: '#ffffff', icon: 'sparkles' },
  { id: 'vj-chris', name: 'VJ Chris', initials: 'CH', bg: '#6366f1', secondary: '#312e81', text: '#ffffff', icon: 'tv' },
  { id: 'vj-cox', name: 'VJ Cox', initials: 'CX', bg: '#f97316', secondary: '#7c2d12', text: '#ffffff', icon: 'rocket' },
  { id: 'vj-sultan', name: 'VJ Sultan', initials: 'SL', bg: '#eab308', secondary: '#713f12', text: '#ffffff', icon: 'award' },
  { id: 'vj-sammy', name: 'VJ Sammy', initials: 'SM', bg: '#14b8a6', secondary: '#134e4a', text: '#ffffff', icon: 'disc' },
];

const targetDir = path.resolve('public', 'vjs');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

vjs.forEach((vj) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="grad-${vj.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${vj.bg}"/>
      <stop offset="100%" stop-color="${vj.secondary}"/>
    </linearGradient>
    <filter id="glow-${vj.id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${vj.bg}" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <!-- Outer Ring Badge -->
  <circle cx="50" cy="50" r="48" fill="#121420" stroke="url(#grad-${vj.id})" stroke-width="3"/>
  <circle cx="50" cy="50" r="42" fill="url(#grad-${vj.id})" opacity="0.9"/>
  
  <!-- Studio Headset Silhouette -->
  <path d="M28 50 C28 34 38 22 50 22 C62 22 72 34 72 50" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Left Ear Cup -->
  <rect x="23" y="44" width="9" height="18" rx="4" fill="#ffffff" filter="url(#glow-${vj.id})"/>
  <!-- Right Ear Cup -->
  <rect x="68" y="44" width="9" height="18" rx="4" fill="#ffffff" filter="url(#glow-${vj.id})"/>
  <!-- Microphone Boom -->
  <path d="M30 58 Q40 70 52 68" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  <circle cx="53" cy="68" r="3" fill="#ffffff"/>
  
  <!-- VJ Initials in Center -->
  <text x="50" y="52" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="19" fill="${vj.text}" letter-spacing="-0.5">
    ${vj.initials}
  </text>
  
  <!-- Sub-label VJ Tag -->
  <rect x="33" y="76" width="34" height="14" rx="4" fill="#090a0f" opacity="0.9"/>
  <text x="50" y="86.5" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="9" fill="${vj.bg}">
    VJ
  </text>
</svg>`;

  fs.writeFileSync(path.join(targetDir, `${vj.id}.svg`), svg);
});

console.log('Successfully generated Ugandan VJ avatar icons!');
