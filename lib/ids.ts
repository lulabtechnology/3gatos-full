export type ID = string;
export function newId(): ID { return crypto.randomUUID(); }
