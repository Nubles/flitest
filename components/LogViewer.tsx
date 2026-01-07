import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Scroll, List as ListIcon, Clock } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { wikiService } from '../services/WikiService';
import { TableType, LogEntry } from '../types';
import { REGION_ICONS, SLOT_CONFIG, SPECIAL_ICONS, UTILITY_ITEM_IDS } from '../constants';

// Helper to get image URL synchronously if possible
const getStaticImage = (category: string, item: string) => {
    const baseUrl = 'https://oldschool.runescape.wiki/images/';
    if (UTILITY_ITEM_IDS[item]) return `https://chisel.weirdgloop.org/static/img/osrs-sprite/${UTILITY_ITEM_IDS[item]}.png`;
    
    if (category === TableType.SKILLS) return `${baseUrl}${item}_icon.png`;
    if (category === TableType.EQUIPMENT) return SLOT_CONFIG[item] ? `${baseUrl}${SLOT_CONFIG[item].file}` : undefined;
    if (category === TableType.REGIONS) return REGION_ICONS[item] ? `${baseUrl}${REGION_ICONS[item]}` : `${baseUrl}Globe_icon.png`;
    
    return SPECIAL_ICONS[item] ? `${baseUrl}${SPECIAL_ICONS[item]}` : undefined;
};

const TimelineItem: React.FC<{ entry: LogEntry, index: number, total: number }> = ({ entry, index, total }) => {
    const isLevel = entry.type === 'LEVEL_UP';
    const item = isLevel ? entry.meta.skill : entry.meta.item;
    const category = isLevel ? TableType.SKILLS : entry.meta.category;
    const displayItem = isLevel ? `${item} ${entry.meta.level}` : item;

    const [src, setSrc] = useState<string | null>(() => {
        if (isLevel) return `https://oldschool.runescape.wiki/images/${item}_icon.png`;
        return getStaticImage(category, item) || null;
    });

    useEffect(() => {
        let mounted = true;
        if (!src && item && !isLevel) {
            wikiService.fetchImage(item).then(url => {
                if (mounted && url) setSrc(url);
            });
        }
        return () => { mounted = false; };
    }, [item, src, isLevel]);

    const dateStr = new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex flex-col items-center min-w-[120px] relative group px-2 snap-center">
            {/* Connecting Line */}
            <div className={`absolute top-[42px] h-0.5 bg-white/10 -z-10 
                ${index === 0 ? 'left-1/2 w-1/2' : index === total - 1 ? 'left-0 w-1/2' : 'left-0 w-full'}
            `}></div>
            
            <div className="mb-3 text-[10px] text-gray-500 font-mono opacity-60 group-hover:opacity-100 transition-opacity">{dateStr}</div>
            
            <div className={`
                w-12 h-12 bg-[#1a1a1a] border-2 rounded-full flex items-center justify-center shadow-lg transition-all z-10 relative
                ${isLevel ? 'border-blue-500/30 group-hover:border-blue-400' : 'border-osrs-gold/20 group-hover:border-osrs-gold'}
                group-hover:scale-110
            `}>
                {src ? (
                    <img src={src} alt={displayItem} className="w-7 h-7 object-contain drop-shadow-md" />
                ) : (
                    <div className="w-2 h-2 bg-white/20 rounded-full" />
                )}
            </div>
            
            <div className="mt-3 text-center w-full">
                <div className="text-xs font-bold text-gray-300 truncate w-full px-1" title={displayItem}>{displayItem}</div>
                <div className="text-[9px] text-gray-600">{timeStr}</div>
                <div className="text-[8px] text-gray-700 uppercase tracking-wide mt-0.5">{isLevel ? 'Level Up' : category}</div>
            </div>
        </div>
    );
};

interface LogViewerProps {
  onShowChronicle: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ onShowChronicle }) => {
  const { history } = useGame();
  const listRef = useRef<List>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'TIMELINE'>('LIST');

  // Auto-scroll to bottom/end when history changes
  useEffect(() => {
    if (viewMode === 'LIST' && listRef.current && history.length > 0) {
      listRef.current.scrollToItem(history.length - 1, 'end');
    }
    if (viewMode === 'TIMELINE' && scrollContainerRef.current) {
        // Use a slight timeout to allow rendering to complete
        setTimeout(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
            }
        }, 50);
    }
  }, [history.length, viewMode]);

  const unlockHistory = history.filter(h => h.type === 'UNLOCK' || h.type === 'LEVEL_UP');

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const entry = history[index]; 
    
    return (
      <div style={style} className="px-2">
        <div className={`border-l-2 pl-2 py-1 transition-colors rounded-r h-full flex flex-col justify-center ${entry.type === 'UNLOCK' ? 'border-osrs-gold bg-osrs-gold/5' : entry.type === 'LEVEL_UP' ? 'border-blue-500 bg-blue-900/10' : 'border-gray-700 hover:bg-white/5'}`}>
          <div className="flex justify-between text-xs text-gray-500 mb-0.5">
            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
            {entry.type === 'ROLL' && (
              <span className={entry.result === 'SUCCESS' ? 'text-osrs-success' : 'text-osrs-fail'}>
                {entry.result}
              </span>
            )}
          </div>
          <div className="text-gray-300 text-sm truncate" title={entry.message}>
            {entry.message}
          </div>
          {entry.details && (
            <div className="text-xs text-gray-500 mt-0.5 truncate" title={entry.details}>
              {entry.details}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col relative px-3 py-2">
      <div className="flex justify-between items-center mb-2 shrink-0">
          <div className="flex items-center gap-2 bg-[#111] p-1 rounded border border-white/10">
              <button 
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'LIST' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}
                title="List View"
              >
                  <ListIcon size={14} />
              </button>
              <button 
                onClick={() => setViewMode('TIMELINE')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'TIMELINE' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}
                title="Timeline View"
              >
                  <Clock size={14} />
              </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-mono hidden md:inline">
                {viewMode === 'LIST' ? `${history.length} Events` : `${unlockHistory.length} Milestones`}
            </span>
            <button 
                onClick={onShowChronicle}
                className="text-[10px] flex items-center gap-1 text-osrs-gold hover:text-white bg-osrs-gold/10 px-2 py-1 rounded border border-osrs-gold/20 transition-colors"
            >
                <Scroll size={12} /> Chronicle
            </button>
          </div>
      </div>
      
      <div className="flex-1 min-h-0 border border-white/5 rounded bg-[#111] overflow-hidden relative">
        {viewMode === 'LIST' ? (
            <AutoSizer>
            {({ height, width }) => (
                <List
                ref={listRef}
                height={height}
                itemCount={history.length}
                itemSize={65}
                width={width}
                className="custom-scrollbar"
                >
                {Row}
                </List>
            )}
            </AutoSizer>
        ) : (
            <div 
                ref={scrollContainerRef}
                className="w-full h-full overflow-x-auto overflow-y-hidden custom-scrollbar flex items-center px-4 py-2 snap-x scroll-smooth"
            >
                {unlockHistory.length === 0 ? (
                    <div className="w-full text-center text-gray-500 text-xs italic">
                        No major milestones recorded yet. Unlock something to start your timeline!
                    </div>
                ) : (
                    <div className="flex gap-0">
                        {unlockHistory.map((entry, idx) => (
                            <TimelineItem key={entry.id} entry={entry} index={idx} total={unlockHistory.length} />
                        ))}
                        {/* Spacer at end for visual comfort */}
                        <div className="w-12 shrink-0"></div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
