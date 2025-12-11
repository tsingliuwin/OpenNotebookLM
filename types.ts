export interface Source {
  id: string;
  title: string;
  type: 'pdf' | 'text' | 'web' | 'copied';
  content: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export enum NoteType {
  SUMMARY = 'Summary',
  PODCAST = 'Audio Overview',
  FAQ = 'FAQ',
  STUDY_GUIDE = 'Study Guide'
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
}

export interface Notebook {
  id: string;
  title: string;
  sources: Source[];
  messages: ChatMessage[];
  notes: Note[];
  updatedAt: number;
}

export type ViewState = 'home' | 'notebook';
