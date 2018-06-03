import React, { Fragment } from 'react';
import { withToastUtils } from '@keystonejs/ui/src/primitives/toasts';

const text =
  'Macaroon cupcake powder dragée liquorice fruitcake cookie sesame snaps cake.';

const appearances = ['Info', 'Success', 'Error'];

class ToastGuide extends React.Component {
  state = { autoDismiss: false };
  toggle = event => this.setState({ autoDismiss: event.target.checked });
  render() {
    const { toast } = this.props;
    const { autoDismiss } = this.state;
    return (
      <Fragment>
        <h2>Toasts</h2>
        {appearances.map(a => {
          const appearance = a.toLowerCase();
          const onClick = toast.addToast(text, { appearance, autoDismiss });

          return (
            <button key={a} onClick={onClick}>
              {a}
            </button>
          );
        })}
        <label>
          <input
            type="checkbox"
            onChange={this.toggle}
            style={{ marginRight: '1em' }}
            checked={autoDismiss}
          />
          Auto-dismiss
        </label>
      </Fragment>
    );
  }
}

export default withToastUtils(ToastGuide);
