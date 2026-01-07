
import React, { useState, useRef, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { ActionSection } from './components/ActionSection';
import { GachaSection } from './components/GachaSection';
import { Dashboard } from './components/Dashboard';
import { LogViewer } from './components/LogViewer';
import { StatsModal } from './components/StatsModal';
import { ReferenceModal } from './components/ReferenceModal';
import { VoidAltar } from './components/VoidAltar';
import { ShareModal } from './components/ShareModal';
import { ScribeChronicle } from './components/ScribeChronicle';
import { TransmutationEffect } from './components/TransmutationEffect';
import { ClarityEffect, GreedEffect, ChaosEffect } from './components/RitualEffects';
import { EffectsLayer } from './components/EffectsLayer';
import { OnboardingWizard } from './components/OnboardingWizard';
import { OracleSearch } from './components/OracleSearch';
import { StrategyGuide } from './components/StrategyGuide';
import { Key, Sparkles, Download, Upload, RotateCcw, BarChart3, HelpCircle, Dna, Share2, PlayCircle, PauseCircle, Search, Swords, ShoppingBag, ScrollText, Compass } from 'lucide-react';

// --- Toast Component ---
const ToastNotification = () => {
  const { lastEvent } = useGame();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!lastEvent) return;
    
    const undoableTypes = [
      'ROLL_SUCCESS', 'ROLL_FAIL', 'ROLL_OMNI', 'ROLL_PITY', 
      'UNLOCK', 'RITUAL', 'LEVEL_UP'
    ];

    if (undoableTypes.includes(lastEvent.type)) {
      let msg = 'Action Complete';
      if (lastEvent.type.includes('ROLL')) msg = 'Roll Recorded';
      if (lastEvent.type === 'UNLOCK') msg = 'Content Unlocked';
      if (lastEvent.type === 'RITUAL') msg = 'Ritual Performed';
      if (lastEvent.type === 'LEVEL_UP') {
          // Check for Chaos Key award in metadata
          if (lastEvent.meta && lastEvent.meta.chaosKeyAwarded) {
              msg = 'Level Up + Chaos Key!';
          } else {
              msg = 'Level Up';
          }
      }

      setMessage(msg);
      setVisible(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setVisible(false), 5000);
    }
  }, [lastEvent]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[300] bg-[#222] border border-white/20 shadow-2xl rounded-lg p-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
       <span className="text-sm font-bold text-gray-200">{message}</span>
    </div>
  );
};

