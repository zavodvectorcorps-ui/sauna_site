import { useState } from 'react';
import { Flame, ArrowRight } from 'lucide-react';

const stoveTypes = [
  {
    id: 'internal',
    title: 'Piec wewnetrzny',
    subtitle: 'Zintegrowany w balii',
    features: [
      'Montaz wewnatrz misy balii',
      'Bezposredni kontakt z woda — szybsze nagrzewanie',
      'Kompaktowa konstrukcja',
      'Idealny dla mniejszych przestrzeni',
    ],
    pros: ['Szybsze nagrzewanie', 'Mniej miejsca na zewnatrz'],
    cons: ['Mniejsza przestrzen kapielowa'],
  },
  {
    id: 'external',
    title: 'Piec zewnetrzny',
    subtitle: 'Z podwojnym obiegiem wody',
    features: [
      'Montaz poza misa balii',
      'Podwojny obieg: zimna woda do pieca, ciepla z powrotem',
      'Pelna przestrzen kapielowa',
      'Latwiejszy dostep do palenia',
    ],
    pros: ['Wieksza przestrzen w balii', 'Wygodniejsze dolozenie drewna'],
    cons: ['Wymaga wiecej miejsca na zewnatrz'],
  },
];

export const BalieStoveScheme = () => {
  const [activeStove, setActiveStove] = useState('external');
  const active = stoveTypes.find(s => s.id === activeStove);

  return (
    <section className="py-20 bg-[#0F1218]" data-testid="balie-stove-scheme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-3">
            <Flame size={16} />
            System grzewczy
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Jak dziala <span className="text-[#D4AF37]">piec?</span>
          </h2>
          <p className="text-white/40 text-sm max-w-2xl mx-auto">
            Oferujemy dwa typy piecow na drewno ze stali nierdzewnej V4A. Kazdy nagrzeje wode w 1-2 godziny, nawet przy -20°C.
          </p>
        </div>

        {/* Stove type toggle */}
        <div className="flex justify-center gap-3 mb-10">
          {stoveTypes.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStove(s.id)}
              className={`px-6 py-3 text-sm font-medium transition-all ${
                activeStove === s.id
                  ? 'bg-[#D4AF37] text-[#0F1218]'
                  : 'bg-[#1A1E27] text-white/50 border border-white/5 hover:border-[#D4AF37]/30'
              }`}
              data-testid={`balie-stove-toggle-${s.id}`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* SVG Diagram */}
          <div className="bg-[#111620] border border-white/5 p-8 flex items-center justify-center">
            <svg viewBox="0 0 500 350" className="w-full h-full max-h-[350px]" xmlns="http://www.w3.org/2000/svg">
              {/* Background */}
              <rect x="0" y="0" width="500" height="350" fill="#111620" rx="4" />
              {activeStove === 'external' ? (
                <>
                  {/* External stove diagram */}
                  {/* Tub */}
                  <path d="M60 100 Q60 250 80 260 L280 260 Q300 250 300 100 Z" fill="#1a3a5c" opacity="0.5" stroke="#5ba8d5" strokeWidth="2" />
                  <path d="M60 100 L300 100" stroke="#5ba8d5" strokeWidth="2" />
                  <text x="180" y="90" fill="#5ba8d5" fontSize="10" textAnchor="middle">Balia</text>

                  {/* Water inside */}
                  {[120, 140, 160, 180, 200, 220, 240].map(y => (
                    <path key={y} d={`M65 ${y} Q120 ${y-3} 180 ${y} Q240 ${y+3} 295 ${y}`} fill="none" stroke="#5ba8d5" strokeWidth="0.5" opacity="0.2" />
                  ))}

                  {/* Stove (external) */}
                  <rect x="350" y="100" width="80" height="160" rx="6" fill="#444" stroke="#D4AF37" strokeWidth="2" />
                  <text x="390" y="130" fill="#D4AF37" fontSize="11" textAnchor="middle" fontWeight="bold">PIEC</text>
                  <text x="390" y="145" fill="#D4AF37" fontSize="8" textAnchor="middle">V4A</text>

                  {/* Fire inside stove */}
                  <rect x="365" y="190" width="50" height="35" rx="3" fill="#222" />
                  <path d="M380 220 Q385 200 390 210 Q395 195 400 215" stroke="#D4AF37" strokeWidth="2" fill="none" />
                  <circle cx="390" cy="207" r="8" fill="#D4AF37" opacity="0.3" />

                  {/* Chimney */}
                  <rect x="382" y="40" width="16" height="60" rx="2" fill="#555" stroke="#666" strokeWidth="1" />
                  <path d="M385 45 Q390 35 395 45" stroke="#888" strokeWidth="1" fill="none" />
                  <text x="390" y="32" fill="#888" fontSize="8" textAnchor="middle">komin</text>

                  {/* Cold water pipe (blue) - from tub to stove bottom */}
                  <path d="M300 200 L330 200 Q345 200 345 190 L345 170 Q345 160 355 160 L350 160" fill="none" stroke="#5ba8d5" strokeWidth="3" />
                  <polygon points="347,155 353,160 347,165" fill="#5ba8d5" />
                  <text x="325" y="215" fill="#5ba8d5" fontSize="9" fontWeight="bold">zimna woda</text>

                  {/* Hot water pipe (red) - from stove top back to tub */}
                  <path d="M350 130 L340 130 Q325 130 325 140 L325 150 Q325 160 315 160 L300 160" fill="none" stroke="#e85050" strokeWidth="3" />
                  <polygon points="303,155 297,160 303,165" fill="#e85050" />
                  <text x="325" y="120" fill="#e85050" fontSize="9" fontWeight="bold">ciepla woda</text>

                  {/* Circulation arrows */}
                  <path d="M310 175 Q320 180 310 185" fill="none" stroke="#D4AF37" strokeWidth="1.5" markerEnd="url(#garrow)" />
                  <defs><marker id="garrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#D4AF37" /></marker></defs>

                  {/* Labels */}
                  <text x="180" y="290" fill="white" fontSize="10" textAnchor="middle" opacity="0.5">Podwojny obieg wody</text>
                  <text x="180" y="305" fill="white" fontSize="8" textAnchor="middle" opacity="0.3">Nagrzewanie 1-2h nawet przy -20°C</text>
                </>
              ) : (
                <>
                  {/* Internal stove diagram */}
                  {/* Tub - wider */}
                  <path d="M60 100 Q60 250 80 260 L380 260 Q400 250 400 100 Z" fill="#1a3a5c" opacity="0.5" stroke="#5ba8d5" strokeWidth="2" />
                  <path d="M60 100 L400 100" stroke="#5ba8d5" strokeWidth="2" />
                  <text x="180" y="90" fill="#5ba8d5" fontSize="10" textAnchor="middle">Balia</text>

                  {/* Water */}
                  {[120, 140, 160, 180, 200, 220, 240].map(y => (
                    <path key={y} d={`M65 ${y} Q165 ${y-3} 260 ${y} Q340 ${y+3} 395 ${y}`} fill="none" stroke="#5ba8d5" strokeWidth="0.5" opacity="0.2" />
                  ))}

                  {/* Internal stove (inside tub) */}
                  <rect x="310" y="110" width="60" height="140" rx="4" fill="#444" stroke="#D4AF37" strokeWidth="2" />
                  <text x="340" y="135" fill="#D4AF37" fontSize="10" textAnchor="middle" fontWeight="bold">PIEC</text>

                  {/* Fire */}
                  <rect x="320" y="190" width="40" height="30" rx="2" fill="#222" />
                  <path d="M332 216 Q337 198 340 208 Q343 195 348 212" stroke="#D4AF37" strokeWidth="2" fill="none" />

                  {/* Chimney */}
                  <rect x="333" y="40" width="14" height="60" rx="2" fill="#555" stroke="#666" strokeWidth="1" />
                  <text x="340" y="32" fill="#999" fontSize="8" textAnchor="middle">komin</text>

                  {/* Safety fence */}
                  <rect x="295" y="108" width="4" height="155" rx="1" fill="#777" />
                  {[120, 145, 170, 195, 220, 245].map(y => (
                    <rect key={y} x="296" y={y} width="12" height="2" rx="0.5" fill="#666" />
                  ))}
                  <text x="290" y="280" fill="#999" fontSize="7" textAnchor="middle">ogrodzenie</text>

                  {/* Heat arrows radiating from stove */}
                  {[140, 170, 200, 230].map(y => (
                    <g key={y}>
                      <path d={`M310 ${y} L280 ${y}`} stroke="#e85050" strokeWidth="1.5" opacity="0.5" strokeDasharray="4 2" />
                      <polygon points={`283,${y-3} 277,${y} 283,${y+3}`} fill="#e85050" opacity="0.5" />
                    </g>
                  ))}
                  <text x="250" y="175" fill="#e85050" fontSize="9" fontWeight="bold" opacity="0.7">cieplo</text>

                  {/* Bathing area label */}
                  <text x="170" y="190" fill="white" fontSize="10" textAnchor="middle" opacity="0.4">strefa kapielowa</text>

                  {/* Labels */}
                  <text x="230" y="290" fill="white" fontSize="10" textAnchor="middle" opacity="0.5">Bezposredni kontakt z woda</text>
                  <text x="230" y="305" fill="white" fontSize="8" textAnchor="middle" opacity="0.3">Szybsze nagrzewanie, kompaktowa budowa</text>
                </>
              )}
            </svg>
          </div>

          {/* Info panel */}
          <div className="flex flex-col justify-center">
            <h3 className="text-white text-xl font-bold mb-2">{active?.title}</h3>
            <p className="text-[#D4AF37] text-sm mb-6">{active?.subtitle}</p>

            <div className="space-y-3 mb-6">
              {active?.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ArrowRight size={14} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span className="text-white/60 text-sm">{f}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1A1E27] border border-green-800/30 p-3">
                <p className="text-green-400 text-xs font-semibold mb-1.5">Zalety</p>
                {active?.pros.map((p, i) => (
                  <p key={i} className="text-white/50 text-xs mb-0.5">+ {p}</p>
                ))}
              </div>
              <div className="bg-[#1A1E27] border border-red-800/30 p-3">
                <p className="text-red-400 text-xs font-semibold mb-1.5">Do rozważenia</p>
                {active?.cons.map((c, i) => (
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
