// 🔥 Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔐 Mot de passe admin
const ADMIN_PASSWORD = "tom";
let isAdmin = false;

// 🔑 CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDMAtecFv0LJGJQsB9JaMtVSRKXVbv14t4",
  authDomain: "jade-9d44e.firebaseapp.com",
  projectId: "jade-9d44e",
};

// 🚀 Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔗 Connexion au HTML
const username = document.getElementById("username");
const message = document.getElementById("message");
const postBtn = document.getElementById("postBtn");
const postsDiv = document.getElementById("posts");

const adminPass = document.getElementById("adminPass");
const loginAdmin = document.getElementById("loginAdmin");
const adminStatus = document.getElementById("adminStatus");

// 💾 Charger le prénom sauvegardé
const savedUsername = localStorage.getItem("jade_username");
if (savedUsername) {
  username.value = savedUsername;
}

// 🛡️ Activation du mode admin
loginAdmin.addEventListener("click", () => {
  if (adminPass.value === ADMIN_PASSWORD) {
    isAdmin = true;
    adminStatus.textContent = "Modération activée ✔️";
  } else {
    alert("Mot de passe admin incorrect ❗");
  }
});

// ➕ Publier un message
postBtn.addEventListener("click", async () => {
  if (!username.value || !message.value) {
    alert("Merci de remplir tous les champs ❗");
    return;
  }

  // 💾 Sauvegarder le prénom
  localStorage.setItem("jade_username", username.value);

  await addDoc(collection(db, "posts"), {
    user: username.value,
    msg: message.value,
    createdAt: Date.now()
  });

  message.value = "";
});

// 👀 Affichage des messages (TEMPS RÉEL + suppression admin)
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

onSnapshot(q, snapshot => {
  postsDiv.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <strong>${data.user}</strong>
      <p>${data.msg}</p>
      ${isAdmin ? `<button class="delete">❌</button>` : ""}
    `;

    // ❌ Suppression admin
    if (isAdmin) {
      div.querySelector(".delete").addEventListener("click", async () => {
        await deleteDoc(doc(db, "posts", id));
      });
    }

    postsDiv.appendChild(div);
  });
});