const baseUrl = "https://tarmeezacademy.com/api/v1";
setupUI();
const alertPlaceholder = document.getElementById("Alert");
let currentPage = 1;
let isLoading = false;
getPosts();
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("postID");

window.addEventListener("scroll", function () {
  const endOfPage =
    window.innerHeight + window.pageYOffset >= document.body.scrollHeight - 100;
  if (endOfPage && !isLoading) {
    getPosts();
  }
});

function getPosts() {
  isLoading = true;
  toggleLoader();
  axios
    .get(`${baseUrl}/posts?limit=5&page=${currentPage}`)
    .then((response) => {
      toggleLoader(false);
      const posts = response.data.data;
      for (const post of posts) {
        const author = post.author;
        let postTitle = post.title || "";
        let user = getCurrentUser();
        let isMyPost = user != null && post.author.id == user.id;
        let editBtnContent = ``;
        if (isMyPost) {
          editBtnContent = `
             <button class="btn btn-outline-secondary me-2 " id="editBtn" type="button" style="float:right ; z-index:999" onclick="editPostButtonClicked('${encodeURIComponent(
               JSON.stringify(post)
             )}')">
                    edit
                  </button>
              <button class="btn btn-outline-danger me-2 " id="deleteBtn" type="button" style="float:right ; z-index:999" onclick="deletePostButtonClicked('${encodeURIComponent(
                JSON.stringify(post)
              )}')">
                    Delete
                  </button>
          `;
        }
        let content = `
          <div class="card shadow my-5"  style="cursor: pointer">
            <div class="card-header">
            <span onclick="userClicked(${author.id})" style="cursor:pointer" >
            <img src="${author.profile_image}" alt="" style="width: 40px; height: 40px;" class="rounded-circle border border-2">
            <strong>@ ${author.username}</strong>
            </span>
              ${editBtnContent}
            </div>
            <div class="card-body" onclick="postClicked(${post.id})">
              <img src="${post.image}" alt="" style="width: 100%; max-height: 400px;" class="rounded">
              <h6 style="color: rgb(118, 118, 118);" class="mt-1">${post.created_at}</h6>
              <h4>${postTitle}</h4>
              <p>${post.body}</p>
              <hr>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                  <path d="M13.498.795l.149-.149a1.207 1.207 0 1 1 1.707 1.707l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a1.5 1.5 0 0 1 2.059-.06zM12.854 2.854 11.146 1.146 3 9.293V11h1.707l8.147-8.146z"/>
                </svg>
                <span>(${post.comments_count}) Comments</span>
                <span id="postTags-${post.id}"></span>
              </div>
            </div>
          </div>
      `;

        document.getElementById("posts").innerHTML += content;

        const currentPostTagsId = `postTags-${post.id}`;
        document.getElementById(currentPostTagsId).innerHTML = "";
        for (const tag of post.tags || []) {
          let tagContent = `
          <button class="btn btn-sm rounded-5 px-3 mx-2" style="background-color:gray; color:white">
            ${tag.name}
          </button>
        `;
          document.getElementById(currentPostTagsId).innerHTML += tagContent;
        }
      }

      currentPage++;
      isLoading = false;
    })
    .catch(() => {
      isLoading = false;
      toggleLoader(false);
    })
    .finally(() => {
      toggleLoader(false);
    });
}

