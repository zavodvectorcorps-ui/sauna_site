import { useState, useEffect } from 'react';
import { Flame, ArrowRight } from 'lucide-react';
import { useBalieData } from '../../context/BalieContext';
import { resolveMediaUrl } from '../../lib/utils';

const defaultStoveTypes = [
  {
    id: 'internal',
    title: 'Piec wewnętrzny',
    subtitle: 'Zintegrowany w balii',
    image: null,
    features: ['Montaż wewnątrz misy balii','Bezpośredni kontakt z wodą — szybsze nagrzewanie','Kompaktowa konstrukcja','Idealny dla mniejszych przestrzeni'],
    pros: ['Szybsze nagrzewanie','Mniej miejsca na zewnątrz'],
    cons: ['Mniejsza przestrzen kapielowa'],
  },
  {
    id: 'external',
    title: 'Piec zewnętrzny',
    subtitle: 'Z podwójnym obiegiem wody',
    image: null,
    features: ['Montaż poza misą balii','Podwójny obieg: zimna woda do pieca, ciepła z powrotem','Pełna przestrzeń kąpielowa','Łatwiejszy dostęp do palenia'],
    pros: ['Wieksza przestrzen w balii','Wygodniejsze dolozenie drewna'],
    cons: ['Wymaga więcej miejsca na zewnątrz'],
  },
];

const ExternalSvg = () => (
  <svg viewBox="0 0 500 350" className="w-full h-full max-h-[350px]" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="500" height="350" fill="#111620" rx="4" />
    <path d="M60 100 Q60 250 80 260 L280 260 Q300 250 300 100 Z" fill="#1a3a5c" opacity="0.5" stroke="#5ba8d5" strokeWidth="2" />
    <path d="M60 100 L300 100" stroke="#5ba8d5" strokeWidth="2" />
    <text x="180" y="90" fill="#5ba8d5" fontSize="10" textAnchor="middle">Balia</text>
    {[120,140,160,180,200,220,240].map(y => (
      <path key={y} d={`M65 ${y} Q120 ${y-3} 180 ${y} Q240 ${y+3} 295 ${y}`} fill="none" stroke="#5ba8d5" strokeWidth="0.5" opacity="0.2" />
    ))}
    <rect x="350" y="100" width="80" height="160" rx="6" fill="#444" stroke="#D4AF37" strokeWidth="2" />
    <text x="390" y="130" fill="#D4AF37" fontSize="11" textAnchor="middle" fontWeight="bold">PIEC</text>
    <text x="390" y="145" fill="#D4AF37" fontSize="8" textAnchor="middle">V4A</text>
    <rect x="365" y="190" width="50" height="35" rx="3" fill="#222" />
    <path d="M380 220 Q385 200 390 210 Q395 195 400 215" stroke="#D4AF37" strokeWidth="2" fill="none" />
    <circle cx="390" cy="207" r="8" fill="#D4AF37" opacity="0.3" />
    <rect x="382" y="40" width="16" height="60" rx="2" fill="#555" stroke="#666" strokeWidth="1" />
    <text x="390" y="32" fill="#888" fontSize="8" textAnchor="middle">komin</text>
    <path d="M300 200 L330 200 Q345 200 345 190 L345 170 Q345 160 355 160 L350 160" fill="none" stroke="#5ba8d5" strokeWidth="3" />
    <polygon points="347,155 353,160 347,165" fill="#5ba8d5" />
    <text x="325" y="215" fill="#5ba8d5" fontSize="9" fontWeight="bold">zimna woda</text>
    <path d="M350 130 L340 130 Q325 130 325 140 L325 150 Q325 160 315 160 L300 160" fill="none" stroke="#e85050" strokeWidth="3" />
    <polygon points="303,155 297,160 303,165" fill="#e85050" />
    <text x="325" y="120" fill="#e85050" fontSize="9" fontWeight="bold">ciepła woda</text>
    <text x="180" y="290" fill="white" fontSize="10" textAnchor="middle" opacity="0.5">Podwójny obieg wody</text>
    <text x="180" y="305" fill="white" fontSize="8" textAnchor="middle" opacity="0.3">Nagrzewanie 1-2h nawet przy -20°C</text>
  </svg>
);

