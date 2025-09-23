import { Tree } from '../types';

interface StoredData {
  cachedTrees: Tree[];
  lastSync: string;
}

class OfflineStorage {
  private readonly STORAGE_KEY = 'zglospomnik-data';

  private getData(): StoredData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      cachedTrees: [],
      lastSync: new Date().toISOString()
    };
  }

  private setData(data: StoredData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
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