function loginBtnClicked() {
  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;
  const params = {
    username: username,
    password: password,
  };
  toggleLoader(true);
  axios
    .post(`${baseUrl}/login`, params)
    .then((response) => {
      toggleLoader(false);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      const modal = document.getElementById("loginModal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      appendAlert("Logged in successfully", "success");
      setupUI();
      refreshPosts();
    })
    .catch((error) => {
      toggleLoader(false);
      const message = error.response.data.message;
      appendAlert(message, "danger");
    });
}
function registerBtnClicked() {
  const name = document.getElementById("register-name-input").value;
  const username = document.getElementById("register-username-input").value;
  const password = document.getElementById("register-password-input").value;
  const userImage = document.getElementById("user-image").files[0];
  let formData = new FormData();
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
      const modal = document.getElementById("registerModal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      appendAlert("New User Register successfully", "success");
      setupUI();
    })
    .catch((error) => {
      toggleLoader(false);
      const message = error.response.data.message;
      appendAlert(message, "danger");
    });
}
function logout() {
  toggleLoader(true);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  appendAlert("Logged out Successfully", "success");
  setupUI();
  refreshPosts();
}
const appendAlert = (message, type) => {
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
function getCurrentUser() {
  let user = "";
  const storageUser = localStorage.getItem("user");
  if (storageUser != "") {
    user = JSON.parse(storageUser);
  }
  return user;
}
function createAnewPost() {
  let postId = document.getElementById("post-id-input").value;
  let isCreate = postId == null || postId == "";
  const title = document.getElementById("post-title-input").value;
  const body = document.getElementById("post-body-input").value;
  const image = document.getElementById("post-title-image").files[0];
  let formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  formData.append("image", image);

  const token = localStorage.getItem("token");
  const headers = {
    authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  };
  let url = "";
  if (isCreate) {
    url = `${baseUrl}/posts`;
    axios
      .post(url, formData, {
        headers: headers,
      })
      .then((response) => {
        const modal = document.getElementById("newPostModal");
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        appendAlert("Posted successfully", "success");
        refreshPosts();
      })
      .catch((error) => {
        const message = error.response.data.message;
        appendAlert(message, "danger");
      });
  } else {
    formData.append("_method", "put");
    url = `${baseUrl}/posts/${postId}`;
    toggleLoader(true);
    axios
      .put(url, formData, {
        headers: headers,
      })
      .then((response) => {
        toggleLoader(false);
        const modal = document.getElementById("newPostModal");
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        appendAlert("Edit successfully", "success");
        refreshPosts();
      })
      .catch((error) => {
        const message = error.response.data.message;
        appendAlert(message, "danger");
      });
  }
}
function postClicked(postID) {
  window.location = `postDetails.html?postID=${postID}`;
  setupUI();
}

function getPost() {
  toggleLoader(true);
  axios.get(`${baseUrl}/posts/${id}`).then((response) => {
    toggleLoader(false);
    const post = response.data.data;
    const comments = post.comments;
    const author = post.author;
    document.getElementById("postDetailsHeader").innerHTML = author.username;
    let postTitle = post.title || "";
    let commentsContent = ``;
    for (comment of comments) {
      commentsContent += `
         <div class="comment">
                <div class="comment_img">
                    <img src="${comment.author.profile_image}" alt="" class="user__image">
                    </div>
                    <div class="comment_body">
                    <b>@${comment.author.username}</b>
                    <p class="comment__text">${comment.body}</p>
                </div>
          </div>
          <hr/>
      `;
    }

    let content = `
          <div class="card shadow ">
            <div class="card-header">
              <img src="${author.profile_image}" alt="" style="width: 40px; height: 40px;" class="rounded-circle border border-2">
              <bold>@${author.username}</bold>
            </div>
            <div class="card-body">
              <img src="${post.image}" alt="" style="width: 100%; height: 400px;" class="rounded">
              <h6 style="color: rgb(118, 118, 118);" class="mt-1">${post.created_at}</h6>
              <h4>${postTitle}</h4>
              <p>${post.body}</p>
              <hr>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
              <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
              </svg>
              <span>(${post.comments_count}) Comments</span>
              <span id="postTags-${post.id}"></span>
              <div class="comments p-3 mt-3" id="comments">
              ${commentsContent}
                  <div class="input-group mb-3" id="add-comment-div">
                  <input type="text" class="form-control" id="commentInput" placeholder="add your comment here ...">
                  <button id="addCommentBtn" class="btn btn-outline-primary" type="button" onclick="createCommentClicked()">Send</button>
                  </div>
              </div>
              </div>
              <div>
            </div>
          </div>
      `;

    document.getElementById("post__content").innerHTML = content;

    const currentPostTagsId = `postTags-${post.id}`;
    document.getElementById(currentPostTagsId).innerHTML = "";
    for (const tag of post.tags || []) {
      let tagContent = `
          <button class="btn btn-sm rounded-5 px-3 mx-2" style="background-color:gray; color:white">
            ${tag.name}
          </button>
        `;
      document.getElementById(currentPostTagsId).innerHTML += tagContent;
      refreshPosts();
    }
  });
}
function createCommentClicked() {
  let commentBody = document.getElementById("commentInput").value;
  let params = {
    body: commentBody,
  };
  let token = localStorage.getItem("token");
  let url = `${baseUrl}/posts/${id}/comments`;
  toggleLoader(true);
  axios
    .post(url, params, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      toggleLoader(false);
      document.getElementById("commentInput").value = "";
      getPost();
      appendAlert("The comment has been created successfully", "success");
    })
    .catch((error) => {
      toggleLoader(false);
      const message = error.response.data.message;
      appendAlert(message, "danger");
    });
}
getPost();
function setupUI() {
  const token = localStorage.getItem("token");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const addBtn = document.getElementById("addbtn");
  const userName = document.getElementById("user-Name");
  const ProfileImage = document.getElementById("userImage");
  const commentInput = document.getElementById("commentInput");
  const addCommentBtn = document.getElementById("addCommentBtn");

  if (token == null) {
    if (loginBtn) loginBtn.style.display = "block";
    if (registerBtn) registerBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (commentInput) commentInput.style.display = "none";
    if (addCommentBtn) addCommentBtn.style.display = "none";
    if (addBtn) addBtn.style.display = "none";
    if (ProfileImage) ProfileImage.style.display = "none";
    if (userName) userName.style.display = "none";
  } else {
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
    if (commentInput) commentInput.style.display = "block";
    if (addCommentBtn) addCommentBtn.style.display = "block";
    if (addBtn) addBtn.style.display = "flex";

    const user = getCurrentUser();
    if (ProfileImage) {
      ProfileImage.style.display = "block";
      ProfileImage.src = user.profile_image;
    }
    if (userName) {
      userName.style.display = "block";
      userName.innerHTML = user.username;
    }
  }
}

