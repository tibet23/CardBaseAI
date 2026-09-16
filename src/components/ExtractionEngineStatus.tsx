import React from 'react';
import { Cloud, Smartphone, Wifi, WifiOff } from 'lucide-react';

interface ExtractionEngineStatusProps {
  isOffline: boolean;
  activeProcessingEngine?: 'gemini' | 'local' | null;
  className?: string;
  compact?: boolean;
}

export const ExtractionEngineStatus: React.FC<ExtractionEngineStatusProps> = ({
  isOffline,
  activeProcessingEngine = null,
  className = '',
  compact = false,
}) => {
  const isOnline = !isOffline;

  if (compact) {
    return (
      <div
        id="engine-status-compact"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
          isOnline
            ? 'bg-blue-950/40 text-blue-300 border-blue-800/80'
            : 'bg-amber-950/40 text-amber-300 border-amber-800/80'
        } ${className}`}
        title={
          isOnline
            ? 'Dual-Engine: Gemini 3.7 Vision Cloud Pipeline Active'
            : 'Dual-Engine: Offline Local OCR Queue Active'
        }
      >
        {isOnline ? (
          <>
            <Cloud className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="truncate">Gemini Vision Active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          </>
        ) : (
          <>
            <Smartphone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Local OCR Queue</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </>
        )}
      </div>
    );
  }

  return (
    <div
      id="engine-status-indicator"
      className={`inline-flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl border text-xs transition-colors backdrop-blur-xs ${
        isOnline
          ? 'bg-blue-900/20 dark:bg-blue-950/50 border-blue-200/80 dark:border-blue-800/60 text-blue-900 dark:text-blue-200'
          : 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-300/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
      } ${className}`}
    >
      <div className="flex items-center space-x-2 min-w-0">
        <div
          className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
            isOnline
              ? 'bg-blue-600 text-white'
              : 'bg-amber-600 text-white'
          }`}
        >
          {isOnline ? (
            <Cloud className="h-4 w-4" />
          ) : (
            <Smartphone className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5 font-bold text-xs leading-tight">
            <span>
              {isOnline ? 'Gemini Vision Active' : 'Local OCR Queue'}
            </span>
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
            {isOnline
              ? 'Cloud Multi-Card Neural Parser (Online)'
              : 'On-Device Zero-Network Queue (Offline)'}
          </div>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shrink-0">
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3 text-emerald-500" />
            <span>CLOUD SPEED</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-amber-500" />
            <span>OFFLINE LOCAL</span>
          </>
        )}
      </div>
    </div>
  );
};
