import Dexie, { Table } from 'dexie';
import { Trip, InventoryItem, UserAccount, CustomList, UserProfile } from './types';

export class IsoPackLocalDatabase extends Dexie {
  trips!: Table<Trip>;
  inventory!: Table<InventoryItem>;
  users!: Table<UserAccount>;
  customLists!: Table<CustomList>;
  profiles!: Table<UserProfile>;

  constructor() {
    super('IsoPackLocalDB');
    this.version(2).stores({
      trips: 'id, name, startDate, ownerId',
      inventory: 'id, name, category, ownerId',
      users: 'id, username',
      customLists: 'id, name, ownerId',
      profiles: 'uid, ownerId'
    });
  }
}

export const db = new IsoPackLocalDatabase();
