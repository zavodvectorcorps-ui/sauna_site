import { useState, useEffect } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

const defaultParts = [
  { id: 'bowl', label: 'Głęboka misa — 100 cm', desc: 'Idealny rozmiar dla osób wyższych. Swobodne ruchy i pełne zanurzenie.' },
  { id: 'frame', label: 'Metalowy stelaż', desc: 'Zamiast drewna — odporny na wilgoć, korozję i odkształcenia. Dekady użytkowania bez konserwacji.' },
  { id: 'cladding', label: 'Termodrewno i ukryte mocowania', desc: 'Odporność na pękanie i wysychanie. Wystarczy przetrzeć lub spłukać.' },
  { id: 'stove', label: 'Mocne piece z podwójnym obiegiem', desc: 'Nagrzewanie w 1-2h, nawet przy -20°C. Szybkie i efektywne.' },
  { id: 'warranty', label: '10 lat gwarancji + 25 lat trwałości', desc: 'Nasze balie są budowane na pokolenia.' },
];

const SvgDiagram = () => (
  <svg viewBox="0 0 500 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <rect x="50" y="320" width="400" height="20" rx="2" fill="#2a2a2a" />
    <rect x="80" y="140" width="280" height="180" rx="4" fill="none" stroke="#8B6914" strokeWidth="3" strokeDasharray="8 4" />
    <path d="M100 180 Q100 300 120 310 L320 310 Q340 300 340 180 Z" fill="#1a3a5c" opacity="0.4" stroke="#4a8ab5" strokeWidth="2" />
    <path d="M100 180 L340 180" stroke="#4a8ab5" strokeWidth="2" />
    <path d="M105 200 L335 200" stroke="#4a8ab5" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
    <text x="220" y="195" fill="#4a8ab5" fontSize="8" textAnchor="middle" opacity="0.6">~ woda ~</text>
    <line x1="90" y1="180" x2="90" y2="310" stroke="#D4AF37" strokeWidth="1" />
    <line x1="85" y1="180" x2="95" y2="180" stroke="#D4AF37" strokeWidth="1" />
    <line x1="85" y1="310" x2="95" y2="310" stroke="#D4AF37" strokeWidth="1" />
    <text x="80" y="250" fill="#D4AF37" fontSize="8" textAnchor="middle" transform="rotate(-90 80 250)">100 cm</text>
    {[120,140,160,180,200,220,240,260,280,300,320].map((x,i) => (
      <line key={i} x1={x} y1="140" x2={x} y2="320" stroke="#6B4D1A" strokeWidth="1.5" opacity="0.3" />
    ))}
    <rect x="78" y="138" width="284" height="4" rx="1" fill="#555" />
    <rect x="78" y="316" width="284" height="4" rx="1" fill="#555" />
    <rect x="78" y="138" width="4" height="182" rx="1" fill="#555" />
    <rect x="358" y="138" width="4" height="182" rx="1" fill="#555" />
    <rect x="345" y="230" width="50" height="15" rx="2" fill="#6B4D1A" stroke="#8B6914" strokeWidth="1" />
    <rect x="345" y="260" width="60" height="15" rx="2" fill="#6B4D1A" stroke="#8B6914" strokeWidth="1" />
    <rect x="345" y="290" width="70" height="15" rx="2" fill="#6B4D1A" stroke="#8B6914" strokeWidth="1" />
    <text x="380" y="325" fill="#8B6914" fontSize="7" textAnchor="middle">schody</text>
    <rect x="400" y="200" width="50" height="120" rx="4" fill="#333" stroke="#555" strokeWidth="2" />
    <rect x="410" y="260" width="30" height="20" rx="2" fill="#1a1a1a" stroke="#666" strokeWidth="1" />
    <rect x="418" y="140" width="14" height="60" rx="1" fill="#444" stroke="#555" strokeWidth="1" />
    <text x="425" y="135" fill="#888" fontSize="7" textAnchor="middle">komin</text>
    <circle cx="425" cy="270" r="6" fill="#D4AF37" opacity="0.4" />
    <text x="425" y="345" fill="#D4AF37" fontSize="8" textAnchor="middle" fontWeight="bold">PIEC</text>
    <defs>
      <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#4a8ab5" /></marker>
      <marker id="arr-r" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#e85050" /></marker>
    </defs>
  </svg>
);

