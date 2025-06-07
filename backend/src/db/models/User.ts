export interface User {
  _id?: string;
  user: string;
  password: string; // hashed
  avatar: string;
  channel?: string;
  connected?: boolean;
}
