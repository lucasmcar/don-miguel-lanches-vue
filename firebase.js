// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAPRr6TyMv7UoMLUVGQWDZ48QsMUVB6a9Y",
    authDomain: "don-ramon-lanches.firebaseapp.com",
    projectId: "don-ramon-lanches",
    storageBucket: "don-ramon-lanches.firebasestorage.app",
    messagingSenderId: "1083061006013",
    appId: "1:1083061006013:web:7a8de2edd3b321a86551d4",
    measurementId: "G-6XE337TTC0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