const MinimalSvg = () => (
  <svg viewBox="0 0 500 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Minimal clean style */}
    <rect x="80" y="130" width="250" height="200" rx="20" fill="none" stroke="#D4AF37" strokeWidth="2" />
    <ellipse cx="205" cy="180" rx="100" ry="10" fill="#D4AF37" opacity="0.15" />
    <text x="205" y="185" fill="#D4AF37" fontSize="9" textAnchor="middle" opacity="0.6">woda</text>
    {/* Water fill */}
    <rect x="82" y="180" width="246" height="148" rx="18" fill="#1a3a5c" opacity="0.25" />
    {/* Dimension line */}
    <line x1="60" y1="135" x2="60" y2="325" stroke="white" strokeWidth="0.5" opacity="0.3" />
    <text x="50" y="240" fill="white" fontSize="9" textAnchor="middle" transform="rotate(-90 50 240)" opacity="0.4">100 cm</text>
    {/* Cladding lines */}
    <rect x="78" y="128" width="254" height="4" rx="2" fill="#D4AF37" opacity="0.3" />
    <rect x="78" y="328" width="254" height="4" rx="2" fill="#D4AF37" opacity="0.3" />
    {/* Steps */}
    {[0,1,2].map(i => <rect key={i} x={335 + i*15} y={250 + i*25} width={40 - i*5} height="8" rx="2" fill="#D4AF37" opacity={0.15 + i*0.05} />)}
    <text x="370" y="335" fill="white" fontSize="7" textAnchor="middle" opacity="0.3">schody</text>
    {/* Stove */}
    <circle cx="420" cy="260" r="35" fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.6" />
    <circle cx="420" cy="260" r="12" fill="#D4AF37" opacity="0.2" />
    <text x="420" y="264" fill="#D4AF37" fontSize="8" textAnchor="middle" fontWeight="bold">P</text>
    <text x="420" y="310" fill="white" fontSize="7" textAnchor="middle" opacity="0.4">piec</text>
    {/* Chimney */}
    <line x1="420" y1="225" x2="420" y2="150" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
    <circle cx="420" cy="145" r="5" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
    {/* Frame label */}
    <rect x="80" y="360" width="340" height="20" rx="3" fill="#D4AF37" opacity="0.08" />
    <text x="250" y="374" fill="white" fontSize="8" textAnchor="middle" opacity="0.3">Metalowy stelaz + termodrewno</text>
  </svg>
);

