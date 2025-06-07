export interface Message {
  type: string;
  user: string;
  text?: string;
  url?: string;
  createdAt: Date;
  channel: string;
}