function editPostButtonClicked(postObj) {
  post = JSON.parse(decodeURIComponent(postObj));
  document.getElementById("post-modal-submit-btn").innerHTML = "Update";
  document.getElementById("post-id-input").value = post.id;
  document.getElementById("post-modal-title").innerHTML = "Edit Post";
  document.getElementById("post-title-input").value = post.title;
  document.getElementById("post-body-input").value = post.body;
  let postModal = new bootstrap.Modal(
    document.getElementById("newPostModal"),
    {}
  );
  postModal.toggle();
}

function addBtnClicked() {
  document.getElementById("post-modal-submit-btn").innerHTML = "Create";
  document.getElementById("post-id-input").value = "";
  document.getElementById("post-modal-title").innerHTML = "Create A New Post";
  document.getElementById("post-title-input").value = "";
  document.getElementById("post-body-input").value = "";
  let postModal = new bootstrap.Modal(
    document.getElementById("newPostModal"),
    {}
  );
  postModal.toggle();
}

function deletePostButtonClicked(postObj) {
  post = JSON.parse(decodeURIComponent(postObj));
  document.getElementById("delete-post-id-input").value = post.id;
  let postModal = new bootstrap.Modal(
    document.getElementById("deletePostModal"),
    {}
  );
  setupUI();
  postModal.toggle();
}

function confirmPostDelete() {
  const postId = document.getElementById("delete-post-id-input").value;
  const token = localStorage.getItem("token");
  const headers = {
    authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  };
  toggleLoader(true);
  axios
    .delete(`${baseUrl}/posts/${postId}`, {
      headers: headers,
    })
    .then((response) => {
      toggleLoader(false);
      const modal = document.getElementById("deletePostModal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      appendAlert("The post has been deleted successfully", "success");
      setupUI();
      refreshPosts();
    })
    .catch((error) => {
      toggleLoader(false);
      const message = error.response.data.message;
      appendAlert(message, "danger");
    });
}

function getCurrentUserId() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("userid");
  return id;
}

