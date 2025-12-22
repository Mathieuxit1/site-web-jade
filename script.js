const postBtn = document.getElementById("postBtn");
const postsContainer = document.getElementById("posts");

postBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!username || !message) {
    alert("Merci de remplir tous les champs ❗");
    return;
  }

  const post = document.createElement("div");
  post.classList.add("post");

  post.innerHTML = `
    <h4>${username}</h4>
    <p>${message}</p>
  `;

  postsContainer.prepend(post);

  document.getElementById("username").value = "";
  document.getElementById("message").value = "";
});
