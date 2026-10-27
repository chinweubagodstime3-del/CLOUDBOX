
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZP4tGHg6JQykxjoDi_A-28ByDyoBoEw4",
  authDomain: "cloudbox-8e242.firebaseapp.com",
  projectId: "cloudbox-8e242",
  storageBucket: "cloudbox-8e242.firebasestorage.app",
  messagingSenderId: "404482766667",
  appId: "1:404482766667:web:332e73bcb9e366130e1ace",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
