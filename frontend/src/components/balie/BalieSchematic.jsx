const schematicParts = [
  { id: 'bowl', label: 'Gleboka misa — 100 cm', desc: 'Idealny rozmiar dla osob wyzszych. Swobodne ruchy i pelne zanurzenie.', x: '15%', y: '20%', lineEnd: { x: '45%', y: '35%' } },
  { id: 'frame', label: 'Metalowy stelaz', desc: 'Zamiast drewna — odporny na wilgoc, korozje i odksztalcenia. Dekady uzytkowania bez konserwacji.', x: '60%', y: '10%', lineEnd: { x: '55%', y: '50%' } },
  { id: 'cladding', label: 'Termodrewno i ukryte mocowania', desc: 'Odpornosc na pekanie i wysychanie. Wystarczy przetrzec lub spluknac.', x: '70%', y: '55%', lineEnd: { x: '65%', y: '60%' } },
  { id: 'stove', label: 'Mocne piece z podwojnym obiegiem', desc: 'Nagrzewanie w 1-2h, nawet przy -20°C. Szybkie i efektywne.', x: '10%', y: '70%', lineEnd: { x: '35%', y: '65%' } },
  { id: 'warranty', label: '10 lat gwarancji + 25 lat trwalosci', desc: 'Nasze balie sa budowane na pokolenia.', x: '60%', y: '85%', lineEnd: { x: '50%', y: '75%' } },
];

export const BalieSchematic = () => (
  <section id="budowa" className="py-20 bg-[#0A0D12]" data-testid="balie-schematic">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Budowa <span className="text-[#D4AF37]">Balii</span>
        </h2>
        <p className="text-white/40 text-sm max-w-2xl mx-auto">
          Kazdy element jest starannie zaprojektowany i wykonany z najwyzszej jakosci materialow
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Schematic image */}
        <div className="relative bg-[#1A1E27] border border-white/5 p-8 aspect-[4/3] flex items-center justify-center">
          {/* SVG schematic cross-section */}
          <svg viewBox="0 0 500 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Base/ground */}
            <rect x="50" y="320" width="400" height="20" rx="2" fill="#2a2a2a" />

            {/* Wooden structure frame */}
            <rect x="80" y="140" width="280" height="180" rx="4" fill="none" stroke="#8B6914" strokeWidth="3" strokeDasharray="8 4" />

            {/* Main tub basin */}
            <path d="M100 180 Q100 300 120 310 L320 310 Q340 300 340 180 Z" fill="#1a3a5c" opacity="0.4" stroke="#4a8ab5" strokeWidth="2" />
            <path d="M100 180 L340 180" stroke="#4a8ab5" strokeWidth="2" />
            {/* Water level */}
            <path d="M105 200 L335 200" stroke="#4a8ab5" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
            <text x="220" y="195" fill="#4a8ab5" fontSize="8" textAnchor="middle" opacity="0.6">~ woda ~</text>

            {/* Depth indicator */}
            <line x1="90" y1="180" x2="90" y2="310" stroke="#D4AF37" strokeWidth="1" />
            <line x1="85" y1="180" x2="95" y2="180" stroke="#D4AF37" strokeWidth="1" />
            <line x1="85" y1="310" x2="95" y2="310" stroke="#D4AF37" strokeWidth="1" />
            <text x="80" y="250" fill="#D4AF37" fontSize="8" textAnchor="middle" transform="rotate(-90 80 250)">100 cm</text>

            {/* Inner wooden panels */}
            {[120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320].map((x, i) => (
              <line key={`panel-${i}`} x1={x} y1="140" x2={x} y2="320" stroke="#6B4D1A" strokeWidth="1.5" opacity="0.3" />
            ))}

            {/* Metal frame beams */}
            <rect x="78" y="138" width="284" height="4" rx="1" fill="#555" />
            <rect x="78" y="316" width="284" height="4" rx="1" fill="#555" />
            <rect x="78" y="138" width="4" height="182" rx="1" fill="#555" />
            <rect x="358" y="138" width="4" height="182" rx="1" fill="#555" />

            {/* Steps */}
            <rect x="345" y="230" width="50" height="15" rx="2" fill="#6B4D1A" stroke="#8B6914" strokeWidth="1" />
            <rect x="345" y="260" width="60" height="15" rx="2" fill="#6B4D1A" stroke="#8B6914" strokeWidth="1" />
            <rect x="345" y="290" width="70" height="15" rx="2" fill="#6B4D1A" stroke="#8B6914" strokeWidth="1" />
            <text x="380" y="325" fill="#8B6914" fontSize="7" textAnchor="middle">schody</text>

            {/* Stove (external) */}
            <rect x="400" y="200" width="50" height="120" rx="4" fill="#333" stroke="#555" strokeWidth="2" />
            <rect x="410" y="260" width="30" height="20" rx="2" fill="#1a1a1a" stroke="#666" strokeWidth="1" />
            {/* Chimney */}
            <rect x="418" y="140" width="14" height="60" rx="1" fill="#444" stroke="#555" strokeWidth="1" />
            <text x="425" y="135" fill="#888" fontSize="7" textAnchor="middle">komin</text>
            {/* Fire glow */}
            <circle cx="425" cy="270" r="6" fill="#D4AF37" opacity="0.4" />
            <text x="425" y="345" fill="#D4AF37" fontSize="8" textAnchor="middle" fontWeight="bold">PIEC</text>

            {/* Water circulation arrows */}
            <path d="M370 250 Q385 250 390 240 Q395 230 400 230" fill="none" stroke="#4a8ab5" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M400 280 Q395 290 385 290 Q375 290 370 280" fill="none" stroke="#e85050" strokeWidth="1.5" markerEnd="url(#arrow-red)" />
            <text x="385" y="220" fill="#4a8ab5" fontSize="6" textAnchor="middle">zimna</text>
            <text x="385" y="305" fill="#e85050" fontSize="6" textAnchor="middle">ciepla</text>

            {/* Arrows */}
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#4a8ab5" /></marker>
              <marker id="arrow-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#e85050" /></marker>
            </defs>

            {/* Insulation layer */}
            <path d="M82 145 L82 315" stroke="#D4AF37" strokeWidth="3" strokeDasharray="2 3" opacity="0.4" />
            <text x="75" y="155" fill="#D4AF37" fontSize="6" textAnchor="end" opacity="0.6">izolacja</text>
          </svg>
        </div>

        {/* Features list */}
        <div className="space-y-4">
          {schematicParts.map((part, i) => (
            <div key={part.id} className="flex gap-4 p-4 bg-[#1A1E27] border border-white/5 hover:border-[#D4AF37]/30 transition-colors" data-testid={`balie-schematic-${part.id}`}>
              <div className="w-8 h-8 bg-[#D4AF37] flex items-center justify-center text-[#0F1218] font-bold text-sm flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">{part.label}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{part.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
