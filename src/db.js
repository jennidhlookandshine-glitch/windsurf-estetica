import { openDB } from 'idb';

const dbPromise = openDB('PymeJennifer', 1, {
  upgrade(db) {
    db.createObjectStore('clientas', { keyPath: 'id' });
    db.createObjectStore('eventos', { keyPath: 'id' });
  },
});

export const getAll = async (store) => {
  const db = await dbPromise;
  return db.getAll(store);
};

export const putAll = async (store, items) => {
  const db = await dbPromise;
  const tx = db.transaction(store, 'readwrite');
  items.forEach(item => tx.store.put(item));
  await tx.done;
};
