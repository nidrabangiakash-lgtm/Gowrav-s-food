import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCNgc33YMJhpIi_6nCdzIN8fXME7RSyvLQ",
  authDomain: "gowrav-s-food.firebaseapp.com",
  databaseURL: "https://gowrav-s-food-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "gowrav-s-food",
  storageBucket: "gowrav-s-food.firebasestorage.app",
  messagingSenderId: "101872211463",
  appId: "1:101872211463:web:5ced02f7c05656438fbca2",
  measurementId: "G-FTBMWQRG5C"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
