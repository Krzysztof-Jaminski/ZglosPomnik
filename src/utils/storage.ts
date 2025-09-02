import { Tree, NewTreeReport } from '../types';

interface StoredData {
  pendingReports: NewTreeReport[];
  cachedTrees: Tree[];
  lastSync: string;
}

class OfflineStorage {
  private readonly STORAGE_KEY = 'treemapper-data';

  private getData(): StoredData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      pendingReports: [],
      cachedTrees: [],
      lastSync: new Date().toISOString()
    };
  }

  private setData(data: StoredData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  addPendingReport(report: NewTreeReport): void {
    const data = this.getData();
    data.pendingReports.push(report);
    this.setData(data);
  }

  getPendingReports(): NewTreeReport[] {
    return this.getData().pendingReports;
  }

  clearPendingReports(): void {
    const data = this.getData();
    data.pendingReports = [];
    this.setData(data);
  }

  cacheTrees(trees: Tree[]): void {
    const data = this.getData();
    data.cachedTrees = trees;
    data.lastSync = new Date().toISOString();
    this.setData(data);
  }

  getCachedTrees(): Tree[] {
    return this.getData().cachedTrees;
  }

  getLastSync(): string {
    return this.getData().lastSync;
  }
}

export const storage = new OfflineStorage();