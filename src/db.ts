import Dexie, { Table } from 'dexie';
import { Trip, InventoryItem } from './types';

export class PackMateDatabase extends Dexie {
  trips!: Table<Trip>;
  inventory!: Table<InventoryItem>;

  constructor() {
    super('PackMateDB');
    this.version(1).stores({
      trips: 'id, name, startDate', // Primary key and indexes
      inventory: 'id, name, category'
    });
  }
}

export const db = new PackMateDatabase();