function getUser() {
  const id = getCurrentUserId();
  // Only trigger if the user id is found
  if (id) {
    axios.get(`${baseUrl}/users/${id}`).then((response) => {
      const userInfo = response.data.data;
      document.getElementById("profile__name").innerText = userInfo.name;
      document.getElementById("profile__name1").innerText = userInfo.username;
      document.getElementById("profile__user__name").innerText =
        userInfo.username;
      document.getElementById("profile__email").innerText = userInfo.email;
      document.getElementById("profile__img").src = userInfo.profile_image;
      document.getElementById("postsNum").innerText = userInfo.posts_count;
      document.getElementById("commentsNum").innerText =
        userInfo.comments_count;
    });
  }
}
getUser();
function getUserPosts() {
  const id = getCurrentUserId();
  toggleLoader(true);
  axios
    .get(`${baseUrl}/users/${id}/posts`)
    .then((response) => {
      toggleLoader(false);
      const posts = response.data.data;
      document.getElementById("user__posts").innerHTML = "";
      for (const post of posts) {
        const author = post.author;
        let postTitle = post.title || "";
        let user = getCurrentUser();
        let isMyPost = user != null && post.author.id == user.id;
        let editBtnContent = ``;
        if (isMyPost) {
          editBtnContent = `
             <button class="btn btn-outline-secondary me-2 " id="editBtn" type="button" style="float:right ; z-index:999" onclick="editPostButtonClicked('${encodeURIComponent(
               JSON.stringify(post)
             )}')">
                    edit
                  </button>
              <button class="btn btn-outline-danger me-2 " id="deleteBtn" type="button" style="float:right ; z-index:999" onclick="deletePostButtonClicked('${encodeURIComponent(
                JSON.stringify(post)
              )}')">
                    Delete
                  </button>
          `;
        }
        let content = `
          <div class="card shadow my-5"  style="cursor: pointer">
            <div class="card-header">
              <img src="${author.profile_image}" alt="" style="width: 40px; height: 40px;" class="rounded-circle border border-2">
              <strong>@ ${author.username}</strong>
              ${editBtnContent}
            </div>
            <div class="card-body" onclick="postClicked(${post.id})">
              <img src="${post.image}" alt="" style="width: 100%; max-height: 400px;" class="rounded">
              <h6 style="color: rgb(118, 118, 118);" class="mt-1">${post.created_at}</h6>
              <h4>${postTitle}</h4>
              <p>${post.body}</p>
              <hr>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                  <path d="M13.498.795l.149-.149a1.207 1.207 0 1 1 1.707 1.707l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a1.5 1.5 0 0 1 2.059-.06zM12.854 2.854 11.146 1.146 3 9.293V11h1.707l8.147-8.146z"/>
                </svg>
                <span>(${post.comments_count}) Comments</span>
                <span id="postTags-${post.id}"></span>
              </div>
            </div>
          </div>
      `;

        document.getElementById("user__posts").innerHTML += content;
        const currentPostTagsId = `postTags-${post.id}`;
        document.getElementById(currentPostTagsId).innerHTML = "";
        for (const tag of post.tags || []) {
          let tagContent = `
          <button class="btn btn-sm rounded-5 px-3 mx-2" style="background-color:gray; color:white">
            ${tag.name}
          </button>
        `;
          document.getElementById(currentPostTagsId).innerHTML += tagContent;
        }
      }
    })
    .catch((error) => {
      toggleLoader(false);
      const message = error.response.data.message;
      appendAlert(message, "danger");
    });
}
getUserPosts();

function userClicked(userId) {
  window.location = `profile.html?userid=${userId}`;
}
function refreshPosts() {
  currentPage = 1;
  document.getElementById("posts").innerHTML = "";
  getPosts();
  toggleLoader(false);
}

function profileClicked() {
  const user = getCurrentUser();
  const userId = user.id;
  window.location = `profile.html?userid=${userId}`;
}

function toggleLoader(show = true) {
  if (show) {
    document.getElementById("loader").style.visibility = "vivible";
  } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}
