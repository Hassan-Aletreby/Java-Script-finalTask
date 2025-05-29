// Constants
export const baseUrl = "https://tarmeezacademy.com/api/v1";
// Get Posts Variables
let currentPage = 1;
export let isPostsFetching = false;
// Methods
export function toggleLoader(show = true) {
  if (show) {
    document.getElementById("loader").style.visibility = "visible";
  } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}

export function getCurrentUser() {
  let user = "";
  const storageUser = localStorage.getItem("user");
  if (storageUser != "") {
    user = JSON.parse(storageUser);
  }
  return user;
}
export function getCurrentUserId() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("userid");
  return id;
}

function postClicked(postID) {
  window.location = `postDetails.html?postID=${postID}`;
  setupUI();
}
window.postClicked = postClicked;

export function getPosts() {
  isPostsFetching = true;
  toggleLoader();
  axios
    .get(`${baseUrl}/posts?limit=5&page=${currentPage}`)
    .then((response) => {
      toggleLoader(false);
      const posts = response.data.data;
      console.log("posts", posts);
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
      isPostsFetching = false;
    })
    .catch(() => {
      isPostsFetching = false;
      toggleLoader(false);
    })
    .finally(() => {
      toggleLoader(false);
    });
}

export function setupUI() {
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

export function refreshPosts() {
  currentPage = 1;
  document.getElementById("posts").innerHTML = "";
  getPosts();
  toggleLoader(false);
}
