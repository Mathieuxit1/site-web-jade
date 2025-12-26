// 🔥 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =====================
   CONFIG
===================== */

const ADMIN_PASSWORD = "tom";
let isAdmin = false;

const ADMINS = ["Jade"];
const MODERATORS = [];

const firebaseConfig = {
  apiKey: "AIzaSyDMAtecFv0LJGJQsB9JaMtVSRKXVbv14t4",
  authDomain: "jade-9d44e.firebaseapp.com",
  projectId: "jade-9d44e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const username = document.getElementById("username");
const message = document.getElementById("message");
const postBtn = document.getElementById("postBtn");
const postsDiv = document.getElementById("posts");
const themeToggle = document.getElementById("themeToggle");

/* =====================
   UTILISATEUR LOCAL
===================== */

const savedUsername = localStorage.getItem("jade_username");
if (savedUsername) username.value = savedUsername;

/* =====================
   MODE ADMIN CACHÉ
===================== */

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "j") {
    const pass = prompt("Accès administration");

    if (pass === ADMIN_PASSWORD) {
      isAdmin = true;
      alert("🛡️ Mode admin activé");
    } else if (pass !== null) {
      alert("Accès refusé");
    }
  }
});

/* =====================
   BAN
===================== */

async function isUserBanned(name) {
  const ref = doc(db, "banned_users", name.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists();
}

/* =====================
   JADEBOT
===================== */

const jadeBotTriggers = ["bonjour", "salut", "hello", "coucou", "bonsoir"];
const jadeBotReplies = [
  "Bienvenue dans la communauté de Jade 💚",
  "Salut 👋 Merci de rester respectueux.",
  "Heureux de te voir ici ✨"
];

/* =====================
   ENVOI MESSAGE
===================== */

postBtn.addEventListener("click", async () => {
  if (!username.value || !message.value) {
    alert("Merci de remplir tous les champs");
    return;
  }

  const userMessage = message.value.trim();
  const msgLower = userMessage.toLowerCase();

  localStorage.setItem("jade_username", username.value);

  if (await isUserBanned(username.value)) {
    alert("🚫 Tu es banni.");
    return;
  }

  // /ban
  if (isAdmin && msgLower.startsWith("/ban ")) {
    const bannedUser = userMessage.replace("/ban ", "").trim();

    await setDoc(doc(db, "banned_users", bannedUser.toLowerCase()), {
      bannedAt: Date.now()
    });

    await addDoc(collection(db, "posts"), {
      user: "🤖 JadeBot",
      msg: `🚫 ${bannedUser} a été banni par la modération.`,
      createdAt: Date.now()
    });

    message.value = "";
    return;
  }

  await addDoc(collection(db, "posts"), {
    user: username.value,
    msg: userMessage,
    createdAt: Date.now()
  });

  if (jadeBotTriggers.some(w => msgLower.includes(w))) {
    const reply = jadeBotReplies[Math.floor(Math.random() * jadeBotReplies.length)];
    setTimeout(async () => {
      await addDoc(collection(db, "posts"), {
        user: "🤖 JadeBot",
        msg: reply,
        createdAt: Date.now()
      });
    }, 800);
  }

  message.value = "";
});

/* =====================
   DATE
===================== */

function formatDate(ts) {
  return new Date(ts).toLocaleString("fr-FR");
}

/* =====================
   AFFICHAGE
===================== */

const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

onSnapshot(q, snapshot => {
  postsDiv.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "post";

    let badge = "";
    if (ADMINS.includes(data.user)) badge = `<span class="badge-admin">ADMIN</span>`;
    else if (MODERATORS.includes(data.user)) badge = `<span class="badge-modo">MOD</span>`;

    div.innerHTML = `
      <strong>${data.user} ${badge}</strong>
      <p>${data.msg}</p>
      <span class="post-date">${formatDate(data.createdAt)}</span>
      ${isAdmin ? `<button class="delete">🗑️</button>` : ""}
    `;

    if (isAdmin) {
      div.querySelector(".delete").onclick = async () => {
        if (!confirm("Supprimer ?")) return;
        await deleteDoc(doc(db, "posts", id));
      };
    }

    postsDiv.appendChild(div);
  });
});

/* =====================
   MODE SOMBRE
===================== */

if (localStorage.getItem("jade_theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️ Mode clair";
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  themeToggle.textContent = dark ? "☀️ Mode clair" : "🌙 Mode sombre";
  localStorage.setItem("jade_theme", dark ? "dark" : "light");
};

/* =====================
   🕵️ PANNEAU MODÉRATION CACHÉ
===================== */

const modPanel = document.getElementById("modPanel");
const closeModPanel = document.getElementById("closeModPanel");
const modTarget = document.getElementById("modTarget");
const modButtons = document.querySelectorAll(".mod-actions button");
const title = document.querySelector("header h1");

let pressTimer;

// 📱 Appui long (mobile + PC)
title.addEventListener("pointerdown", () => {
  pressTimer = setTimeout(() => {
    if (!isAdmin && !MODERATORS.includes(username.value)) {
      alert("Accès réservé à la modération");
      return;
    }
    modPanel.classList.remove("hidden");
  }, 2000);
});

title.addEventListener("pointerup", () => {
  clearTimeout(pressTimer);
});

title.addEventListener("pointerleave", () => {
  clearTimeout(pressTimer);
});

// ❌ Fermer
closeModPanel.onclick = () => {
  modPanel.classList.add("hidden");
  modTarget.value = "";
};

// ⚙️ Actions
modButtons.forEach(btn => {
  btn.onclick = async () => {
    const target = modTarget.value.trim();
    if (!target) return alert("Pseudo requis");

    const action = btn.dataset.action;

    if (action === "ban") {
      await setDoc(doc(db, "banned_users", target.toLowerCase()), {
        bannedAt: Date.now(),
        bannedBy: username.value
      });

      await addDoc(collection(db, "posts"), {
        user: "🤖 JadeBot",
        msg: `🚫 ${target} a été banni par la modération.`,
        createdAt: Date.now()
      });
    }

    if (action === "unban") {
      await deleteDoc(doc(db, "banned_users", target.toLowerCase()));

      await addDoc(collection(db, "posts"), {
        user: "🤖 JadeBot",
        msg: `♻️ ${target} a été débanni.`,
        createdAt: Date.now()
      });
    }

    modPanel.classList.add("hidden");
    modTarget.value = "";
  };
});