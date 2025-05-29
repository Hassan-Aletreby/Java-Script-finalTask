// ========== Constants ==========
export const baseUrl = "https://tarmeezacademy.com/api/v1";
const alertPlaceholder = document.getElementById("alertPlaceholder");
let currentPage = 1;
export let isPostsFetching = false;
export const appendAlert = (message, type) => {
  const wrapper = document.createElement("div");
  const alertElement = document.createElement("div");

  alertElement.className = `alert alert-${type} alert-dismissible fade show`;
  alertElement.setAttribute("role", "alert");

  alertElement.innerHTML = `
          <div>${message}</div>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

  wrapper.appendChild(alertElement);
  alertPlaceholder.append(wrapper);

  setTimeout(() => {
    alertElement.classList.remove("show");
    alertElement.classList.add("hide");
    setTimeout(() => {
      wrapper.remove();
    }, 500);
  }, 2000);
};

// ========== Helpers ==========
export function toggleLoader(show = true) {
  document.getElementById("loader").style.visibility = show
    ? "visible"
    : "hidden";
}

export function getCurrentUser() {
  const storageUser = localStorage.getItem("user");
  return storageUser ? JSON.parse(storageUser) : null;
}

export function getCurrentUserId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("userid");
}

// ========== UI Setup ==========
export function setupUI() {
  const token = localStorage.getItem("token");
  const user = getCurrentUser();

  const toggleDisplay = (elementId, show) => {
    const el = document.getElementById(elementId);
    if (el)
      el.style.display = show
        ? elementId === "addbtn"
          ? "flex"
          : "block"
        : "none";
  };

  toggleDisplay("loginBtn", !token);
  toggleDisplay("registerBtn", !token);
  toggleDisplay("logoutBtn", !!token);
  toggleDisplay("addbtn", !!token);
  toggleDisplay("commentInput", !!token);
  toggleDisplay("addCommentBtn", !!token);

  const profileImage = document.getElementById("userImage");
  const userName = document.getElementById("user-Name");

  if (token && user) {
    if (profileImage) {
      profileImage.style.display = "block";
      profileImage.src = user.profile_image;
    }
    if (userName) {
      userName.style.display = "block";
      userName.innerHTML = user.username;
    }
  } else {
    if (profileImage) profileImage.style.display = "none";
    if (userName) userName.style.display = "none";
  }
}

// ========== Navigation ==========
function postClicked(postID) {
  window.location = `postDetails.html?postID=${postID}`;
}
window.postClicked = postClicked;

// ========== Posts ==========
export function getPosts() {
  isPostsFetching = true;
  toggleLoader();

  axios
    .get(`${baseUrl}/posts?limit=5&page=${currentPage}`)
    .then((response) => {
      toggleLoader(false);
      const posts = response.data.data;
      for (const post of posts) {
        const user = getCurrentUser();
        const isMyPost = user && post.author.id === user.id;
        const author = post.author;

        const editBtn = isMyPost
          ? `
          <button class="btn btn-outline-secondary me-2" onclick="editPostButtonClicked('${encodeURIComponent(
            JSON.stringify(post)
          )}')">Edit</button>
          <button class="btn btn-outline-danger me-2" onclick="deletePostButtonClicked('${encodeURIComponent(
            JSON.stringify(post)
          )}')">Delete</button>
          `
          : "";

        const tagsHtml = post.tags
          .map(
            (tag) =>
              `<button class="btn btn-sm rounded-5 px-3 mx-2" style="background-color:gray; color:white">${tag.name}</button>`
          )
          .join("");

        const postHTML = `
          <div class="card shadow my-5">
            <div class="card-header">
              <span onclick="userClicked(${author.id})" style="cursor:pointer">
                <img src="${
                  author.profile_image
                }" class="rounded-circle border border-2" style="width: 40px; height: 40px;" />
                <strong>@ ${author.username}</strong>
              </span>
              ${editBtn}
            </div>
            <div class="card-body" onclick="postClicked(${post.id})">
              <img src="${
                post.image
              }" class="rounded" style="width: 100%; max-height: 400px;" />
              <h6 class="mt-1 text-muted">${post.created_at}</h6>
              <h4>${post.title || ""}</h4>
              <p>${post.body}</p>
              <hr>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen"><path d="M13.498.795l.149-.149a1.207 1.207 0 1 1 1.707 1.707l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a1.5 1.5 0 0 1 2.059-.06z"/></svg>
                <span>(${post.comments_count}) Comments</span>
                <span>${tagsHtml}</span>
              </div>
            </div>
          </div>
        `;
        document.getElementById("posts").innerHTML += postHTML;
      }
      currentPage++;
      isPostsFetching = false;
    })
    .catch(() => {
      isPostsFetching = false;
      toggleLoader(false);
    })
    .finally(() => toggleLoader(false));
}

export function refreshPosts() {
  currentPage = 1;
  document.getElementById("posts").innerHTML = "";
  getPosts();
}

// ========== Authentication ==========
export function loginBtnClicked() {
  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;
  const params = { username, password };

  toggleLoader(true);
  axios
    .post(`${baseUrl}/login`, params)
    .then((response) => {
      toggleLoader(false);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("loginModal")
      );
      modal.hide();

      appendAlert("Logged in successfully", "success");
      setupUI();
      refreshPosts();
    })
    .catch((error) => {
      toggleLoader(false);
      const message =
        error.response?.data?.message || "An unexpected error occurred";
      appendAlert(message, "danger");
    });
}
window.loginBtnClicked = loginBtnClicked;

export function registerBtnClicked() {
  const name = document.getElementById("register-name-input").value;
  const username = document.getElementById("register-username-input").value;
  const password = document.getElementById("register-password-input").value;
  const userImage = document.getElementById("user-image").files[0];

  const formData = new FormData();
  formData.append("name", name);
  formData.append("image", userImage);
  formData.append("username", username);
  formData.append("password", password);

  toggleLoader(true);
  axios
    .post(`${baseUrl}/register`, formData)
    .then((response) => {
      toggleLoader(false);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("registerModal")
      );
      modal.hide();

      appendAlert("New user registered successfully", "success");
      setupUI();
    })
    .catch((error) => {
      toggleLoader(false);
      appendAlert(error.response.data.message, "danger");
    });
}
window.registerBtnClicked = registerBtnClicked;

export function logout() {
  toggleLoader(true);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  appendAlert("Logged out successfully", "success");
  setupUI();
  refreshPosts();
}
window.logout = logout;
