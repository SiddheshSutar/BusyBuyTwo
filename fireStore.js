import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//     apiKey: "AIzaSyDq0EnMGd-6qrcIZ0qUQvKxIDJV5uRvtKs",
//     authDomain: "test-project-559e1.firebaseapp.com",
//     projectId: "test-project-559e1",
//     storageBucket: "test-project-559e1.appspot.com",
//     messagingSenderId: "418042337809",
//     appId: "1:418042337809:web:e05f4adbfb8d9d02286fb0",
//     measurementId: "G-7DTEW2E7PY"
// };
const firebaseConfig = {
    apiKey: "AIzaSyAnt-e0lckaGo0yOmb5LoIvR1EYHqZ8-uM",
    authDomain: "cndemo-164b6.firebaseapp.com",
    projectId: "cndemo-164b6",
    storageBucket: "cndemo-164b6.appspot.com",
    databaseURL: "https://cndemo-164b6-default-rtdb.asia-southeast1.firebasedatabase.app",
    messagingSenderId: "250579447634",
    appId: "1:250579447634:web:c7b3e7d5bdab485b99148b"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage();

export { db, storage }