import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEhPfZlL9QoP2Yy5HiP19D0f4uqJJLer0",
  authDomain: "windsurf-estetica.firebaseapp.com",
  projectId: "windsurf-estetica",
  storageBucket: "windsurf-estetica.firebasestorage.app",
  messagingSenderId: "753925918026",
  appId: "1:753925918026:web:f1304b47411e373d8985b3",
  measurementId: "G-0GWMXD2DLF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);