import { db } from './firebase';

import {
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

// GUARDAR DATOS
export const saveData = async (key, data) => {
  await setDoc(doc(db, 'app', key), {
    value: data
  });
};

// CARGAR DATOS
export const loadData = async (key) => {
  const docRef = doc(db, 'app', key);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().value;
  }

  return null;
};