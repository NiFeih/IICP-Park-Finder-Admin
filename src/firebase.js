import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBzP3U6v3O6wm488k6wHfzVOhmKrvFrQGI",
  authDomain: "iparkfinder-d049e.firebaseapp.com",
  projectId: "iparkfinder-d049e",
  storageBucket: "iparkfinder-d049e.appspot.com",
  messagingSenderId: "55426688816",
  appId: "1:55426688816:web:a379dbb3bd4aef9387caf5"
};

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)