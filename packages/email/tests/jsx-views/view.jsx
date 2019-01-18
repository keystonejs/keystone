const React = require('react');

module.exports = class extends React.Component {
  render() {
    return <html><body><div>Hello {this.props.name}</div></body></html>;
  }
}
