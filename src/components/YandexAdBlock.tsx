import { useEffect } from 'react';

export default function YandexAdBlock() {
  useEffect(() => {
    // 1. Добавляем скрипт context.js, если его еще нет на странице
    if (!document.querySelector('script[src="https://yandex.ru/ads/system/context.js"]')) {
      const script1 = document.createElement('script');
      script1.src = 'https://yandex.ru/ads/system/context.js';
      script1.async = true;
      document.head.appendChild(script1);
    }

    // 2. Добавляем скрипт ap-loader.js с ID страницы, если его еще нет
    if (!document.querySelector('script[data-page-id="19699585"]')) {
      const script2 = document.createElement('script');
      script2.src = 'https://yandex.ru/ads/system/ap-loader.js';
      script2.setAttribute('data-page-id', '19699585');
      script2.async = true;
      document.head.appendChild(script2);
    }
  }, []);

  // Компонент ничего не отображает визуально, он только внедряет скрипты.
  // Яндекс Autoplacement сам найдет подходящие места для рекламы на странице.
  return null;
}
