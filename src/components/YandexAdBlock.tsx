import { useEffect, useRef } from 'react';

const SCRIPT_SOURCES = [
  'https://yandex.ru/ads/system/context.js',
  'https://yandex.ru/ads/system/ap-loader.js',
];

export default function YandexAdBlock() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];

    SCRIPT_SOURCES.forEach((src) => {
      const existing = document.querySelector(
        `script[src="${src}"]`,
      );
      if (existing) return;
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      if (src.includes('ap-loader')) {
        script.setAttribute('data-page-id', '19699585');
      }
      document.body.appendChild(script);
      scripts.push(script);
    });

    return () => {
      scripts.forEach((s) => s.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto mt-4 mb-4 p-2 bg-gray-100 rounded-lg"
    >
      <div id="yandex_rtb_R-A-19699585" className="w-full" />
    </div>
  );
}
