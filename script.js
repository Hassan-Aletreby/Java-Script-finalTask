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
  userClicked,
  getUser,
  getUserPosts,
  profileClicked,
  deletePostButtonClicked,
  editPostButtonClicked,
  confirmPostDelete,
  createCommentClicked,
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

window.addBtnClicked = function () {
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
};
