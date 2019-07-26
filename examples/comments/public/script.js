const API_URL = `http://localhost:3000/admin/api`;

function graphql(query, variables = {}) {
  return fetch(API_URL, {
    method: `POST`,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      variables,
      query
    })
  }).then(result => result.json());
}

const GET_COMMENTS = `
  query GetComments($path: String!) {
    allComments(where: {path: $path}){
      id
      name
      comment
      path
    }
  }`;

const ADD_COMMENT = `
  mutation AddComment($name: String!, $comment: String!, $path: String!) {
    createComment(data: {name: $name, comment: $comment, path: $path}) {
      id
      name
      comment
      path
    }
  }`;

const addComment = event => {
  event.preventDefault();
  const form = event.target;
  const { name, comment } = form.elements;
  const path = window.location && window.location.pathname;
  if (name && comment && path) {
    graphql(ADD_COMMENT, {
      name: name.value,
      comment: comment.value,
      path
    }).then(fetchComments);
  }
};

const fetchComments = () => {
  const path = window.location.pathname;
  graphql(GET_COMMENTS, { path })
    .then(results => {
      document.getElementById(
        "comments"
      ).innerHTML = `<ul class="comment">${results.data.allComments
        .map(comment => {
          return `<li>${comment.comment}</li>`;
        })
        .join("\n")}</ul>`;
    })
    .catch(error => console.log(error));
};

document
  .querySelector(`.js-add-comment-form`)
  .addEventListener("submit", addComment);
fetchComments();
