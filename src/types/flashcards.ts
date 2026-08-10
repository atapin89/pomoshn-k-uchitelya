export interface FlashCard {
  id: string;
  sides: string[]; // 2 стороны = Lame, 3+ = Insane
  status: 'new' | 'learning' | 'learned' | 'mistake';
}

export interface Deck {
  id: string;
  title: string;
  cards: FlashCard[];
  createdAt: number;
}
