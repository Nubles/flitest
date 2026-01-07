
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Lock, Swords, Key, Shield, Sparkles, Compass, ArrowRight, Check, Dices, Skull, BookOpen, Search, MousePointer2, Zap, Dna, Map, ShieldCheck } from 'lucide-react';

// --- Interactive Replicas ---

interface ReplicaProps {
    onComplete: () => void;
}

const ReplicaFarmButton: React.FC<ReplicaProps> = ({ onComplete }) => {
    const [state, setState] = useState<'IDLE' | 'ROLLING' | 'SUCCESS'>('IDLE');

    const handleClick = () => {
        if (state !== 'IDLE') return;
        setState('ROLLING');
        setTimeout(() => {
            setState('SUCCESS');
            onComplete();
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div 
                onClick={handleClick}
                className={`
                    relative group cursor-pointer w-64 transform transition-all duration-300
                    ${state === 'ROLLING' ? 'scale-95' : 'hover:scale-105'}
                    ${state === 'SUCCESS' ? 'pointer-events-none' : ''}
                `}
            >
                {state === 'IDLE' && (
                    <div className="absolute -bottom-8 -right-4 z-20 animate-bounce text-white drop-shadow-lg flex items-center gap-2">
                        <span className="text-xs font-bold bg-black/80 px-2 py-1 rounded">Click me!</span>
                        <MousePointer2 className="fill-white text-black" size={24} />
                    </div>
                )}
                
                <div className={`
                    w-full flex flex-col items-center justify-center px-4 py-4 rounded-[4px] border shadow-lg relative overflow-hidden transition-colors duration-300
                    ${state === 'SUCCESS' ? 'bg-green-900/40 border-green-500' : 'bg-[#2a1414] border-[#4c2a2a]'}
                `}>
                    {state === 'ROLLING' && (
                        <div className="absolute inset-0 bg-white/10 animate-pulse z-20"></div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        {state === 'SUCCESS' ? <Check className="w-5 h-5 text-green-400" /> : <Skull className="w-5 h-5 text-[#f87171]" />}
                        <span className={`font-bold tracking-wide text-base text-shadow-sm ${state === 'SUCCESS' ? 'text-green-400' : 'text-[#f87171]'}`}>
                            {state === 'SUCCESS' ? 'Task Completed' : 'Slayer Task'}
                        </span>
                    </div>
                    
                    {state === 'SUCCESS' ? (
                        <div className="text-xs font-mono px-3 py-0.5 rounded-full border bg-green-950 border-green-500/30 text-green-400 font-bold tracking-wider relative z-10 animate-in zoom-in">
                            KEY FOUND!
                        </div>
                    ) : (
                        <div className="text-xs font-mono px-3 py-0.5 rounded-full border bg-[#150a0a] border-[#2e1515] text-[#f87171] font-bold tracking-wider relative z-10">
                            {state === 'ROLLING' ? 'Rolling...' : '30% Chance'}
                        </div>
                    )}
                </div>
            </div>
            {state === 'SUCCESS' && (
                <div className="text-green-400 font-bold text-sm animate-in slide-in-from-bottom-2 fade-in">
                    Success! You found a Key.
                </div>
            )}
        </div>
    );
};

const ReplicaFateSystem: React.FC<ReplicaProps> = ({ onComplete }) => {
    const [fate, setFate] = useState(40);
    const [message, setMessage] = useState('Click to fail a roll');
    const [shake, setShake] = useState(false);

    const handleClick = () => {
        if (fate >= 50) return;
        setShake(true);
        setTimeout(() => setShake(false), 200);

        const newFate = fate + 10;
        setFate(newFate);
        
        if (newFate >= 50) {
            setMessage('PITY TRIGGERED! (+1 Key)');
            onComplete();
        } else {
            setMessage('Roll Failed... Fate +10');
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <button 
                onClick={handleClick}
                disabled={fate >= 50}
                className={`
                    w-64 bg-[#1a1a1a] p-4 rounded-xl border flex flex-col gap-4 shadow-2xl transition-all
                    ${fate >= 50 ? 'border-amber-500/50 bg-amber-900/10' : 'border-white/10 hover:bg-[#222] hover:border-white/20'}
                    ${shake ? 'translate-x-1' : ''}
                `}
            >
                <div className="flex items-center gap-3 border-b border-white/5 pb-2 w-full">
                    <Shield className={fate >= 50 ? "text-amber-400" : "text-gray-500"} size={20} />
                    <div className="text-left">
                        <h4 className="text-sm font-bold text-gray-200">Bad Luck Protection</h4>
                        <p className="text-[10px] text-gray-500">Failures add Fate Points.</p>
                    </div>
                </div>
                
                <div className="w-full space-y-1">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <span>Fate Points</span>
                      <span className={fate >= 50 ? "text-amber-400 font-black animate-pulse" : ""}>{Math.min(50, fate)}/50</span>
                   </div>
                   <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                     <div 
                        className={`h-full transition-all duration-300 ${fate >= 50 ? 'bg-amber-500' : 'bg-red-900'}`} 
                        style={{ width: `${Math.min(100, (fate/50)*100)}%` }}
                     ></div>
                   </div>
                </div>

                <div className={`w-full text-center text-xs font-mono py-1 rounded transition-colors ${fate >= 50 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-gray-500'}`}>
                    {message}
                </div>
            </button>
            {fate < 50 && (
                 <div className="animate-bounce text-xs text-gray-500 flex items-center gap-1">
                    <MousePointer2 size={12} /> Click the card to simulate failure
                 </div>
            )}
        </div>
    );
};

const ReplicaSpendCard: React.FC<ReplicaProps> = ({ onComplete }) => {
    const [status, setStatus] = useState<'LOCKED' | 'UNLOCKING' | 'UNLOCKED'>('LOCKED');

    const handleUnlock = () => {
        if (status !== 'LOCKED') return;
        setStatus('UNLOCKING');
        setTimeout(() => {
            setStatus('UNLOCKED');
            onComplete();
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div 
                onClick={handleUnlock}
                className={`
                    w-56 relative group cursor-pointer transform transition-all duration-500 perspective-1000
                    ${status === 'UNLOCKED' ? 'scale-110' : 'hover:-translate-y-2'}
                `}
            >
                <div className={`
                    relative overflow-hidden rounded-md border-2 w-full text-left flex flex-col p-4 shadow-xl h-32 transition-all duration-500
                    ${status === 'UNLOCKED' ? 'bg-purple-900/40 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)]' : 'bg-[#2a2620] border-[#fbbf24]'}
                `}>
                    {/* Inner content */}
                    {status === 'UNLOCKING' ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                            <Sparkles className="text-purple-400 animate-spin" size={32} />
                        </div>
                    ) : status === 'UNLOCKED' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 animate-in zoom-in">
                            <BookOpen className="text-purple-400 mb-2" size={32} />
                            <span className="text-purple-300 font-bold text-sm uppercase tracking-wider">Unlocked!</span>
                            <span className="text-white font-black text-lg">Hitpoints</span>
                        </div>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                            
                            <div className="flex justify-between items-start w-full mb-3 relative z-10">
                                <div className="p-1.5 rounded bg-[#1a1814] border border-[#3a352e] text-[#fbbf24] flex items-center justify-center w-8 h-8 shadow-inner">
                                <BookOpen size={20} />
                                </div>
                                <div className="flex flex-col items-end justify-center">
                                <span className="text-[9px] uppercase tracking-widest text-[#666] font-bold">Price</span>
                                <span className="text-[#fbbf24] font-bold text-lg leading-none">1</span>
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex-1 w-full">
                                <h3 className="text-sm font-bold text-[#d1d5db] leading-tight group-hover:text-[#fbbf24] transition-colors">Skills</h3>
                                <p className="text-[10px] text-[#888] font-mono mt-1 uppercase">Unlock +10 Levels</p>
                            </div>
                        </>
                    )}
                </div>
                
                {status === 'LOCKED' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-bounce whitespace-nowrap z-30">
                        Spend Key Here!
                    </div>
                )}
            </div>
        </div>
    );
};

const KeyTypesVisual: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center gap-4 bg-[#1a1a1a] p-3 rounded-lg border border-osrs-gold/30 hover:bg-[#222] transition-colors">
        <div className="p-3 bg-osrs-gold/20 rounded-full border border-osrs-gold/50 shrink-0">
            <Key className="text-osrs-gold w-6 h-6" />
        </div>
        <div>
            <h4 className="font-bold text-osrs-gold text-sm">Standard Key</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">Unlocks a random item from a chosen category. For example, unlocking "Skills" will give you a random skill.</p>
        </div>
    </div>
    <div className="flex items-center gap-4 bg-[#1a1a1a] p-3 rounded-lg border border-purple-500/30 hover:bg-[#222] transition-colors">
        <div className="p-3 bg-purple-900/20 rounded-full border border-purple-500/50 shrink-0">
            <Sparkles className="text-purple-400 w-6 h-6" />
        </div>
        <div>
            <h4 className="font-bold text-purple-400 text-sm">Omni-Key</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">A rare 2% drop from any successful roll. Allows you to <b className="text-purple-200">choose exactly</b> what you want to unlock.</p>
        </div>
    </div>
    <div className="flex items-center gap-4 bg-[#1a1a1a] p-3 rounded-lg border border-red-500/30 hover:bg-[#222] transition-colors">
        <div className="p-3 bg-red-900/20 rounded-full border border-red-500/50 shrink-0">
            <Dna className="text-red-500 w-6 h-6" />
        </div>
        <div>
            <h4 className="font-bold text-red-500 text-sm">Chaos Key</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">Awarded automatically every 50 Total Levels. Unlocks one item from <b className="text-red-300">ANY</b> category at random, ignoring costs.</p>
        </div>
    </div>
  </div>
);

const AltarVisual: React.FC = () => (
    <div className="flex flex-col items-center text-center space-y-4 max-w-md animate-in zoom-in duration-500">
        <div className="p-6 bg-black/40 rounded-full border-2 border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.3)] relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
            <Zap size={48} className="text-purple-400 relative z-10" />
        </div>
        <div className="space-y-3">
            <h4 className="text-xl font-bold text-purple-200">The Void Altar</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
                Your accumulated misfortune (Fate Points) becomes power here. Spend points to perform powerful rituals.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-4">
                <div className="bg-[#222] p-2 rounded border border-blue-500/30 text-blue-300 flex items-center gap-2 justify-center"><Dices size={12}/> Clarity (Advantage)</div>
                <div className="bg-[#222] p-2 rounded border border-yellow-500/30 text-yellow-300 flex items-center gap-2 justify-center"><Swords size={12}/> Greed (2x Loot)</div>
                <div className="bg-[#222] p-2 rounded border border-red-500/30 text-red-300 flex items-center gap-2 justify-center"><Dna size={12}/> Chaos (Wildcard)</div>
                <div className="bg-[#222] p-2 rounded border border-purple-500/30 text-purple-300 flex items-center gap-2 justify-center"><Sparkles size={12}/> Transmute (Omni)</div>
            </div>
        </div>
    </div>
);

// --- Main Wizard ---

export const OnboardingWizard: React.FC = () => {
  const { completeOnboarding } = useGame();
  const [step, setStep] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  // When step changes, reset proceed status unless it's an info-only step
  useEffect(() => {
      // Steps 1, 2, 4 require interaction. 
      if (step === 0 || step === 3 || step === 5 || step === 6) setCanProceed(true);
      else setCanProceed(false);
  }, [step]);

  const steps = [
    {
      id: 'welcome',
      title: "Fate-Locked UIM",
      color: 'text-purple-400',
      description: "Welcome to the ultimate restriction mode. You begin with nothing: No skills, no equipment, no map access. Your destiny is determined solely by the cards you are dealt.",
      visual: (
          <div className="flex flex-col items-center justify-center animate-in zoom-in duration-500">
              <div className="relative mb-6">
                  <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full animate-pulse"></div>
                  <Lock size={80} className="text-purple-400 relative z-10 drop-shadow-2xl" />
              </div>
              <div className="text-center space-y-2">
                  <span className="text-xs font-mono text-purple-300 uppercase tracking-[0.3em]">RNG x Ironman</span>
                  <div className="flex gap-2 justify-center">
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] border border-white/10 flex items-center gap-1"><Map size={10}/> Region Locked</span>
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] border border-white/10 flex items-center gap-1"><BookOpen size={10}/> Skill Capped</span>
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] border border-white/10 flex items-center gap-1"><ShieldCheck size={10}/> Gear Restricted</span>
                  </div>
              </div>
          </div>
      ),
      actionLabel: "Start Tutorial"
    },
    {
      id: 'farm',
      title: "1. Farming Keys",
      color: 'text-green-400',
      description: "Play OSRS normally. When you complete a task (like a Quest, Diary, or Slayer Assignment), use this app to roll for a Key. Try it now!",
      visual: <ReplicaFarmButton onComplete={() => setCanProceed(true)} />,
      actionLabel: "Next Step"
    },
    {
      id: 'mechanics',
      title: "2. Fate & Pity",
      color: 'text-amber-400',
      description: "RNG is cruel. If you fail a roll, you gain Fate Points instead of a Key. Reach 50 points to guarantee a drop. Simulate a dry streak now.",
      visual: <ReplicaFateSystem onComplete={() => setCanProceed(true)} />,
      actionLabel: "Next Step"
    },
    {
      id: 'keytypes',
      title: "3. The Three Keys",
      color: 'text-blue-400',
      description: "Not all keys are equal. While most are standard, lucky rolls can yield Omni-Keys, and leveling up grants Chaos Keys.",
      visual: <KeyTypesVisual />,
      actionLabel: "Next Step"
    },
    {
      id: 'spend',
      title: "4. Unlocking Content",
      color: 'text-osrs-gold',
      description: "Spend your Keys to randomly unlock content. Unlocks are permanent. Try unlocking a Skill tier below.",
      visual: <ReplicaSpendCard onComplete={() => setCanProceed(true)} />,
      actionLabel: "Next Step"
    },
    {
      id: 'altar',
      title: "5. The Void Altar",
      color: 'text-purple-400',
      description: "Spend your hard-earned Fate Points on powerful Rituals to manipulate RNG in your favor.",
      visual: <AltarVisual />,
      actionLabel: "Next Step"
    },
    {
      id: 'ready',
      title: "You Are Ready",
      color: 'text-white',
      description: "The Dashboard tracks your progress. Use the Oracle (Ctrl+K) to find specific content availability. Good luck.",
      visual: (
          <div className="flex flex-col items-center justify-center animate-in zoom-in duration-500">
              <div className="p-6 bg-blue-900/20 rounded-full border border-blue-500/30 mb-6 relative group">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                  <Compass size={64} className="text-blue-400 relative z-10" />
              </div>
              <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Begin Adventure</h3>
                  <p className="text-sm text-gray-400">May your rolls be high and your dry streaks short.</p>
              </div>
          </div>
      ),
      actionLabel: "Enter the Void"
    }
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (!canProceed) return; 
    
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-500">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-transparent via-${currentStep.color.split('-')[1]}-900/10 to-transparent rounded-full blur-[100px] transition-all duration-1000`}></div>
      </div>

      <div className="relative w-full max-w-5xl h-[650px] bg-[#161616] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Content */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-10">
            <div className="mb-8">
                <div className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 ${currentStep.color} opacity-80 flex items-center gap-2`}>
                    <span className="w-8 h-px bg-current"></span>
                    Tutorial {step + 1}/{steps.length}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight tracking-tight">
                    {currentStep.title}
                </h2>
                <p className="text-gray-400 text-base leading-relaxed max-w-md">
                    {currentStep.description}
                </p>
            </div>

            <div className="mt-auto">
                <button 
                    onClick={handleNext}
                    disabled={!canProceed}
                    className={`
                        group px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-3 text-sm
                        ${canProceed 
                            ? 'bg-osrs-gold text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)] cursor-pointer' 
                            : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'}
                    `}
                >
                    {currentStep.actionLabel}
                    {step === steps.length - 1 ? <Check size={18} /> : <ArrowRight size={18} className={`transition-transform ${canProceed ? 'group-hover:translate-x-1' : ''}`} />}
                </button>
                {!canProceed && (
                    <p className="text-[10px] text-red-400 mt-3 font-mono animate-pulse">
                        Please complete the interaction above to continue.
                    </p>
                )}
            </div>
        </div>

        {/* Right Side: Visuals */}
        <div className="flex-1 bg-[#0f0f0f] border-l border-white/5 relative flex items-center justify-center p-8 overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            
            {/* The Visual Container with Animation */}
            <div key={step} className="relative z-10 animate-in slide-in-from-right-12 fade-in duration-700 ease-out transform scale-100 md:scale-110">
                {currentStep.visual}
            </div>

            {/* Pagination Dots (Mobile/Visual Indicator) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? `w-8 ${currentStep.color.replace('text', 'bg')}` : 'w-1.5 bg-white/10'}`} 
                    />
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