const InternalSvg = () => (
  <svg viewBox="0 0 500 350" className="w-full h-full max-h-[350px]" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="500" height="350" fill="#111620" rx="4" />
    <path d="M60 100 Q60 250 80 260 L380 260 Q400 250 400 100 Z" fill="#1a3a5c" opacity="0.5" stroke="#5ba8d5" strokeWidth="2" />
    <path d="M60 100 L400 100" stroke="#5ba8d5" strokeWidth="2" />
    <text x="180" y="90" fill="#5ba8d5" fontSize="10" textAnchor="middle">Balia</text>
    {[120,140,160,180,200,220,240].map(y => (
      <path key={y} d={`M65 ${y} Q165 ${y-3} 260 ${y} Q340 ${y+3} 395 ${y}`} fill="none" stroke="#5ba8d5" strokeWidth="0.5" opacity="0.2" />
    ))}
    <rect x="310" y="110" width="60" height="140" rx="4" fill="#444" stroke="#D4AF37" strokeWidth="2" />
    <text x="340" y="135" fill="#D4AF37" fontSize="10" textAnchor="middle" fontWeight="bold">PIEC</text>
    <rect x="320" y="190" width="40" height="30" rx="2" fill="#222" />
    <path d="M332 216 Q337 198 340 208 Q343 195 348 212" stroke="#D4AF37" strokeWidth="2" fill="none" />
    <rect x="333" y="40" width="14" height="60" rx="2" fill="#555" stroke="#666" strokeWidth="1" />
    <text x="340" y="32" fill="#999" fontSize="8" textAnchor="middle">komin</text>
    <rect x="295" y="108" width="4" height="155" rx="1" fill="#777" />
    {[120,145,170,195,220,245].map(y => (
      <rect key={y} x="296" y={y} width="12" height="2" rx="0.5" fill="#666" />
    ))}
    <text x="290" y="280" fill="#999" fontSize="7" textAnchor="middle">ogrodzenie</text>
    {[140,170,200,230].map(y => (
      <g key={y}>
        <path d={`M310 ${y} L280 ${y}`} stroke="#e85050" strokeWidth="1.5" opacity="0.5" strokeDasharray="4 2" />
        <polygon points={`283,${y-3} 277,${y} 283,${y+3}`} fill="#e85050" opacity="0.5" />
      </g>
    ))}
    <text x="250" y="175" fill="#e85050" fontSize="9" fontWeight="bold" opacity="0.7">cieplo</text>
    <text x="170" y="190" fill="white" fontSize="10" textAnchor="middle" opacity="0.4">strefa kapielowa</text>
    <text x="230" y="290" fill="white" fontSize="10" textAnchor="middle" opacity="0.5">Bezposredni kontakt z woda</text>
    <text x="230" y="305" fill="white" fontSize="8" textAnchor="middle" opacity="0.3">Szybsze nagrzewanie, kompaktowa budowa</text>
  </svg>
);

