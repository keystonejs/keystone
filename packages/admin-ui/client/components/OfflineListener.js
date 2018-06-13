import React, { Component } from 'react';
import { withToastUtils } from '@keystonejs/ui/src/primitives/toasts';

class OfflineListener extends Component {
  state = { isOnline: window ? window.navigator.onLine : false };
  offlineToastId = null;
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
  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { isOnline } = this.state;

    if (prevState.isOnline !== isOnline) {
      const shouldAddToast = true;
      return { shouldAddToast, isOnline };
    }

    return null;
  }
  componentDidUpdate(props, state, snapshot) {
    if (!snapshot) return;

    const { toast } = props;
    const { isOnline } = snapshot;

    // prepare the content
    const content = (
      <div>
        <strong>{isOnline ? 'Back Online' : "You're Offline"}</strong>
        <div>
          {isOnline
            ? 'Items are available to edit again'
            : 'The changes you make will not be saved'}
        </div>
      </div>
    );

    // remove the existing offline notification if it exists, otherwise store
    // the id for use later
    const callback = isOnline
      ? () => toast.removeToast(this.offlineToastId)()
      : id => (this.offlineToastId = id);

    // add the applicable toast
    toast.addToast(content, {
      appearance: 'info',
      autoDismiss: isOnline,
    })(callback);
  }
  render() {
    return null;
  }
}

export default withToastUtils(OfflineListener);
