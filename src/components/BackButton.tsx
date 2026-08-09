import { ArrowLeft } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptic';

interface BackButtonProps {
  onClick: () => void;
  variant?: 'light' | 'dark';
}

export default function BackButton({ onClick, variant = 'dark' }: BackButtonProps) {
  const isLight = variant === 'light';
  return (
    <button
      onClick={() => {
        triggerHaptic('light');
        onClick();
      }}
      className="flex items-center min-h-10 touch-manipulation transition-all duration-200 active:scale-95"
      aria-label="Назад"
    >
      <span
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
          isLight
            ? 'bg-white/20 hover:bg-white/30'
            : 'bg-purple-100 hover:bg-purple-200'
        }`}
      >
        <ArrowLeft
          className={isLight ? 'text-white' : 'text-purple-700'}
          size={24}
        />
      </span>
      <span
        className={`text-sm font-medium ml-2 ${
          isLight ? 'text-white' : 'text-purple-700'
        }`}
      >
        Назад
      </span>
    </button>
  );
}