// Minimal style SVGs
const ExternalMinimalSvg = () => (
  <svg viewBox="0 0 500 350" className="w-full h-full max-h-[350px]" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="500" height="350" fill="#111620" rx="4" />
    <ellipse cx="200" cy="180" rx="120" ry="70" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
    <ellipse cx="200" cy="180" rx="120" ry="10" fill="#D4AF37" opacity="0.1" />
    <text x="200" y="185" fill="white" fontSize="10" textAnchor="middle" opacity="0.4">balia</text>
    {/* External stove circle */}
    <circle cx="390" cy="180" r="40" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
    <circle cx="390" cy="180" r="15" fill="#D4AF37" opacity="0.2" />
    <text x="390" y="184" fill="#D4AF37" fontSize="9" textAnchor="middle" fontWeight="bold">P</text>
    <text x="390" y="235" fill="white" fontSize="8" textAnchor="middle" opacity="0.4">piec zewnętrzny</text>
    {/* Connection pipes */}
    <path d="M320 165 L350 165" stroke="#5ba8d5" strokeWidth="2" />
    <path d="M320 195 L350 195" stroke="#e85050" strokeWidth="2" />
    <circle cx="335" cy="165" r="2" fill="#5ba8d5" />
    <circle cx="335" cy="195" r="2" fill="#e85050" />
    <text x="335" y="158" fill="#5ba8d5" fontSize="7" textAnchor="middle">zimna</text>
    <text x="335" y="212" fill="#e85050" fontSize="7" textAnchor="middle">ciepła</text>
    {/* Chimney line */}
    <line x1="390" y1="140" x2="390" y2="90" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
    <circle cx="390" cy="85" r="5" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
    <text x="250" y="300" fill="white" fontSize="10" textAnchor="middle" opacity="0.3">Podwójny obieg wody</text>
  </svg>
);

const InternalMinimalSvg = () => (
  <svg viewBox="0 0 500 350" className="w-full h-full max-h-[350px]" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="500" height="350" fill="#111620" rx="4" />
    <ellipse cx="250" cy="180" rx="150" ry="80" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
    <ellipse cx="250" cy="180" rx="150" ry="10" fill="#D4AF37" opacity="0.1" />
    <text x="180" y="185" fill="white" fontSize="10" textAnchor="middle" opacity="0.4">balia</text>
    {/* Internal stove */}
    <rect x="320" y="140" width="40" height="70" rx="4" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
    <text x="340" y="180" fill="#D4AF37" fontSize="8" textAnchor="middle" fontWeight="bold">PIEC</text>
    {/* Fence */}
    <line x1="310" y1="130" x2="310" y2="220" stroke="white" strokeWidth="1" opacity="0.3" strokeDasharray="4 3" />
    <text x="305" y="240" fill="white" fontSize="7" textAnchor="middle" opacity="0.3">ogrodzenie</text>
    {/* Heat waves */}
    {[155,170,185,200].map(y => (
      <path key={y} d={`M318 ${y} Q300 ${y} 290 ${y}`} stroke="#e85050" strokeWidth="1" opacity="0.4" strokeDasharray="3 2" />
    ))}
    <text x="270" y="165" fill="#e85050" fontSize="7" textAnchor="middle" opacity="0.6">cieplo</text>
    {/* Chimney */}
    <line x1="340" y1="140" x2="340" y2="90" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
    <circle cx="340" cy="85" r="5" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
    <text x="250" y="300" fill="white" fontSize="10" textAnchor="middle" opacity="0.3">Bezposredni kontakt z woda</text>
  </svg>
);

