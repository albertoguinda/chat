export type SystemMessage = { type: "system"; text: string };
export type UserMessage = { type: "message"; user: string; text: string };
export type TypingMessage = { type: "typing"; user: string };
export type ConnectedUsersMessage = { type: "connectedUsers"; users: { user: string; avatar: string }[] };
export type ImageMessage = { type: "image"; user: string; url: string };
export type GifMessage = { type: "gif"; user: string; url: string };

export type Message =
  | SystemMessage
  | UserMessage
  | TypingMessage
  | ConnectedUsersMessage
  | ImageMessage
  | GifMessage;
