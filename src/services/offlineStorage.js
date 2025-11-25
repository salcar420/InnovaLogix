import { openDB } from 'idb';

const DB_NAME = 'pos_offline_db';
const STORE_NAME = 'pending_sales';
const DB_VERSION = 1;

const OfflineStorage = {
    async getDB() {
        return openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
            },
        });
    },

    async savePendingSale(sale) {
        const db = await this.getDB();
        // Add a timestamp and ensure it's marked as pending
        const pendingSale = {
            ...sale,
            offlineTimestamp: Date.now(),
            status: 'pending_sync'
        };
        return db.add(STORE_NAME, pendingSale);
    },

    async getPendingSales() {
        const db = await this.getDB();
        return db.getAll(STORE_NAME);
    },

    async removePendingSale(id) {
        const db = await this.getDB();
        return db.delete(STORE_NAME, id);
    },

    async clearPendingSales() {
        const db = await this.getDB();
        return db.clear(STORE_NAME);
    },

    async countPendingSales() {
        const db = await this.getDB();
        return db.count(STORE_NAME);
    }
};

export default OfflineStorage;