// Detailed/technical style SVGs
const ExternalDetailedSvg = () => (
  <svg viewBox="0 0 500 350" className="w-full h-full max-h-[350px]" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="500" height="350" fill="#0a1628" />
    {Array.from({length: 22}, (_, i) => <line key={`h${i}`} x1="0" y1={i*16} x2="500" y2={i*16} stroke="#1a3050" strokeWidth="0.5" />)}
    {Array.from({length: 31}, (_, i) => <line key={`v${i}`} x1={i*16} y1="0" x2={i*16} y2="350" stroke="#1a3050" strokeWidth="0.5" />)}
    {/* Tub */}
    <path d="M60 100 Q60 250 80 260 L280 260 Q300 250 300 100" fill="none" stroke="#4a9eff" strokeWidth="1.5" />
    <line x1="60" y1="100" x2="300" y2="100" stroke="#4a9eff" strokeWidth="1" strokeDasharray="6 3" />
    <text x="180" y="95" fill="#4a9eff" fontSize="8" textAnchor="middle">balia — przekroj</text>
    {/* Stove */}
    <rect x="340" y="100" width="80" height="160" rx="4" fill="none" stroke="#ff6b35" strokeWidth="1.5" />
    <text x="380" y="130" fill="#ff6b35" fontSize="9" textAnchor="middle" fontWeight="bold">PIEC V4A</text>
    <rect x="355" y="195" width="50" height="30" fill="none" stroke="#ff6b35" strokeWidth="1" strokeDasharray="3 2" />
    <text x="380" y="214" fill="#ff6b35" fontSize="7" textAnchor="middle">palenisko</text>
    {/* Pipes with labels */}
    <path d="M300 175 L340 175" stroke="#4a9eff" strokeWidth="2.5" />
    <text x="320" y="168" fill="#4a9eff" fontSize="7" textAnchor="middle">IN (zimna)</text>
    <path d="M340 135 L300 135" stroke="#ff6b35" strokeWidth="2.5" />
    <text x="320" y="128" fill="#ff6b35" fontSize="7" textAnchor="middle">OUT (ciepła)</text>
    {/* Chimney */}
    <rect x="372" y="40" width="16" height="60" fill="none" stroke="#ff6b35" strokeWidth="1" strokeDasharray="4 2" />
    <text x="380" y="35" fill="#ff6b35" fontSize="6" textAnchor="middle">komin</text>
    {/* Dimension */}
    <line x1="40" y1="100" x2="40" y2="260" stroke="#ff6b35" strokeWidth="0.8" />
    <text x="30" y="185" fill="#ff6b35" fontSize="7" textAnchor="middle" transform="rotate(-90 30 185)">1000mm</text>
    <text x="250" y="300" fill="#4a9eff" fontSize="9" textAnchor="middle" opacity="0.5">System podwójnego obiegu</text>
  </svg>
);

const InternalDetailedSvg = () => (
  <svg viewBox="0 0 500 350" className="w-full h-full max-h-[350px]" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="500" height="350" fill="#0a1628" />
    {Array.from({length: 22}, (_, i) => <line key={`h${i}`} x1="0" y1={i*16} x2="500" y2={i*16} stroke="#1a3050" strokeWidth="0.5" />)}
    {Array.from({length: 31}, (_, i) => <line key={`v${i}`} x1={i*16} y1="0" x2={i*16} y2="350" stroke="#1a3050" strokeWidth="0.5" />)}
    {/* Wider tub */}
    <path d="M60 100 Q60 250 80 260 L380 260 Q400 250 400 100" fill="none" stroke="#4a9eff" strokeWidth="1.5" />
    <line x1="60" y1="100" x2="400" y2="100" stroke="#4a9eff" strokeWidth="1" strokeDasharray="6 3" />
    <text x="180" y="95" fill="#4a9eff" fontSize="8" textAnchor="middle">balia — przekroj</text>
    {/* Internal stove */}
    <rect x="310" y="110" width="60" height="140" rx="3" fill="none" stroke="#ff6b35" strokeWidth="1.5" />
    <text x="340" y="135" fill="#ff6b35" fontSize="8" textAnchor="middle" fontWeight="bold">PIEC</text>
    {/* Fence */}
    <line x1="300" y1="108" x2="300" y2="255" stroke="#4a9eff" strokeWidth="1" strokeDasharray="3 2" />
    <text x="295" y="270" fill="#4a9eff" fontSize="6" textAnchor="end">ogrodzenie</text>
    {/* Heat arrows */}
    {[140,165,190,215,240].map(y => (
      <path key={y} d={`M308 ${y} L280 ${y}`} stroke="#ff6b35" strokeWidth="1" opacity="0.6" markerEnd="url(#arrD)" />
    ))}
    <text x="270" y="175" fill="#ff6b35" fontSize="7" textAnchor="end" opacity="0.7">cieplo</text>
    {/* Chimney */}
    <rect x="333" y="40" width="14" height="60" fill="none" stroke="#ff6b35" strokeWidth="1" strokeDasharray="4 2" />
    <text x="340" y="35" fill="#ff6b35" fontSize="6" textAnchor="middle">komin</text>
    <text x="160" y="190" fill="#4a9eff" fontSize="9" textAnchor="middle" opacity="0.4">strefa kapieli</text>
    <text x="230" y="300" fill="#4a9eff" fontSize="9" textAnchor="middle" opacity="0.5">Bezposredni kontakt z woda</text>
    <defs><marker id="arrD" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#ff6b35" opacity="0.6" /></marker></defs>
  </svg>
);

