export interface LessonStage {
  name: string;
  duration: number;
}

export interface LessonTemplate {
  id: string;
  title: string;
  stages: LessonStage[];
  custom?: boolean;
}

// === ФЛЭШ-КАРТОЧКИ ===
export interface FlashCard {
  id: string;
  sides: string[]; // 2 стороны = Lame, 3+ = Insane
  status: 'new' | 'learning' | 'learned' | 'mistake';
  lastReviewed?: number;
  errorCount?: number;
}

export interface Deck {
  id: string;
  title: string;
  cards: FlashCard[];
  createdAt: number;
  lastStudied?: number;
}
