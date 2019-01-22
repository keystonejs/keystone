const React = require('react');
const {
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlPreview,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlButton,
  MjmlImage
} = require('mjml-react');

module.exports = class extends React.Component {
  render() {
    return (
      <Mjml>
        <MjmlHead>
          <MjmlTitle><React.Fragment>{this.props.name} Last Minute Offer For You!</React.Fragment></MjmlTitle>
          <MjmlPreview>Special Offer Inside!</MjmlPreview>
        </MjmlHead>
        <MjmlBody width={500}>
          <MjmlSection fullWidth backgroundColor="#efefef">
            <MjmlColumn>
              <MjmlImage src="https://static.wixstatic.com/media/5cb24728abef45dabebe7edc1d97ddd2.jpg"/>
            </MjmlColumn>
          </MjmlSection>
          <MjmlSection>
            <MjmlColumn>
              <MjmlButton
                padding="20px"
                backgroundColor="#346DB7"
                href="https://www.example.com/"
              >
                Get offer now!
              </MjmlButton>
            </MjmlColumn>
          </MjmlSection>
        </MjmlBody>
      </Mjml>
    );
  }
}