const stoveSvgs = {
  external: { default: ExternalSvg, minimal: ExternalMinimalSvg, detailed: ExternalDetailedSvg },
  internal: { default: InternalSvg, minimal: InternalMinimalSvg, detailed: InternalDetailedSvg },
};

export const BalieStoveScheme = () => {
  const [activeStove, setActiveStove] = useState('external');
  const [stoveTypes, setStoveTypes] = useState(defaultStoveTypes);
  const [sectionTitle, setSectionTitle] = useState('Jak dziala piec?');
  const [sectionSubtitle, setSectionSubtitle] = useState('Oferujemy dwa typy piecow na drewno ze stali nierdzewnej V4A. Kazdy nagrzeje wode w 1-2 godziny, nawet przy -20°C.');
  const { data: balieData } = useBalieData();

  useEffect(() => {
    if (!balieData?.content?.stove_scheme) return;
    const ss = balieData.content.stove_scheme;
    if (ss.title) setSectionTitle(ss.title);
    if (ss.subtitle) setSectionSubtitle(ss.subtitle);
    if (ss.types?.length) {
      setStoveTypes(prev => ss.types.map((t, i) => ({
        ...prev[i],
        ...t,
        image: t.image ? resolveMediaUrl(t.image) : prev[i]?.image
      })));
    }
  }, [balieData]);

  const active = stoveTypes.find(s => s.id === activeStove) || stoveTypes[0];

  return (
    <section className="py-20 bg-[#0F1218]" data-testid="balie-stove-scheme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-3">
            <Flame size={16} /> System grzewczy
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {sectionTitle.split(' ').slice(0, -1).join(' ')} <span className="text-[#D4AF37]">{sectionTitle.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-white/40 text-sm max-w-2xl mx-auto">{sectionSubtitle}</p>
        </div>

        <div className="flex justify-center gap-3 mb-10">
          {stoveTypes.map(s => (
            <button key={s.id} onClick={() => setActiveStove(s.id)}
              className={`px-6 py-3 text-sm font-medium transition-all ${
                activeStove === s.id ? 'bg-[#D4AF37] text-[#0F1218]' : 'bg-[#1A1E27] text-white/50 border border-white/5 hover:border-[#D4AF37]/30'
              }`} data-testid={`balie-stove-toggle-${s.id}`}>
              {s.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-[#111620] border border-white/5 p-4 flex items-center justify-center overflow-hidden">
            {active?.image ? (
              <img src={active.image} alt={active.title} className="w-full h-full object-contain max-h-[350px]" />
            ) : (
              (() => {
                const style = active?.svg_style || 'default';
                const SvgMap = stoveSvgs[activeStove] || stoveSvgs.external;
                const Svg = SvgMap[style] || SvgMap.default;
                return <Svg />;
              })()
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="text-white text-xl font-bold mb-2">{active?.title}</h3>
            <p className="text-[#D4AF37] text-sm mb-6">{active?.subtitle}</p>

            <div className="space-y-3 mb-6">
              {active?.features?.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ArrowRight size={14} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span className="text-white/60 text-sm">{f}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1A1E27] border border-green-800/30 p-3">
                <p className="text-green-400 text-xs font-semibold mb-1.5">Zalety</p>
                {active?.pros?.map((p, i) => (
                  <p key={i} className="text-white/50 text-xs mb-0.5">+ {p}</p>
                ))}
              </div>
              <div className="bg-[#1A1E27] border border-red-800/30 p-3">
                <p className="text-red-400 text-xs font-semibold mb-1.5">Do rozważenia</p>
                {active?.cons?.map((c, i) => (
                  <p key={i} className="text-white/50 text-xs mb-0.5">- {c}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
