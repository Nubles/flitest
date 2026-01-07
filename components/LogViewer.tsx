import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Scroll } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface LogViewerProps {
  onShowChronicle: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ onShowChronicle }) => {
  const { history } = useGame();
  const listRef = useRef<List>(null);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (listRef.current && history.length > 0) {
      listRef.current.scrollToItem(history.length - 1, 'end');
    }
  }, [history.length]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const entry = history[index]; 
    
    return (
      <div style={style} className="px-2">
        <div className="border-l-2 pl-2 py-1 border-gray-700 hover:bg-white/5 transition-colors rounded-r h-full flex flex-col justify-center">
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
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Fate Log ({history.length})</h3>
          <button 
            onClick={onShowChronicle}
            className="text-[10px] flex items-center gap-1 text-osrs-gold hover:text-white bg-osrs-gold/10 px-2 py-1 rounded border border-osrs-gold/20 transition-colors"
          >
            <Scroll size={12} /> Chronicle
          </button>
      </div>
      
      <div className="flex-1 min-h-0 border border-white/5 rounded bg-[#111]">
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={listRef}
              height={height}
              itemCount={history.length}
              itemSize={65} // Fixed height for consistent virtualization
              width={width}
              className="custom-scrollbar"
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};