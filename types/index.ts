export interface User {
  _id: string;
  email: string;
  password: string;
  posts: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  _id: string;
  user: string;
  title: string;
  content: string;
  contentHtml?: string;
  text?: string;
  date?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteInput {
  title: string;
  content: string;
}

export interface UserInput {
  email: string;
  password: string;
}

export interface AiGenerateRequest {
  action: 'generate_ai';
  Prompt: string;
  contextHtml?: string;
  contentOfPost?: string;
}

export interface AiGenerateResponse {
  ok: boolean;
  reply?: string;
  error?: string;
}
