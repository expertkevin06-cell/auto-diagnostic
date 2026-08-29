const DB = {
  name: 'AutoDiagnostic_DB',
  version: 3,
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('vehicles')) {
          const store = db.createObjectStore('vehicles', { keyPath: 'id', autoIncrement: true });
          store.createIndex('region', 'region', { unique: false });
          store.createIndex('country', 'country', { unique: false });
          store.createIndex('brand', 'brand', { unique: false });
          store.createIndex('model', 'model', { unique: false });
          store.createIndex('year', 'year', { unique: false });
          store.createIndex('fuelType', 'fuelType', { unique: false });
        }

        if (!db.objectStoreNames.contains('dtcCodes')) {
          const store = db.createObjectStore('dtcCodes', { keyPath: 'code', autoIncrement: false });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('severity', 'severity', { unique: false });
          store.createIndex('brand', 'brand', { unique: false });
          store.createIndex('system', 'system', { unique: false });
        }

        if (!db.objectStoreNames.contains('recalls')) {
          const store = db.createObjectStore('recalls', { keyPath: 'id', autoIncrement: true });
          store.createIndex('brand', 'brand', { unique: false });
          store.createIndex('model', 'model', { unique: false });
          store.createIndex('year', 'year', { unique: false });
          store.createIndex('source', 'source', { unique: false });
        }

        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          store.createIndex('firstName', 'firstName', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => reject(event.target.error);
    });
  },

  async add(storeName, data) {
    const tx = this.db.transaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(storeName).add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async getAll(storeName) {
    const tx = this.db.transaction(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async get(storeName, key) {
    const tx = this.db.transaction(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async update(storeName, data) {
    const tx = this.db.transaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(storeName).put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async delete(storeName, key) {
    const tx = this.db.transaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(storeName).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getByIndex(storeName, indexName, value) {
    const tx = this.db.transaction(storeName, 'readonly');
    const index = tx.objectStore(storeName).index(indexName);
    return new Promise((resolve, reject) => {
      const req = index.getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async clear(storeName) {
    const tx = this.db.transaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(storeName).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async query(storeName, predicate) {
    const all = await this.getAll(storeName);
    return all.filter(predicate);
  }
};
