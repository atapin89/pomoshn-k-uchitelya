import { useEffect, useState } from 'react';
import { X, Gift, ExternalLink } from 'lucide-react';

interface PromoModalProps {
  onClose: () => void;
}

export default function PromoModal({ onClose }: PromoModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Анимация появления
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleParticipate = () => {
    window.open('https://vk.ru/wall-240839897_83', '_blank');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Затемнённый фон */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Модальное окно */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Градиентный фон сверху */}
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-8 pb-12 relative">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Gift className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            🎁 Розыгрыш книги!
          </h2>
          <p className="text-white/90 text-center text-sm">
            Книга А.Г. Асмолова по психологии личности
          </p>
        </div>

        {/* Содержимое */}
        <div className="p-6 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
            <h3 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Как участвовать?
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              Напишите пост о применении инструментов из «Помощника учителя» с хэштегом 
              <span className="font-bold text-purple-600"> #МойПомощникУчителя</span>
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Расскажите, какой инструмент используете</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Покажите, как это работает на ваших уроках</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Добавьте хэштег #МойПомощникУчителя</span>
              </div>
            </div>
          </div>

          {/* Важные даты */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div className="flex-1">
                <p className="text-xs text-amber-900 font-semibold mb-1">Важные даты:</p>
                <p className="text-sm text-amber-800">
                  <strong>Приём работ:</strong> до 10 ноября<br/>
                  <strong>Итоги:</strong> 15 ноября
                </p>
              </div>
            </div>
          </div>

          {/* Кнопка участия */}
          <button
            onClick={handleParticipate}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
          >
            <ExternalLink className="w-5 h-5" />
            Подробнее о конкурсе
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Удачи всем участникам! 🍀
          </p>
        </div>
      </div>
    </div>
  );
}
