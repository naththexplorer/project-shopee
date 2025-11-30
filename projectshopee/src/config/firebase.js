// src/config/firebase.js
// Inisialisasi Firebase & Firestore, dipakai seluruh app untuk akses database.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmpS-Md-8HyHbEKS7iktMTd8lGHDueHy4",
  authDomain: "shopee-a72eb.firebaseapp.com",
  projectId: "shopee-a72eb",
  storageBucket: "shopee-a72eb.firebasestorage.app",
  messagingSenderId: "246385523652",
  appId: "1:246385523652:web:abb5082c3ed0b5488c0291",
  measurementId: "G-49J6VYDL6R",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
