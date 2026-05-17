import { db } from "./firebase";
import { collection, getDocs, addDoc, setDoc, doc } from "firebase/firestore";

// 🔄 Obtener datos en tiempo real
export const getData = async (coleccion) => {
  const querySnapshot = await getDocs(collection(db, coleccion));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 💾 Guardar lista completa (reemplaza todo)
export const saveData = async (coleccion, data) => {
  const promises = data.map(item => {
    const ref = doc(db, coleccion, item.id.toString());
    return setDoc(ref, item);
  });
  await Promise.all(promises);
};