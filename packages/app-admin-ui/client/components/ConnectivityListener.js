import React, { Component } from 'react';
import { withToastManager } from 'react-toast-notifications';

class ConnectivityListener extends Component {
  state = { isOnline: window ? window.navigator.onLine : false };
  componentDidMount() {
    window.addEventListener('online', this.onLine, false);
    window.addEventListener('offline', this.offLine, false);
  }
  componentWillUnmount() {
    window.removeEventListener('online', this.onLine);
    window.removeEventListener('offline', this.offLine);
  }
  onLine = () => {
    this.setState({ isOnline: true });
  };
  offLine = () => {
    this.setState({ isOnline: false });
  };
  offlineToastId = null;

  onlineCallback = () => {
    if (this.offlineToastId !== null) {
      this.props.toastManager.remove(this.offlineToastId);
      this.offlineToastId = null;
    }
  };
  offlineCallback = id => {
    this.offlineToastId = id;
  };

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { isOnline } = this.state;

    if (prevState.isOnline !== isOnline) {
      return { isOnline };
    }

    return null;
  }
  componentDidUpdate(props, state, snapshot) {
    if (!snapshot) return;

    const { toastManager } = props;
    const { isOnline } = snapshot;

    // prepare the content
    const content = (
      <div>
        <strong>{isOnline ? 'Online' : 'Offline'}</strong>
        <div>{isOnline ? 'Editing is available again' : 'Changes you make may not be saved'}</div>
      </div>
    );

    // remove the existing offline notification if it exists, otherwise store
    // the added toast id for use later
    const callback = isOnline ? this.onlineCallback : this.offlineCallback;

    // add the applicable toast
    toastManager.add(
      content,
      {
        appearance: 'info',
        autoDismiss: isOnline,
      },
      callback
    );
  }
  render() {
    return null;
  }
}

export default withToastManager(ConnectivityListener);
