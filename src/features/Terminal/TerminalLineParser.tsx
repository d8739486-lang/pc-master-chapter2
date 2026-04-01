import { memo } from 'react';

/**
 * Parses terminal lines and converts bracketed wrapped words [command] into clickable buttons.
 */
const TerminalLineParser = ({ text, onCommandClick, disabled }: { text: string; onCommandClick: (cmd: string) => void; disabled: boolean }) => {
  if (!text) return null;

  // Split string by [...]
  const parts = text.split(/(\[[\w_ \-\.]+\])/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const cmd = part.slice(1, -1);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onCommandClick(cmd)}
              disabled={disabled}
              className={`font-black uppercase tracking-wider mx-1 transition-all duration-300 border-b-2 ${
                disabled
                  ? 'text-white/20 border-white/5 cursor-not-allowed'
                  : 'text-emerald-500 border-emerald-500/40 hover:text-white hover:border-white cursor-pointer'
              }`}
            >
              {cmd}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export default memo(TerminalLineParser);
