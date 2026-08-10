import { useEffect } from 'react';

export default function YandexAdBlock() {
  useEffect(() => {
    // Проверяем, чтобы не добавлять скрипты дважды при переходе между страницами
    
    // 1. Скрипт context.js
    if (!document.querySelector('script[src="https://yandex.ru/ads/system/context.js"]')) {
      const script1 = document.createElement('script');
      script1.src = 'https://yandex.ru/ads/system/context.js';
      script1.async = true;
      document.head.appendChild(script1);
    }

    // 2. Скрипт ap-loader.js с ID страницы
    if (!document.querySelector('script[data-page-id="19699585"]')) {
      const script2 = document.createElement('script');
      script2.src = 'https://yandex.ru/ads/system/ap-loader.js';
      script2.setAttribute('data-page-id', '19699585');
      script2.async = true;
      document.head.appendChild(script2);
    }
  }, []);

  // Компонент ничего не отображает визуально, он только управляет скриптами.
  // Яндекс сам найдет места для вставки рекламы на странице.
  return null;
}
