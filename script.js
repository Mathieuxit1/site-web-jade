// 🔥 Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔑 CONFIG FIREBASE (REMPLACE PAR LES TIENNES)
const firebaseConfig = {
  apiKey: "AIzaSyDMAtecFv0LJGJQsB9JaMtVSRKXVbv14t4",
  authDomain: "jade-9d44e.firebaseapp.com",
  projectId: "jade-9d44e",
};

// 🚀 Initialisation
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔗 Connexion au HTML
const username = document.getElementById("username");
const message = document.getElementById("message");
const postBtn = document.getElementById("postBtn");
const postsDiv = document.getElementById("posts");

// ➕ Publier un message
postBtn.addEventListener("click", async () => {
  if (!username.value || !message.value) {
    alert("Merci de remplir tous les champs ❗");
    return;
  }

  await addDoc(collection(db, "posts"), {
    user: username.value,
    msg: message.value,
    createdAt: Date.now()
  });

  message.value = "";
});

// 👀 Affichage des messages (TEMPS RÉEL)
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

onSnapshot(q, snapshot => {
  postsDiv.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <strong>${data.user}</strong>
      <p>${data.msg}</p>
    `;

    postsDiv.appendChild(div);
  });
});