const BlueprintSvg = () => (
  <svg viewBox="0 0 500 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Blueprint/technical drawing style */}
    <rect x="0" y="0" width="500" height="400" fill="#0a1628" />
    {/* Grid */}
    {Array.from({length: 25}, (_, i) => <line key={`h${i}`} x1="0" y1={i*16} x2="500" y2={i*16} stroke="#1a3050" strokeWidth="0.5" />)}
    {Array.from({length: 31}, (_, i) => <line key={`v${i}`} x1={i*16} y1="0" x2={i*16} y2="400" stroke="#1a3050" strokeWidth="0.5" />)}
    {/* Tub cross-section */}
    <path d="M80 150 L80 300 Q80 320 100 320 L340 320 Q360 320 360 300 L360 150" fill="none" stroke="#4a9eff" strokeWidth="1.5" />
    <line x1="80" y1="150" x2="360" y2="150" stroke="#4a9eff" strokeWidth="1.5" strokeDasharray="6 3" />
    {/* Water level */}
    <path d="M82 190 L358 190" stroke="#4a9eff" strokeWidth="0.8" strokeDasharray="3 2" />
    <text x="220" y="185" fill="#4a9eff" fontSize="7" textAnchor="middle" opacity="0.6">poziom wody</text>
    {/* Dimension arrows */}
    <line x1="45" y1="150" x2="45" y2="320" stroke="#ff6b35" strokeWidth="0.8" />
    <polygon points="42,153 48,153 45,145" fill="#ff6b35" />
    <polygon points="42,317 48,317 45,325" fill="#ff6b35" />
    <text x="35" y="240" fill="#ff6b35" fontSize="8" textAnchor="middle" transform="rotate(-90 35 240)">1000 mm</text>
    <line x1="80" y1="345" x2="360" y2="345" stroke="#ff6b35" strokeWidth="0.8" />
    <polygon points="83,342 83,348 75,345" fill="#ff6b35" />
    <polygon points="357,342 357,348 365,345" fill="#ff6b35" />
    <text x="220" y="358" fill="#ff6b35" fontSize="8" textAnchor="middle">2250 mm</text>
    {/* Frame corners */}
    {[[78,148],[78,322],[362,148],[362,322]].map(([x,y], i) => (
      <g key={i}><line x1={x-5} y1={y} x2={x+5} y2={y} stroke="#4a9eff" strokeWidth="0.5" /><line x1={x} y1={y-5} x2={x} y2={y+5} stroke="#4a9eff" strokeWidth="0.5" /></g>
    ))}
    {/* Stove box */}
    <rect x="380" y="180" width="60" height="140" rx="2" fill="none" stroke="#ff6b35" strokeWidth="1.5" />
    <line x1="380" y1="240" x2="440" y2="240" stroke="#ff6b35" strokeWidth="0.5" strokeDasharray="3 2" />
    <text x="410" y="210" fill="#ff6b35" fontSize="8" textAnchor="middle">PIEC</text>
    <text x="410" y="225" fill="#ff6b35" fontSize="7" textAnchor="middle" opacity="0.6">V4A</text>
    {/* Chimney */}
    <rect x="402" y="100" width="16" height="80" fill="none" stroke="#ff6b35" strokeWidth="1" strokeDasharray="4 2" />
    <text x="410" y="95" fill="#ff6b35" fontSize="6" textAnchor="middle">komin</text>
    {/* Pipes */}
    <path d="M360 220 L378 220" stroke="#4a9eff" strokeWidth="1.5" />
    <path d="M360 260 L378 260" stroke="#ff6b35" strokeWidth="1.5" />
    <text x="368" y="215" fill="#4a9eff" fontSize="5" textAnchor="middle">zimna</text>
    <text x="368" y="275" fill="#ff6b35" fontSize="5" textAnchor="middle">ciepła</text>
    {/* Title block */}
    <rect x="310" y="370" width="180" height="25" fill="none" stroke="#4a9eff" strokeWidth="0.5" />
    <text x="400" y="386" fill="#4a9eff" fontSize="8" textAnchor="middle" opacity="0.7">WM-BALIA — Przekroj</text>
  </svg>
);

const svgComponents = { default: SvgDiagram, minimal: MinimalSvg, blueprint: BlueprintSvg };

export const BalieSchematic = () => {
  const [title, setTitle] = useState('Budowa Balii');
  const [subtitle, setSubtitle] = useState('Każdy element jest starannie zaprojektowany i wykonany z najwyższej jakości materiałów');
  const [parts, setParts] = useState(defaultParts);
  const [image, setImage] = useState(null);
  const [svgStyle, setSvgStyle] = useState('default');

  useEffect(() => {
    fetch(`${API}/api/balia/content`).then(r => r.json()).then(data => {
      if (data?.schematic) {
        if (data.schematic.title) setTitle(data.schematic.title);
        if (data.schematic.subtitle) setSubtitle(data.schematic.subtitle);
        if (data.schematic.parts?.length) setParts(data.schematic.parts);
        if (data.schematic.image) setImage(data.schematic.image);
        if (data.schematic.svg_style) setSvgStyle(data.schematic.svg_style);
      }
    }).catch(() => {});
  }, []);

  return (
    <section id="budowa" className="py-20 bg-[#0A0D12]" data-testid="balie-schematic">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-[#D4AF37]">{title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-white/40 text-sm max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative bg-[#1A1E27] border border-white/5 p-4 aspect-[4/3] flex items-center justify-center overflow-hidden">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-contain" />
            ) : (
              (() => { const Svg = svgComponents[svgStyle] || SvgDiagram; return <Svg />; })()
            )}
          </div>

          <div className="space-y-4">
            {parts.map((part, i) => (
              <div key={part.id || i} className="flex gap-4 p-4 bg-[#1A1E27] border border-white/5 hover:border-[#D4AF37]/30 transition-colors" data-testid={`balie-schematic-${part.id}`}>
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
};
