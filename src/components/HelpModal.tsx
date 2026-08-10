import { useEffect } from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function HelpModal({ isOpen, onClose, title, content }: HelpModalProps) {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Блокируем прокрутку фона
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-200"
      onClick={onClose} // Закрытие по клику на фон
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на контент
      >
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-purple-700">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Содержимое */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed text-base">
            {content}
          </p>
        </div>
        
        {/* Кнопка закрытия внизу */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
