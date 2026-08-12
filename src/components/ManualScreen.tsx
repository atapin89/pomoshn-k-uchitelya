import { ArrowLeft, Clock, Dices, Volume2, Layers, Grid3x3, BookOpen, Lightbulb } from 'lucide-react';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';

export default function ManualScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-5 py-4">
          <BackButton onClick={onBack} variant="light" />
          <h1 className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Руководство
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 space-y-6 pb-8 overflow-y-auto">
        
        {/* Введение */}
        <section className="bg-white rounded-2xl shadow-sm p-5 border border-purple-100">
          <h2 className="text-lg font-bold text-purple-700 mb-2">Как запустить</h2>
          <p className="text-sm text-gray-600 mb-3">Приложение работает прямо в мессенджере MAX, ничего скачивать не нужно.</p>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>Перейдите по ссылке на бота приложения.</li>
            <li>Нажмите кнопку <strong>«Запустить»</strong> (или «Старт») в чате.</li>
            <li>В открывшемся окне нажмите кнопку <strong>«Старт»</strong>.</li>
          </ol>
        </section>

        {/* Таймер */}
        <section className="bg-white rounded-2xl shadow-sm p-5 border border-purple-100">
          <h2 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" /> 1. Таймер урока
          </h2>
          <p className="text-sm text-gray-600 mb-3">Визуальный контроль времени и управление темпом занятия.</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-3">
            <li>Готовые шаблоны (стандартный урок, контрольная, пятиминутка).</li>
            <li>Цветовая индикация: 🟢 Зеленый → 🟠 Оранжевый → 🔴 Красный.</li>
            <li>Тактильная вибрация при смене этапа.</li>
          </ul>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <p className="text-xs font-semibold text-purple-800 flex items-center gap-1 mb-1">
              <Lightbulb className="w-4 h-4" /> Сценарий:
            </p>
            <p className="text-xs text-purple-700">Выведите таймер на проектор. Ученики видят, сколько времени осталось на задание, и сами следят за темпом, не отвлекая вас вопросами.</p>
          </div>
        </section>

        {/* Жеребьёвка */}
        <section className="bg-white rounded-2xl shadow-sm p-5 border border-purple-100">
          <h2 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
            <Dices className="w-5 h-5 text-purple-500" /> 2. Жеребьёвка
          </h2>
          <p className="text-sm text-gray-600 mb-3">Объективный и игровой способ выбора учеников. Список класса сохраняется автоматически.</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-3">
            <li><strong>Выбрать одного:</strong> Анимация «Колесо фортуны» с плавным замедлением.</li>
            <li><strong>Разделить на группы:</strong> Равномерное случайное распределение.</li>
            <li><strong>Случайная рассадка:</strong> Генерация схемы класса по рядам и колонкам.</li>
            <li>Результаты можно скопировать или отправить.</li>
          </ul>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <p className="text-xs font-semibold text-purple-800 flex items-center gap-1 mb-1">
              <Lightbulb className="w-4 h-4" /> Сценарий:
            </p>
            <p className="text-xs text-purple-700">Запустите колесо фортуны вместо традиционного вызова к доске. Это превращает процесс в игру и снимает с учителя обвинения в предвзятости.</p>
          </div>
        </section>

        {/* Контроль шума */}
        <section className="bg-white rounded-2xl shadow-sm p-5 border border-purple-100">
          <h2 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-500" /> 3. Контроль шума
          </h2>
          <p className="text-sm text-gray-600 mb-3">Геймифицированный индикатор громкости, работающий через микрофон.</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-3">
            <li>Объекты (шарики/смайлики) подпрыгивают при повышении шума.</li>
            <li>Настройка чувствительности под акустику кабинета.</li>
            <li>При превышении порога: звуковой сигнал и красный экран с надписью «ТИШЕ!».</li>
          </ul>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <p className="text-xs font-semibold text-purple-800 flex items-center gap-1 mb-1">
              <Lightbulb className="w-4 h-4" /> Сценарий:
            </p>
            <p className="text-xs text-purple-700">Выведите экран на проектор во время групповой работы. Ученики сами регулируют громкость, чтобы не «зажечь» красный экран.</p>
          </div>
        </section>

        {/* Флэш-карточки */}
        <section className="bg-white rounded-2xl shadow-sm p-5 border border-purple-100">
          <h2 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-500" /> 4. Флэш-карточки
          </h2>
          <p className="text-sm text-gray-600 mb-3">Система интервального повторения для запоминания терминов и правил.</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-3">
            <li>Создание колод с неограниченным количеством сторон.</li>
            <li>Режим изучения: оценка «Знаю» или «Повторить».</li>
            <li>Режим проверки: тесты с выбором ответа или вводом текста.</li>
          </ul>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <p className="text-xs font-semibold text-purple-800 flex items-center gap-1 mb-1">
              <Lightbulb className="w-4 h-4" /> Сценарий:
            </p>
            <p className="text-xs text-purple-700">Используйте первые 5 минут урока для разминки: выводите карточки на проектор, а класс хором дает ответы.</p>
          </div>
        </section>

        {/* Генератор филвордов */}
        <section className="bg-white rounded-2xl shadow-sm p-5 border border-purple-100">
          <h2 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-purple-500" /> 5. Генератор филвордов
          </h2>
          <p className="text-sm text-gray-600 mb-3">Мгновенное создание головоломок «Найди слово» для печати или отправки в чат.</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-3">
            <li>Настройка размера сетки (10×10, 15×15, 20×20) и сложности.</li>
            <li>Пакетная генерация до 30 уникальных вариантов за раз.</li>
            <li>Режим «Ответы»: подсветка слов и красные стрелки направления чтения.</li>
            <li>Экспорт в PNG (для телефона) или PDF (для компьютера).</li>
          </ul>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <p className="text-xs font-semibold text-purple-800 flex items-center gap-1 mb-1">
              <Lightbulb className="w-4 h-4" /> Сценарий:
            </p>
            <p className="text-xs text-purple-700">Идеальный «заполнитель» на последние 7-10 минут урока. Сгенерируйте филворд по новой теме и отправьте скриншот в учебный чат.</p>
          </div>
        </section>

        {/* Общие советы */}
        <section className="bg-violet-100 rounded-2xl p-5 border border-violet-200">
          <h2 className="text-lg font-bold text-violet-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" /> Общие советы
          </h2>
          <ul className="list-disc list-inside text-sm text-violet-900 space-y-2">
            <li>Для работы «Контроля шума» разрешите приложению MAX доступ к микрофону в настройках телефона.</li>
            <li>Список класса в «Жеребьёвке» сохраняется автоматически. Введите его один раз.</li>
            <li>Максимальный эффект достигается при выводе Таймера, Жеребьёвки и Шумомера на проектор.</li>
            <li>Скачивание PDF с филвордами стабильнее всего работает с компьютера.</li>
          </ul>
        </section>

        <YandexAdBlock />
      </main>
    </div>
  );
}
