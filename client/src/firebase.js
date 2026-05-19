import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
//goyatree
const firebaseConfig = {
  apiKey: "AIzaSyDgJVaSkfWfZCXcHHqmMjj8NGtzaA3D2tA",
  authDomain: "goyatree.firebaseapp.com",
  projectId: "goyatree",
  storageBucket: "goyatree.firebasestorage.app",
  messagingSenderId: "327256114574",
  appId: "1:327256114574:web:e7290be6bfa364915f90df"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);