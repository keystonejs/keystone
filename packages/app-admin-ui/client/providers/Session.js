import { Component } from 'react';

function getJSON(url) {
  return fetch(url, {
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
      Accept: 'application/json',
    },
    mode: 'cors',
    redirect: 'follow',
  }).then(response => response.json());
}

function postJSON(url, data = {}) {
  return fetch(url, {
    body: JSON.stringify(data),
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
      Accept: 'application/json',
    },
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
  }).then(response => response.json());
}

class Session extends Component {
  state = {
    error: null,
    session: {},
    isLoading: true,
    isInitialising: true,
  };

  componentDidMount() {
    const { autoSignout } = this.props;
    if (autoSignout) {
      this.signOut();
    } else {
      this.getSession(autoSignout);
    }
  }

  getSession = () => {
    const { sessionPath } = this.props;
    // Avoid an extra re-render
    const { isLoading } = this.state;
    if (!isLoading) {
      this.setState({ isLoading: true });
    }
    // TODO: Handle errors
    getJSON(sessionPath).then(data => {
      this.setState({ isInitialising: false, isLoading: false, session: data });
    });
  };

  signIn = ({ username, password }) => {
    const { signinPath } = this.props;
    this.setState({ error: null, isLoading: true });
    // TODO: Handle caught errors
    postJSON(signinPath, { username, password })
      .then(data => {
        if (!data.success) {
          this.setState({ error: data });
        }
        this.getSession();
      })
      .catch(error => console.error(error));
  };

  signOut = () => {
    const { signoutPath } = this.props;
    // Avoid an extra re-render
    const { isLoading, error } = this.state;
    if (error || !isLoading) {
      this.setState({ error: null, isLoading: true });
    }
    // TODO: Handle errors
    postJSON(signoutPath)
      .then(() => this.getSession())
      .catch(e => console.error(e));
  };

  render() {
    const { signIn, signOut } = this;
    const { children } = this.props;
    const {
      error,
      session: { user, signedIn: isSignedIn },
      isInitialising,
      isLoading,
    } = this.state;

    return children({
      error,
      isInitialising,
      isLoading,
      isSignedIn,
      signIn,
      signOut,
      user,
    });
  }
}

export default Session;