const Header = ({ setShowAltar, setShowShare, setShowStats, setShowReference, setShowOracle, setShowStrategy }: any) => {
  const { keys, specialKeys, chaosKeys, fatePoints, activeBuff, animationsEnabled, toggleAnimations, importSave, resetGame } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        importSave(imported);
      } catch (err) { alert("Failed to import save data."); }
    };
    reader.readAsText(file);
  };

  return (
      <header className="bg-[#1e1e1e] border-b border-white/10 sticky top-0 z-50 shadow-xl backdrop-blur-md bg-opacity-95">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex flex-col xl:flex-row items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-900 rounded-lg flex items-center justify-center border border-amber-500/50 shadow-inner">
              <span className="text-2xl drop-shadow-md">🗝️</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-100 tracking-tight uppercase leading-none">Fate-Locked OSRS</h1>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5 tracking-wide">V1.1 COMMAND CENTER</p>
            </div>
          </div>

          {/* Resources Bar */}
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 bg-black/20 p-1.5 pr-4 rounded-xl border border-white/5 w-full xl:w-auto shadow-inner">
            <div className="w-full md:w-48 lg:w-64 px-2">
               <div className="flex justify-between text-[10px] mb-1.5 font-bold uppercase tracking-wider">
                  <span className={fatePoints >= 40 ? "text-red-400 animate-pulse" : "text-gray-500"}>Fate Points</span>
                  <span className="text-gray-400">{fatePoints}/50</span>
               </div>
               <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                 <div className={`h-full transition-all duration-300 ${fatePoints >= 40 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-amber-600'}`} style={{ width: `${(fatePoints / 50) * 100}%` }} />
                      </div>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/5"></div>
            <div className="flex items-center gap-3 justify-center">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg min-w-[60px] justify-center">
                   <Key className="w-4 h-4 text-amber-400" />
                   <span className="font-bold text-amber-100 text-lg leading-none">{keys}</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors min-w-[60px] justify-center ${specialKeys > 0 ? 'bg-purple-500/20 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/10 opacity-50'}`}>
                   <Sparkles className={`w-4 h-4 ${specialKeys > 0 ? 'text-purple-400 animate-pulse' : 'text-gray-500'}`} />
                   <span className={`font-bold text-lg leading-none ${specialKeys > 0 ? 'text-purple-200' : 'text-gray-500'}`}>{specialKeys}</span>
                </div>
                {chaosKeys > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-lg animate-in fade-in slide-in-from-right-4 min-w-[60px] justify-center">
                     <Dna className="w-4 h-4 text-red-400 animate-pulse" />
                     <span className="font-bold text-red-100 text-lg leading-none">{chaosKeys}</span>
                  </div>
                )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
             <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
             
             <button 
                onClick={() => setShowAltar(true)}
                className={`h-8 group px-3 rounded-lg border font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${activeBuff !== 'NONE' ? activeBuff === 'GREED' ? 'bg-amber-900/40 border-amber-500 text-amber-300' : 'bg-blue-900/40 border-blue-500 text-blue-300' : 'bg-[#252525] border-purple-500/30 text-purple-300 hover:bg-purple-900/20'}`}
             >
                <span className={`w-1.5 h-1.5 rounded-full ${activeBuff !== 'NONE' ? (activeBuff === 'GREED' ? 'bg-amber-400 animate-bounce' : 'bg-blue-400 animate-pulse') : 'bg-purple-500'}`}></span>
                <span>{activeBuff === 'NONE' ? 'Altar' : activeBuff}</span>
             </button>

             <div className="flex items-center bg-[#252525] border border-white/10 rounded-lg p-0.5 gap-0.5 h-8">
                 <button onClick={() => setShowOracle(true)} className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors" title="Oracle (Ctrl+K)"><Search size={14} /></button>
                 <div className="w-px h-4 bg-white/10"></div>
                 <button onClick={() => setShowStrategy(true)} className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-white/5 rounded transition-colors" title="Strategy Guide"><Compass size={14} /></button>
                 <div className="w-px h-4 bg-white/10"></div>
                 <button onClick={() => setShowShare(true)} className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-pink-400 hover:bg-white/5 rounded transition-colors" title="Share"><Share2 size={14} /></button>
                 <div className="w-px h-4 bg-white/10"></div>
                 <button onClick={() => setShowStats(true)} className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded transition-colors" title="Stats"><BarChart3 size={14} /></button>
                 <div className="w-px h-4 bg-white/10"></div>
                 <button onClick={() => setShowReference(true)} className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:bg-white/5 rounded transition-colors" title="Rules"><HelpCircle size={14} /></button>
             </div>

             <div className="flex items-center bg-[#252525] border border-white/10 rounded-lg p-0.5 gap-0.5 h-8">
                 <button onClick={toggleAnimations} className={`w-7 h-full flex items-center justify-center rounded transition-colors ${animationsEnabled ? 'text-green-400' : 'text-gray-500'}`} title="Animations">
                    {animationsEnabled ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                 </button>
                 <div className="w-px h-4 bg-white/10"></div>
                 <button onClick={() => fileInputRef.current?.click()} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded" title="Import"><Upload size={14} /></button>
                 <div className="w-px h-4 bg-white/10"></div>
                 <button onClick={() => {
                     const blob = new Blob([localStorage.getItem('FATE_UIM_SAVE_V1') || '{}'], { type: 'application/json' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a'); a.href = url; a.download = 'fate_save.json'; a.click();
                 }} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded" title="Export"><Download size={14} /></button>
                 <div className="w-px h-4 bg-white/10"></div>
                 <button onClick={() => { if(window.confirm("Reset?")) resetGame(); }} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-white/5 rounded" title="Reset"><RotateCcw size={14} /></button>
             </div>
          </div>
        </div>
      </header>
  );
};

// --- New Control Panel Component ---
const ControlPanel = ({ onShowChronicle }: { onShowChronicle: () => void }) => {
  const [activeTab, setActiveTab] = useState<'FARM' | 'SPEND' | 'LOG'>('FARM');
  
  return (
    <div className="flex flex-col h-full bg-[#1b1b1b] border border-[#333] rounded-lg overflow-hidden shadow-xl">
      {/* Tabs */}
      <div className="flex border-b border-[#333] bg-[#161616] shrink-0">
        <button 
          onClick={() => setActiveTab('FARM')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'FARM' ? 'bg-[#252525] text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]'}`}
        >
          <Swords size={14} /> Farm Keys
        </button>
        <button 
          onClick={() => setActiveTab('SPEND')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'SPEND' ? 'bg-[#252525] text-osrs-gold border-b-2 border-osrs-gold' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]'}`}
        >
          <ShoppingBag size={14} /> Spend Keys
        </button>
        <button 
          onClick={() => setActiveTab('LOG')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'LOG' ? 'bg-[#252525] text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]'}`}
        >
          <ScrollText size={14} /> History
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        <div className={activeTab === 'FARM' ? 'block' : 'hidden'}>
           <ActionSection />
        </div>
        <div className={activeTab === 'SPEND' ? 'block' : 'hidden'}>
           <GachaSection />
        </div>
        <div className={activeTab === 'LOG' ? 'block h-full' : 'hidden'}>
           <LogViewer onShowChronicle={onShowChronicle} />
        </div>
      </div>
    </div>
  );
};

const GameLayout = () => {
  const { lastEvent, animationsEnabled, history, hasSeenOnboarding } = useGame();
  
  // UI States
  const [showStats, setShowStats] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showAltar, setShowAltar] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showChronicle, setShowChronicle] = useState(false);
  const [showOracle, setShowOracle] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const [activeRitualAnim, setActiveRitualAnim] = useState<'NONE' | 'LUCK' | 'GREED' | 'CHAOS' | 'TRANSMUTE'>('NONE');
  
  // Watch for ritual events to trigger animations
  React.useEffect(() => {
    if (lastEvent?.type === 'RITUAL' && animationsEnabled) {
       setActiveRitualAnim(lastEvent.meta.type);
    }
  }, [lastEvent, animationsEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowOracle(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-osrs-bg text-osrs-text pb-6 font-sans selection:bg-osrs-gold selection:text-black relative">
      <EffectsLayer />
      <ToastNotification />
      
      {!hasSeenOnboarding && <OnboardingWizard />}
      
      {activeRitualAnim === 'TRANSMUTE' && <TransmutationEffect onComplete={() => setActiveRitualAnim('NONE')} />}
      {activeRitualAnim === 'LUCK' && <ClarityEffect onComplete={() => setActiveRitualAnim('NONE')} />}
      {activeRitualAnim === 'GREED' && <GreedEffect onComplete={() => setActiveRitualAnim('NONE')} />}
      {activeRitualAnim === 'CHAOS' && <ChaosEffect onComplete={() => setActiveRitualAnim('NONE')} />}
      
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      {showReference && <ReferenceModal onClose={() => setShowReference(false)} />}
      {showAltar && <VoidAltar onClose={() => setShowAltar(false)} />}
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
      {showChronicle && <ScribeChronicle history={history} onClose={() => setShowChronicle(false)} />}
      {showOracle && <OracleSearch onClose={() => setShowOracle(false)} />}
      {showStrategy && <StrategyGuide onClose={() => setShowStrategy(false)} />}

      <Header 
        setShowAltar={setShowAltar} 
        setShowShare={setShowShare} 
        setShowStats={setShowStats} 
        setShowReference={setShowReference}
        setShowOracle={setShowOracle}
        setShowStrategy={setShowStrategy}
      />

      {/* Main Command Center Layout */}
      <main className="max-w-[1600px] mx-auto px-4 py-4 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
          
          {/* LEFT: Interaction & Control (35%) */}
          <div className="lg:col-span-4 h-full min-h-[500px]">
            <ControlPanel onShowChronicle={() => setShowChronicle(true)} />
          </div>

          {/* RIGHT: Dashboard Visualization (65%) */}
          <div className="lg:col-span-8 h-full min-h-[500px] flex flex-col gap-4">
             <div className="flex-1 overflow-hidden h-full">
               <Dashboard />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}

export default App;
