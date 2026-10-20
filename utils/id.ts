// Ids are created on the device (the app works offline), so they have to be
// unique across devices without asking the server.
export const createId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
