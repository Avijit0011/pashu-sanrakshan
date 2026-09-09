import Dexie, { Table } from 'dexie';
import { DiseaseReport, Animal, SyncStatus } from '@/types';

export interface OfflineReportRecord extends Omit<DiseaseReport, 'id'> {
  id?: string;
  local_id: string;
  sync_status: SyncStatus;
  retry_count: number;
  last_error?: string;
}

export interface OfflineAnimalRecord extends Omit<Animal, 'id'> {
  id?: string;
  local_id: string;
  sync_status: SyncStatus;
}

export class PashuMitraDexieDB extends Dexie {
  offlineReports!: Table<OfflineReportRecord>;
  offlineAnimals!: Table<OfflineAnimalRecord>;

  constructor() {
    super('PashuMitraOfflineDB');
    this.version(1).stores({
      offlineReports: 'local_id, id, animal_id, sync_status, created_at',
      offlineAnimals: 'local_id, id, owner_id, species, sync_status',
    });
  }
}

export const db = new PashuMitraDexieDB();
