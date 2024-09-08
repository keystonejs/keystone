import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [newPostId, setNewPostId] = useState(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/.auth/me');
      const data = await response.json();
      if (data.clientPrincipal) {
        setUser(data.clientPrincipal);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            {
              posts {
                id, title
              }
            }
          `
        }),
      });
      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      setPosts(result.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.message);
    }
  };

  const addNewPost = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation addNewPost($data: PostCreateInput!) {
              createPost(data: $data) {
                id
              }
            }
          `,
          variables: {
            data: {
              content: "Random Content",
              title: "Random Title"
            }
          }
        }),
      });
      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      setNewPostId(result.data.createPost.id);
      fetchPosts(); // Refresh the posts list
    } catch (error) {
      console.error('Error adding new post:', error);
      setError(error.message);
    }
  };

  const login = () => {
    window.location.href = '/.auth/login/aad';
  };

  const logout = () => {
    window.location.href = '/.auth/logout';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body p-4">
                <h2 className="card-title text-center mb-4 fw-bold text-primary">Azure Authentication</h2>
                {user ? (
                  <div className="text-center">
                    <h4 className="mb-3">Welcome, {user.userDetails}!</h4>
                    <p className="text-muted mb-1">User ID: {user.userId}</p>
                    <p className="text-muted mb-4">Roles: {user.userRoles.join(', ')}</p>
                    <button className="btn btn-outline-danger rounded-pill px-4 mb-4" onClick={logout}>Sign Out</button>
                    
                    <div className="mt-4 p-3 bg-light rounded">
                      <h5 className="mb-3">GraphQL Query Results</h5>
                      {error ? (
                        <div className="alert alert-danger" role="alert">
                          Error: {error}
                        </div>
                      ) : posts ? (
                        <>
                          <ul className="list-group mb-3">
                            {posts.map(post => (
                              <li key={post.id} className="list-group-item">Post Title: {post.title}</li>
                            ))}
                          </ul>
                          <button className="btn btn-success rounded-pill px-4" onClick={addNewPost}>
                            Add New Post
                          </button>
                          {newPostId && (
                            <div className="alert alert-success mt-3" role="alert">
                              New post created with ID: {newPostId}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-muted">Loading posts...</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-muted mb-4">Please sign in to access your account and view posts.</p>
                    <button className="btn btn-primary rounded-pill px-4" onClick={login}>
                      Sign In with Azure AD
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}