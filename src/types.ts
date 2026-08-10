export interface Stage {
  name: string;
  duration: number; // minutes
}

export interface LessonTemplate {
  id: string;
  name: string;
  stages: Stage[];
  custom?: boolean;
}

export type FlashCardStatus = 'new' | 'learning' | 'learned' | 'mistake';

export interface FlashCard {
  id: string;
  sides: string[]; // 2 sides = "Lame", 3+ sides = "Insane"
  status: FlashCardStatus;
  lastReviewed?: number;
  errorCount?: number;
}

export interface Deck {
  id: string;
  title: string;
  cards: FlashCard[];
  createdAt?: number;
  lastStudied?: number;
}
