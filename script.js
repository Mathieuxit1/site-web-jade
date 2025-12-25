const ADMINS = ["Jade"];
const MODERATORS = ["Modérateur1"];

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

// 🤖 JadeBot – mots déclencheurs
const jadeBotTriggers = ["bonjour", "salut", "hello"];

const jadeBotReplies = [
  "Bienvenue dans la communauté de Jade 💚",
  "Salut ! Ravi de te voir ici ✨",
  "Hey 👋 Prends le temps de lire les règles et profite !"
];

// ➕ Publier un message
postBtn.addEventListener("click", async () => {
  if (!username.value || !message.value) {
    alert("Merci de remplir tous les champs ❗");
    return;
  }

  // 💾 Sauvegarder le prénom
  localStorage.setItem("jade_username", username.value);

  // ✅ SAUVEGARDE DU MESSAGE AVANT VIDAGE
  const userMessage = message.value.trim();
  const msgLower = userMessage.toLowerCase();

  // ➕ Message utilisateur
  await addDoc(collection(db, "posts"), {
    user: username.value,
    msg: userMessage,
    createdAt: Date.now()
  });

  // 🤖 JadeBot – réponse automatique
  if (jadeBotTriggers.includes(msgLower)) {
    const randomReply =
      jadeBotReplies[Math.floor(Math.random() * jadeBotReplies.length)];

    setTimeout(async () => {
      await addDoc(collection(db, "posts"), {
        user: "🤖 JadeBot",
        msg: randomReply,
        createdAt: Date.now()
      });
    }, 800);
  }

  // 🧹 Vider le champ APRÈS
  message.value = "";
});


// 👀 Affichage des messages (temps réel + modération)
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

onSnapshot(q, snapshot => {
  postsDiv.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "post";

    // 🎨 Message de l'utilisateur actuel
    if (data.user === localStorage.getItem("jade_username")) {
      div.classList.add("mine");
    }
    // 🛡️ Badges admin/modo
    let roleBadge = "";

if (ADMINS.includes(data.user)) {
  roleBadge = `<span class="badge-admin">ADMIN</span>`;
} else if (MODERATORS.includes(data.user)) {
  roleBadge = `<span class="badge-modo">MOD</span>`;
}
    
    div.innerHTML = `
  <strong>
    ${data.user}
    ${roleBadge}
  </strong>
  <p>${data.msg}</p>
  <span class="post-date">${formatDate(data.createdAt)}</span>
  ${isAdmin ? `<button class="delete">🗑️</button>` : ""}
`;


    // ❌ Suppression admin avec confirmation + animation
    if (isAdmin) {
      div.querySelector(".delete").addEventListener("click", async () => {
        if (!confirm("Supprimer ce message ?")) return;

        div.classList.add("removing");

        setTimeout(async () => {
          await deleteDoc(doc(db, "posts", id));
        }, 300);
      });
    }

    postsDiv.appendChild(div);
  });
});

// 🌙 MODE SOMBRE
const themeToggle = document.getElementById("themeToggle");

// Charger le thème sauvegardé
if (localStorage.getItem("jade_theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️ Mode clair";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  themeToggle.textContent = isDark ? "☀️ Mode clair" : "🌙 Mode sombre";
  localStorage.setItem("jade_theme", isDark ? "dark" : "light");
});

// 🕵️ Mode admin caché (raccourci secret)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "j") {
    const pass = prompt("Accès admin – mot de passe");

    if (pass === ADMIN_PASSWORD) {
      isAdmin = true;
      alert("Mode admin activé ✔️");
    } else if (pass !== null) {
      alert("Accès refusé ❌");
    }
  }
});
