
import React, { useEffect, useState } from 'react';
import { DropSource } from '../types';
import { DROP_RATES } from '../constants';
import { useGame } from '../context/GameContext';
import { BookOpen, ScrollText, Skull, Swords, Crosshair, Shield } from 'lucide-react';
import { wikiService } from '../services/WikiService';

// OSRS Wiki Icon URLs & Item IDs
const OSRS_ICONS = {
  SLAYER: 'https://oldschool.runescape.wiki/images/Slayer_icon.png',
  STATS: 'https://oldschool.runescape.wiki/images/Stats_icon.png',
  COLL_LOG: 'https://oldschool.runescape.wiki/images/Collection_log_icon.png',
  CLUE: 'https://oldschool.runescape.wiki/images/Clue_scroll_%28master%29.png'
};

// Component to dynamically fetch wiki image for icons
const WikiIcon = ({ name, fallbackSrc, className }: { name: string, fallbackSrc?: string, className?: string }) => {
  const [src, setSrc] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    wikiService.fetchImage(name).then(url => {
        if (mounted && url) setSrc(url);
    });
    return () => { mounted = false; };
  }, [name]);

  const displaySrc = src || fallbackSrc;

  if (!displaySrc) return null;

  return <img src={displaySrc} alt={name} className={className} />;
};

// Unified OSRS Difficulty Tier Styles
const TIER_STYLES = {
  STONE: {
    bg: 'bg-[#2a2620]',
    border: 'border-[#4a453d]',
    hover: 'hover:bg-[#38332a] hover:border-[#6a655d]',
    text: 'text-[#a8a29a]',
    pill: 'bg-[#151310] border-[#3a352e] text-[#888]'
  },
  GREEN: { // Easy / Novice
    bg: 'bg-[#142618]',
    border: 'border-[#2a4c30]',
    hover: 'hover:bg-[#1a3320] hover:border-[#3a6640]',
    text: 'text-[#4ade80]',
    pill: 'bg-[#0a150c] border-[#1f3823] text-[#4ade80]'
  },
  BLUE: { // Medium / Intermediate
    bg: 'bg-[#141e26]',
    border: 'border-[#2a3d4c]',
    hover: 'hover:bg-[#1a2833] hover:border-[#3a5466]',
    text: 'text-[#60a5fa]',
    pill: 'bg-[#0a0f13] border-[#1f2d38] text-[#60a5fa]'
  },
  RED: { // Hard / Experienced
    bg: 'bg-[#2a1414]',
    border: 'border-[#4c2a2a]',
    hover: 'hover:bg-[#331a1a] hover:border-[#663a3a]',
    text: 'text-[#f87171]',
    pill: 'bg-[#150a0a] border-[#2e1515] text-[#f87171]'
  },
  PURPLE: { // Elite / Master (Quest)
    bg: 'bg-[#22142a]',
    border: 'border-[#422a4c]',
    hover: 'hover:bg-[#2d1a33] hover:border-[#573a66]',
    text: 'text-[#c084fc]',
    pill: 'bg-[#110a15] border-[#29152e] text-[#c084fc]'
  },
  AMBER: { // Master (CA/Clue)
    bg: 'bg-[#2a1d14]',
    border: 'border-[#4c352a]',
    hover: 'hover:bg-[#33241a] hover:border-[#66473a]',
    text: 'text-[#fbbf24]',
    pill: 'bg-[#150f0a] border-[#2e2015] text-[#fbbf24]'
  },
  GOLD: { // Grandmaster
    bg: 'bg-[#262314]',
    border: 'border-[#4c462a]',
    hover: 'hover:bg-[#332f1a] hover:border-[#665e3a]',
    text: 'text-[#facc15]',
    pill: 'bg-[#13110a] border-[#2e2a15] text-[#facc15] shadow-[0_0_8px_rgba(250,204,21,0.2)]'
  },
  BROWN: { // Collection Log / Misc
    bg: 'bg-[#2a2016]',
    border: 'border-[#5c4033]',
    hover: 'hover:bg-[#3d2e24] hover:border-[#7d5642]',
    text: 'text-[#e0c0a0]',
    pill: 'bg-[#1c120a] border-[#38261b] text-[#e0c0a0]'
  }
};

type TierStyle = typeof TIER_STYLES.GREEN;

const getTierStyle = (tier: string): TierStyle => {
  const t = tier.toLowerCase();
  if (t.includes('grandmaster')) return TIER_STYLES.GOLD;
  if (t.includes('master') && !t.includes('grand')) return TIER_STYLES.AMBER;
  if (t.includes('elite')) return TIER_STYLES.PURPLE;
  if (t.includes('hard') || t.includes('experienced')) return TIER_STYLES.RED;
  if (t.includes('medium') || t.includes('intermediate')) return TIER_STYLES.BLUE;
  if (t.includes('easy') || t.includes('novice')) return TIER_STYLES.GREEN;
  if (t.includes('beginner')) return TIER_STYLES.STONE;
  return TIER_STYLES.STONE;
};

