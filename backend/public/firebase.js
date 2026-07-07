import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBIs--ZwnItTsuAlBjrwWGhLGrOjplZm94",
    authDomain: "rodio-e9496.firebaseapp.com",
    projectId: "rodio-e9496",
    storageBucket: "rodio-e9496.firebasestorage.app",
    messagingSenderId: "1059089720949",
    appId: "1:1059089720949:web:bc904c5670d86e20c53a3c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);