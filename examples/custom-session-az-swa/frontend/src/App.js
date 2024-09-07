// src/App.js
import React, { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

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

  const login = () => {
    window.location.href = '/.auth/login/aad';
  };

  const logout = () => {
    window.location.href = '/.auth/logout';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Azure Static Web Apps Authentication Example</h1>
      {user ? (
        <div>
          <h2>Welcome, {user.userDetails}!</h2>
          <p>User ID: {user.userId}</p>
          <p>User Roles: {user.userRoles.join(', ')}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <button onClick={login}>Login with Azure AD</button>
        </div>
      )}
    </div>
  );
}

export default App;