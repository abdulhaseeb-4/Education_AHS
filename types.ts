export interface MCQ {
  id: string;
  subject: string;
  term: string;
  question: string;
  options: Record<string, string>;
  answer: string;
  explanation: string;
}

export interface AppState {
  view: 'subjects' | 'terms' | 'quiz';
  selectedSubject: string | null;
  selectedTerm: string | null;
  mcqList: MCQ[];
  currentIndex: number;
  score: { correct: number; wrong: number };
  bookmarks: string[];
  userAnswers: Record<number, string>; // index -> selected option key
}

export type Theme = 'light' | 'dark';