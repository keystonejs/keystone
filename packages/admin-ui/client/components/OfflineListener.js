import React, { Component } from 'react';
import { withToastUtils } from '@keystonejs/ui/src/primitives/toasts';

class OfflineListener extends Component {
  state = { isOnline: window ? window.navigator.onLine : false };
  componentDidMount() {
    if (!window) return;

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
    const { toast } = props;

    if (snapshot && snapshot.shouldAddToast) {
      const toastContent = (
        <div>
          <strong>
            {snapshot.isOnline ? 'Back Online' : "You're Offline"}
          </strong>
          <div>
            {snapshot.isOnline
              ? 'Items are available to edit again'
              : 'The changes you make will not be saved'}
          </div>
        </div>
      );

      toast.addToast(toastContent, { appearance: 'info' })();
    }
  }
  render() {
    return null;
  }
}

export default withToastUtils(OfflineListener);
