
import React, { useRef, useState, useMemo } from 'react';
import { X, Copy, Download, Trophy, Map, Shield, Sparkles, Skull, Crown, Hash, Activity, Zap, Home, Store, Gamepad2, Package, BookOpen } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useGame } from '../context/GameContext';
import { EQUIPMENT_SLOTS, EQUIPMENT_TIER_MAX, SKILLS_LIST, REGIONS_LIST, REGION_GROUPS, SLOT_CONFIG } from '../constants';

interface ShareModalProps {
  onClose: () => void;
}

type CardTheme = 'VOID' | 'GILDED' | 'IRON' | 'BLOOD';

export const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const gameState = useGame();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [theme, setTheme] = useState<CardTheme>('VOID');

  // --- Stats Calculation ---
  const { unlocks } = gameState;
  const totalRegions = unlocks.regions.length;
  const totalSkillTiers = (Object.values(unlocks.skills) as number[]).reduce((a, b) => a + b, 0);
  const totalEquipTiers = (Object.values(unlocks.equipment) as number[]).reduce((a, b) => a + b, 0);
  const totalLevel = (Object.values(unlocks.levels) as number[]).reduce((a, b) => a + b, 0);
  
  const maxProgression = (SKILLS_LIST.length * 10) + (EQUIPMENT_SLOTS.length * EQUIPMENT_TIER_MAX) + REGIONS_LIST.length;
  const currentProgression = totalSkillTiers + totalEquipTiers + totalRegions;
  const progressPercent = Math.round((currentProgression / maxProgression) * 100);

  // Region Mastery
  const regionMastery = Object.entries(REGION_GROUPS).map(([group, areas]) => {
      const unlockedCount = areas.filter(a => unlocks.regions.includes(a)).length;
      return { group, count: unlockedCount, total: areas.length, percent: unlockedCount / areas.length };
  }).filter(r => r.count > 0).sort((a, b) => b.percent - a.percent);

  // Counts
  const bossCount = unlocks.bosses.length;
  const minigameCount = unlocks.minigames.length;
  const arcanaCount = unlocks.arcana.length;
  const pohCount = unlocks.housing.length;

  // --- Rank System ---
  const rank = useMemo(() => {
    if (progressPercent < 10) return { title: 'Lost Soul', color: 'text-gray-400', icon: Skull };
    if (progressPercent < 25) return { title: 'Fate Wanderer', color: 'text-blue-400', icon: Map };
    if (progressPercent < 50) return { title: 'Iron Determinator', color: 'text-gray-200', icon: Shield };
    if (progressPercent < 75) return { title: 'Void Champion', color: 'text-purple-400', icon: Trophy };
    return { title: 'Master of Fate', color: 'text-amber-400', icon: Crown };
  }, [progressPercent]);

  // --- Theme Styles ---
  const getThemeStyles = () => {
    switch (theme) {
      case 'GILDED':
        return {
          bg: 'bg-[#1a1814]',
          border: 'border-yellow-600',
          accent: 'text-yellow-500',
          sub: 'text-yellow-200/60',
          panel: 'bg-[#2a2620]',
          gradient: 'from-yellow-900/40 via-[#1a1814] to-black',
          deco: 'border-yellow-500/20',
          bar: 'bg-yellow-500'
        };
      case 'IRON':
        return {
          bg: 'bg-[#1a1a1a]',
          border: 'border-gray-500',
          accent: 'text-gray-300',
          sub: 'text-gray-500',
          panel: 'bg-[#262626]',
          gradient: 'from-gray-800/40 via-[#1a1a1a] to-black',
          deco: 'border-gray-500/20',
          bar: 'bg-gray-400'
        };
      case 'BLOOD':
        return {
          bg: 'bg-[#1a0a0a]',
          border: 'border-red-800',
          accent: 'text-red-500',
          sub: 'text-red-200/60',
          panel: 'bg-[#2a1010]',
          gradient: 'from-red-900/40 via-[#1a0a0a] to-black',
          deco: 'border-red-500/20',
          bar: 'bg-red-600'
        };
      case 'VOID':
      default:
        return {
          bg: 'bg-[#0f0f13]',
          border: 'border-purple-500/50',
          accent: 'text-purple-400',
          sub: 'text-purple-200/50',
          panel: 'bg-[#18181b]',
          gradient: 'from-purple-900/20 via-[#0f0f13] to-black',
          deco: 'border-purple-500/20',
          bar: 'bg-purple-500'
        };
    }
  };

  const ts = getThemeStyles();

  // --- Actions ---
  const generateTextSummary = () => {
    return `📜 **Fate-Locked Ironman** - ${rank.title}
Progression: ${progressPercent}% | Total Level: ${totalLevel}
🔑 Keys: ${gameState.keys} | ✨ Omni: ${gameState.specialKeys}
🌍 Regions: ${totalRegions} Unlocked
⚔️ Gear Tiers: ${totalEquipTiers}
🏆 Bosses: ${bossCount} | 🎲 Minigames: ${minigameCount}
#OSRS #FateLocked`;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateTextSummary());
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);
    try {
      // Wait for font/styles to settle
      await new Promise(r => setTimeout(r, 200));
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, 
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `fate_locked_status_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Screenshot failed', err);
      alert('Image generation failed. Try using your browser screenshot tool.');
    } finally {
      setIsCapturing(false);
    }
  };

  const getSlotImage = (slot: string) => {
      const config = SLOT_CONFIG[slot];
      return config ? `https://oldschool.runescape.wiki/images/${config.file}` : '';
  };
  
  const getSkillImage = (skill: string) => {
      return `https://oldschool.runescape.wiki/images/${skill}_icon.png`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="flex flex-col gap-6 items-center w-full max-w-4xl my-auto">
        
        {/* Theme Selectors */}
        <div className="flex gap-2 p-2 bg-[#1a1a1a] rounded-full border border-white/10">
            {(['VOID', 'GILDED', 'IRON', 'BLOOD'] as CardTheme[]).map(t => (
                <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${theme === t ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    {t}
                </button>
            ))}
        </div>

        {/* --- THE CARD --- */}
        <div 
          ref={cardRef}
          id="status-card"
          className={`
            w-full max-w-[800px]
            rounded-xl border-[3px] ${ts.border}
            ${ts.bg} relative overflow-hidden shadow-2xl flex flex-col
          `}
        >
            {/* Background Texture */}
            <div className={`absolute inset-0 bg-gradient-to-br ${ts.gradient} pointer-events-none`}></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] pointer-events-none"></div>

            {/* HEADER */}
            <div className={`relative z-10 flex justify-between items-center p-6 border-b ${ts.deco}`}>
                <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-xl border-2 ${ts.border} bg-black/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                        <rank.icon className={`w-10 h-10 ${rank.color}`} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-widest leading-none">Fate-Locked Ironman</h2>
                        <div className={`flex items-center gap-3 mt-1 ${rank.color}`}>
                            <span className="text-sm font-bold uppercase tracking-wide">{rank.title}</span>
                            <div className="h-px w-12 bg-current opacity-50"></div>
                            <span className="text-xs text-gray-400 font-mono">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex flex-col items-end">
                         <span className={`text-4xl font-black text-white leading-none flex items-center gap-2`}>
                            {progressPercent}%
                         </span>
                         <span className={`text-[10px] font-mono uppercase tracking-widest ${ts.sub}`}>Completion</span>
                    </div>
                </div>
            </div>

            {/* STATS BAR */}
            <div className={`relative z-10 grid grid-cols-4 border-b ${ts.deco} bg-black/20 divide-x divide-white/5`}>
                 <div className="p-3 flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Level</span>
                    <span className="text-xl font-bold text-white flex items-center gap-2"><Activity size={16} className={ts.accent} /> {totalLevel}</span>
                 </div>
                 <div className="p-3 flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Keys Found</span>
                    <span className="text-xl font-bold text-white flex items-center gap-2"><Hash size={16} className={ts.accent} /> {gameState.keys}</span>
                 </div>
                 <div className="p-3 flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Omni-Keys</span>
                    <span className="text-xl font-bold text-white flex items-center gap-2"><Sparkles size={16} className="text-purple-400" /> {gameState.specialKeys}</span>
                 </div>
                 <div className="p-3 flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fate Points</span>
                    <span className="text-xl font-bold text-white flex items-center gap-2"><Shield size={16} className="text-amber-400" /> {gameState.fatePoints}</span>
                 </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 p-6 grid grid-cols-12 gap-6">
                
                {/* Left Panel: Gear & Unlocks (8 cols) */}
                <div className="col-span-7 space-y-6">
                    
                    {/* Skills Section */}
                    <div>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${ts.accent} flex items-center gap-2`}>
                            <BookOpen size={14} /> Skills
                        </h3>
                        <div className="grid grid-cols-6 gap-2">
                             {SKILLS_LIST.map(skill => {
                                 const tier = unlocks.skills[skill] || 0;
                                 return (
                                     <div key={skill} className={`bg-black/40 rounded border ${ts.deco} p-1.5 flex flex-col items-center relative overflow-hidden group`}>
                                         <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                         <div className="relative z-10 w-6 h-6 flex items-center justify-center mb-1">
                                             <img 
                                                src={getSkillImage(skill)} 
                                                alt={skill} 
                                                className={`w-full h-full object-contain ${tier === 0 ? 'opacity-30 grayscale' : ''}`} 
                                                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                                             />
                                             {tier >= 10 && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-osrs-gold shadow-[0_0_5px_rgba(250,204,21,1)]"></div>}
                                         </div>
                                         <div className={`w-full text-center text-[9px] font-bold ${tier === 0 ? 'text-gray-600' : tier >= 10 ? 'text-osrs-gold bg-yellow-900/30' : 'text-white bg-white/10'} rounded-sm`}>
                                             {tier === 0 ? 'Locked' : tier >= 10 ? '99' : `T${tier}`}
                                         </div>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>

                    {/* Equipment Section */}
                    <div>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${ts.accent} flex items-center gap-2`}>
                            <Shield size={14} /> Gear Progression
                        </h3>
                        <div className="grid grid-cols-6 gap-2">
                             {EQUIPMENT_SLOTS.map(slot => {
                                 const tier = unlocks.equipment[slot] || 0;
                                 return (
                                     <div key={slot} className={`bg-black/40 rounded border ${ts.deco} p-1.5 flex flex-col items-center relative overflow-hidden group`}>
                                         <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                         <div className="relative z-10 w-8 h-8 flex items-center justify-center mb-1">
                                             <img src={getSlotImage(slot)} alt={slot} className={`w-full h-full object-contain ${tier === 0 ? 'opacity-30 grayscale' : ''}`} />
                                             {tier >= 7 && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,1)]"></div>}
                                         </div>
                                         <div className={`w-full text-center text-[10px] font-bold ${tier === 0 ? 'text-gray-600' : 'text-white bg-white/10 rounded-sm'}`}>
                                             T{tier}
                                         </div>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>

                    {/* Unlock Counters */}
                    <div>
                         <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${ts.accent} flex items-center gap-2`}>
                            <Zap size={14} /> Content Access
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`${ts.panel} p-2 rounded border ${ts.deco} flex justify-between items-center`}>
                                <div className="flex items-center gap-2 text-xs text-gray-400"><Skull size={14} /> Bosses</div>
                                <span className="font-bold text-white">{bossCount}</span>
                            </div>
                            <div className={`${ts.panel} p-2 rounded border ${ts.deco} flex justify-between items-center`}>
                                <div className="flex items-center gap-2 text-xs text-gray-400"><Gamepad2 size={14} /> Minigames</div>
                                <span className="font-bold text-white">{minigameCount}</span>
                            </div>
                            <div className={`${ts.panel} p-2 rounded border ${ts.deco} flex justify-between items-center`}>
                                <div className="flex items-center gap-2 text-xs text-gray-400"><Store size={14} /> Merchants</div>
                                <span className="font-bold text-white">{unlocks.merchants.length}</span>
                            </div>
                            <div className={`${ts.panel} p-2 rounded border ${ts.deco} flex justify-between items-center`}>
                                <div className="flex items-center gap-2 text-xs text-gray-400"><Home size={14} /> POH Rooms</div>
                                <span className="font-bold text-white">{pohCount}</span>
                            </div>
                            <div className={`${ts.panel} p-2 rounded border ${ts.deco} flex justify-between items-center`}>
                                <div className="flex items-center gap-2 text-xs text-gray-400"><Sparkles size={14} /> Arcana</div>
                                <span className="font-bold text-white">{arcanaCount}</span>
                            </div>
                            <div className={`${ts.panel} p-2 rounded border ${ts.deco} flex justify-between items-center`}>
                                <div className="flex items-center gap-2 text-xs text-gray-400"><Package size={14} /> Storage</div>
                                <span className="font-bold text-white">{unlocks.storage.length}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Panel: Region Mastery (5 cols) */}
                <div className="col-span-5 flex flex-col h-full">
                     <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${ts.accent} flex items-center gap-2`}>
                        <Map size={14} /> World Mastery
                    </h3>
                    
                    <div className={`flex-1 ${ts.panel} rounded border ${ts.deco} p-3 overflow-hidden flex flex-col`}>
                        <div className="space-y-3">
                            {regionMastery.length === 0 && (
                                <div className="text-center py-10 text-xs italic text-gray-600">No regions explored...</div>
                            )}
                            {regionMastery.map(({ group, count, total, percent }) => (
                                <div key={group} className="space-y-1">
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-300">
                                        <span>{group}</span>
                                        <span className="opacity-70">{Math.round(percent * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div className={`h-full ${ts.bar} transition-all`} style={{ width: `${percent * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Notable Feats Section at bottom of Right Panel */}
                        <div className="mt-auto pt-4 border-t border-white/5">
                            <h4 className="text-[9px] font-bold uppercase text-gray-500 mb-2">Notable Feats</h4>
                            <div className="flex flex-wrap gap-1">
                                {unlocks.bosses.slice(0, 4).map(b => (
                                    <span key={b} className="px-1.5 py-0.5 bg-red-900/30 text-red-200 border border-red-500/20 rounded text-[9px] truncate max-w-[100px]">{b}</span>
                                ))}
                                {unlocks.storage.slice(0, 2).map(s => (
                                    <span key={s} className="px-1.5 py-0.5 bg-amber-900/30 text-amber-200 border border-amber-500/20 rounded text-[9px] truncate max-w-[100px]">{s}</span>
                                ))}
                                {totalSkillTiers >= 100 && (
                                    <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-200 border border-blue-500/20 rounded text-[9px]">Skill Master</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className={`relative z-10 py-2 px-6 bg-black/40 flex justify-between items-center text-[10px] ${ts.sub} font-mono uppercase`}>
                <div>Fate is Absolute</div>
                <div>ID: {Date.now().toString(36).toUpperCase()}</div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full max-w-[800px]">
            <button 
                onClick={handleCopyText}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white font-bold rounded-lg transition-all border border-white/10"
            >
                {copyStatus === 'copied' ? <span className="text-green-400">Copied to Clipboard!</span> : <><Copy size={18} /> Copy Text Summary</>}
            </button>
            <button 
                onClick={handleDownloadImage}
                disabled={isCapturing}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-bold rounded-lg transition-all text-black ${theme === 'GILDED' ? 'bg-yellow-500 hover:bg-yellow-400' : theme === 'BLOOD' ? 'bg-red-600 hover:bg-red-500 text-white' : theme === 'IRON' ? 'bg-gray-400 hover:bg-gray-300' : 'bg-purple-500 hover:bg-purple-400 text-white'}`}
            >
                {isCapturing ? <span className="animate-spin">Generating...</span> : <><Download size={18} /> Download Image</>}
            </button>
        </div>
        
        <button onClick={onClose} className="text-gray-500 hover:text-white text-sm underline">Close</button>
      </div>
    </div>
  );
};