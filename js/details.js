import {
  baseUrl,
  toggleLoader,
  setupUI,
  loginBtnClicked,
  registerBtnClicked,
  logout,
  appendAlert,
} from "./utils.js";
function getPost() {
  setupUI();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("postID");
  if (!id) return;
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
      //   refreshPosts();
    }
  });
}

getPost();
