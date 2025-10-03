import Dexie, { Table } from 'dexie';

export interface OfflineEvent {
  id: string;
  name: string;
  updatedAt: Date;
}

class MonoticketsDB extends Dexie {
  events!: Table<OfflineEvent>;

  constructor() {
    super('MonoticketsDB');
    this.version(1).stores({
      events: 'id, updatedAt'
    });
  }
}

export const db = new MonoticketsDB();
