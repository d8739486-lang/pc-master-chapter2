import { useGameStore } from '@/core/store';
import { useModalStore } from '@/core/useModalStore';
import { X, Volume2, Music, Zap } from 'lucide-react';
import { useI18n } from '@/core/i18n';

interface IVolumeSliderProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
}

const VolumeSlider = ({ icon, label, value, onChange }: IVolumeSliderProps) => {
  const percent = Math.round(value * 100);

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="text-primary/80 shrink-0 [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-[11px] tracking-widest uppercase font-bold">{label}</span>
          <span className="text-primary text-xs font-black tabular-nums">{percent}%</span>
        </div>
        <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
            style={{ 
              width: `${percent}%`, 
              backgroundColor: 'var(--theme-primary)',
              boxShadow: `0 0 10px var(--theme-primary)`,
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={percent}
            onChange={(e) => onChange(Number(e.target.value) / 100)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export const SettingsPanel = () => {
  const { closeModal } = useModalStore();
  const { masterVolume, musicVolume, sfxVolume, setMasterVolume, setMusicVolume, setSfxVolume } = useGameStore();
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-center h-full w-full p-4">
      <div className="relative w-full max-w-md bg-black/90 border border-primary/30 rounded-sm shadow-[0_0_60px_rgba(157,0,255,0.15)] backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-primary" />
            <h2
              className="text-base font-black uppercase tracking-[0.3em] text-primary"
              style={{ textShadow: '0 0 15px var(--theme-primary)' }}
            >
              {t('settings.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-sm transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Controls */}
        <div className="px-6 py-3 flex flex-col divide-y divide-white/5">
          <VolumeSlider
            icon={<Volume2 />}
            label={t('settings.master')}
            value={masterVolume}
            onChange={setMasterVolume}
          />
          <VolumeSlider
            icon={<Music />}
            label={t('settings.music')}
            value={musicVolume}
            onChange={setMusicVolume}
          />
          <VolumeSlider
            icon={<Zap />}
            label={t('settings.sfx')}
            value={sfxVolume}
            onChange={setSfxVolume}
          />
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-white/5 text-center">
          <span className="text-white/20 text-[9px] tracking-[0.4em] uppercase">
            {t('settings.autosave')}
          </span>
        </div>
      </div>
    </div>
  );
};
