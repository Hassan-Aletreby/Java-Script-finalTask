import {
  toggleLoader,
  refreshPosts,
  getPosts,
  getCurrentUser,
  getCurrentUserId,
  setupUI,
  isPostsFetching,
  loginBtnClicked,
  registerBtnClicked,
  logout,
  appendAlert,
} from "./js/utils.js";
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
  if (endOfPage && !isPostsFetching) {
    getPosts();
  }
});

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
      // getPost();
      appendAlert("The comment has been created successfully", "success");
    })
    .catch((error) => {
      toggleLoader(false);
      const message = error.response.data.message;
      appendAlert(message, "danger");
    });
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
  // Only trigger if the user id is found
  if (id) {
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
}
getUserPosts();

function userClicked(userId) {
  window.location = `profile.html?userid=${userId}`;
}