// --- New Slayer Card Component ---
interface SlayerMasterProps {
  name: string;
  source: string;
  image: string;
  style: TierStyle;
  subText: string;
  onClick: (e: React.MouseEvent) => void;
}

const SlayerMasterCard: React.FC<SlayerMasterProps> = ({ name, source, image, style, subText, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`
        relative w-full h-20 overflow-hidden rounded-lg border-2 transition-all duration-300 group
        ${style.bg} ${style.border} ${style.hover}
        shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] active:scale-[0.98]
      `}
    >
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      
      {/* Character Portrait (Right Aligned) */}
      <img 
        src={image} 
        alt={name}
        className="absolute -right-2 -bottom-2 w-auto h-[120%] object-contain opacity-40 group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-x-2 transition-all duration-300 filter grayscale group-hover:grayscale-0 drop-shadow-lg"
      />

      {/* Content (Left Aligned) */}
      <div className="absolute inset-0 flex flex-col justify-center items-start pl-4 z-10 pointer-events-none">
        <h3 className={`font-black text-base uppercase tracking-wider ${style.text} drop-shadow-md`}>
          {name}
        </h3>
        <p className="text-[10px] text-gray-400 font-mono mb-1.5">{subText}</p>
        
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.pill} shadow-sm flex items-center gap-1.5`}>
           <Crosshair size={10} />
           {DROP_RATES[source]}% Chance
        </div>
      </div>

      {/* Hover Flash */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
    </button>
  );
};

// --- Clue Scroll Card Component ---
interface ClueScrollCardProps {
  tier: string;
  source: string;
  itemId: number;
  onClick: (e: React.MouseEvent) => void;
}

const ClueScrollCard: React.FC<ClueScrollCardProps> = ({ tier, source, itemId, onClick }) => {
  const style = getTierStyle(tier);
  const imageUrl = `https://chisel.weirdgloop.org/static/img/osrs-sprite/${itemId}.png`;
  
  return (
    <button 
      onClick={onClick}
      className={`
        relative w-full h-16 overflow-hidden rounded-lg border-2 transition-all duration-300 group
        ${style.bg} ${style.border} ${style.hover}
        shadow-[inset_0_0_10px_rgba(0,0,0,0.2)] active:scale-[0.98]
        flex items-center justify-between px-4
      `}
    >
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/shatter.png')] opacity-5 mix-blend-overlay"></div>
      
      {/* Text Info */}
      <div className="flex flex-col items-start z-10">
        <span className={`font-black text-sm uppercase tracking-wider ${style.text} drop-shadow-md group-hover:translate-x-1 transition-transform`}>
          {tier}
        </span>
        <div className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${style.pill} bg-black/40 flex items-center gap-1.5 shadow-sm backdrop-blur-sm`}>
           <Crosshair size={9} />
           {DROP_RATES[source]}%
        </div>
      </div>

      {/* Clue Icon - Using a standardized container for uniform size */}
      <div className="relative z-10 w-9 h-9 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg flex items-center justify-center bg-black/20 rounded-full border border-white/5 p-1">
         <img src={imageUrl} alt={tier} className="w-full h-full object-contain" />
      </div>

      {/* Hover Flash */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
    </button>
  );
};

// Data Definitions
const SLAYER_MASTERS = [
  {
    name: "Turael",
    subText: "Burthorpe (Easy)",
    source: DropSource.SLAYER_EASY,
    image: "https://oldschool.runescape.wiki/images/Turael.png",
    style: TIER_STYLES.STONE
  },
  {
    name: "Mazchna",
    subText: "Canifis (Easy)",
    source: DropSource.SLAYER_EASY,
    image: "https://oldschool.runescape.wiki/images/Mazchna.png",
    style: TIER_STYLES.STONE
  },
  {
    name: "Vannaka",
    subText: "Edgeville (Medium)",
    source: DropSource.SLAYER_MEDIUM,
    image: "https://oldschool.runescape.wiki/images/Vannaka.png",
    style: TIER_STYLES.BLUE
  },
  {
    name: "Chaeldar",
    subText: "Zanaris (Medium)",
    source: DropSource.SLAYER_MEDIUM,
    image: "https://oldschool.runescape.wiki/images/Chaeldar.png",
    style: TIER_STYLES.BLUE
  },
  {
    name: "Krystilia",
    subText: "Wilderness (Medium)",
    source: DropSource.SLAYER_MEDIUM,
    image: "https://oldschool.runescape.wiki/images/Krystilia.png",
    style: TIER_STYLES.BLUE
  },
  {
    name: "Konar",
    subText: "Mount Karuulm (Hard)",
    source: DropSource.SLAYER_HARD,
    image: "https://oldschool.runescape.wiki/images/Konar_quo_Maten.png",
    style: TIER_STYLES.RED
  },
  {
    name: "Nieve",
    subText: "Gnome Stronghold (Hard)",
    source: DropSource.SLAYER_HARD,
    image: "https://oldschool.runescape.wiki/images/Nieve.png",
    style: TIER_STYLES.RED
  },
  {
    name: "Duradel",
    subText: "Shilo Village (Hard)",
    source: DropSource.SLAYER_HARD,
    image: "https://oldschool.runescape.wiki/images/Duradel.png",
    style: TIER_STYLES.RED
  },
  {
    name: "Boss Task",
    subText: "Boss Slayer / Special",
    source: DropSource.SLAYER_BOSS,
    image: "https://oldschool.runescape.wiki/images/Purple_slayer_helmet.png",
    style: TIER_STYLES.PURPLE
  }
];

// Using Casket Item IDs for uniform visuals
const CLUE_SCROLLS = [
  { tier: "Beginner", source: DropSource.CLUE_BEGINNER, itemId: 23245 }, // Reward casket (beginner)
  { tier: "Easy", source: DropSource.CLUE_EASY, itemId: 20546 },     // Reward casket (easy)
  { tier: "Medium", source: DropSource.CLUE_MEDIUM, itemId: 20545 },   // Reward casket (medium)
  { tier: "Hard", source: DropSource.CLUE_HARD, itemId: 20544 },     // Reward casket (hard)
  { tier: "Elite", source: DropSource.CLUE_ELITE, itemId: 20543 },    // Reward casket (elite)
  { tier: "Master", source: DropSource.CLUE_MASTER, itemId: 19836 },   // Reward casket (master)
];

export const ActionSection: React.FC = () => {
  const { rollForKey } = useGame();

  const handleRoll = (source: string, chance: number, e: React.MouseEvent) => {
    rollForKey(source, chance, e.clientX, e.clientY);
  };

  return (
    <div className="h-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Slayer & Collection Log */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#888] uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-1">
              <img src={OSRS_ICONS.SLAYER} alt="Slayer" className="w-3.5 h-3.5 object-contain opacity-70" />
              Slayer Tasks
            </h3>
            <div className="flex flex-col gap-3">
              {SLAYER_MASTERS.map((master) => (
                <SlayerMasterCard 
                  key={master.name}
                  name={master.name} 
                  subText={master.subText}
                  source={master.source}
                  image={master.image}
                  style={master.style}
                  onClick={(e) => handleRoll(master.source, DROP_RATES[master.source], e)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-[#111] border border-dashed border-[#333] px-3 py-3 rounded text-[10px] text-gray-500 flex flex-col items-center justify-center text-center font-mono gap-1 hover:border-amber-900/50 transition-colors group cursor-help">
               <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-bold text-amber-500 uppercase tracking-wide">Collection Log</span>
               </div>
               <span className="text-gray-400 leading-tight">Log new unique items in the <br/><span className="text-amber-200">Collection Log Tab</span> to roll.</span>
               <div className="mt-1 px-2 py-0.5 bg-amber-900/20 rounded border border-amber-900/30 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                  20% Drop Chance
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Clue Scrolls & Info Panels */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#888] uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-1">
              <img src={OSRS_ICONS.CLUE} alt="Clue" className="w-3.5 h-3.5 object-contain opacity-70" />
              Clue Scrolls
            </h3>
            <div className="flex flex-col gap-3">
              {CLUE_SCROLLS.map((clue) => (
                <ClueScrollCard 
                  key={clue.tier}
                  tier={clue.tier} 
                  source={clue.source} 
                  itemId={clue.itemId} 
                  onClick={(e) => handleRoll(clue.source, DROP_RATES[clue.source], e)} 
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
             <div className="w-full bg-[#111] border border-dashed border-[#333] px-3 py-3 rounded text-[10px] text-gray-500 flex flex-col items-center justify-center text-center font-mono gap-1 hover:border-blue-900/50 transition-colors group cursor-help">
               <div className="flex items-center gap-2 mb-1">
                  <img src={OSRS_ICONS.STATS} alt="" className="w-3.5 h-3.5" />
                  <span className="font-bold text-blue-500 uppercase tracking-wide">Skill Rolling</span>
               </div>
               <span className="text-gray-400 leading-tight">Click unlocked skills in the <br/><span className="text-blue-200">Dashboard</span> to roll.</span>
               <div className="mt-1 px-2 py-0.5 bg-blue-900/20 rounded border border-blue-900/30 text-blue-400 font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                  Chance = Level / 3 (Max 33%)
               </div>
             </div>

             <div className="w-full bg-[#111] border border-dashed border-[#333] px-3 py-3 rounded text-[10px] text-gray-500 flex flex-col items-center justify-center text-center font-mono gap-1 hover:border-cyan-900/50 transition-colors group cursor-help">
               <div className="flex items-center gap-2 mb-1">
                  <ScrollText className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="font-bold text-cyan-500 uppercase tracking-wide">Journal Activities</span>
               </div>
               <span className="text-gray-400 leading-tight">Complete Quests, Diaries & CAs <br/>in the <span className="text-cyan-200">Journal Tab</span>.</span>
               <div className="mt-1 px-2 py-0.5 bg-cyan-900/20 rounded border border-cyan-900/30 text-cyan-400 font-bold shadow-[0_0_10px_rgba(34,211,238,0.1)] group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
                  Variable Rates (10% - 100%)
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
