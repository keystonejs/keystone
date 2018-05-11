import { Component } from 'react';

function getJSON(url) {
  return fetch(url, {
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
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
    },
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
  }).then(response => response.json());
}

class Session extends Component {
  state = {
    user: null,
    isLoading: true,
  };
  componentDidMount() {
    this.getSession();
  }
  getSession = () => {
    const { apiPath } = this.props;
    this.setState({ isLoading: true });
    getJSON(`${apiPath}/session`).then(data => {
      this.setState({ user: data, isLoading: false });
    });
  };
  signIn = ({ username, password }) => {
    const { apiPath } = this.props;
    postJSON(`${apiPath}/signin`, { username, password })
      .then(() => this.getSession())
      .catch(error => console.error(error));
  };
  signOut = () => {
    const { apiPath } = this.props;
    postJSON(`${apiPath}/signout`)
      .then(() => this.getSession())
      .catch(error => console.error(error));
  };
  render() {
    const { signIn, signOut } = this;
    const { children } = this.props;
    const { user, isLoading } = this.state;
    return children({
      user,
      signIn,
      signOut,
      isLoading,
    });
  }
}

export default Session;
