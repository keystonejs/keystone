import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';
// TODO: Upload component?
import { HiddenInput } from '@keystonejs/ui/src/primitives/forms';
import { Button, LoadingButton } from '@keystonejs/ui/src/primitives/buttons';
import { FlexGroup } from '@keystonejs/ui/src/primitives/layout';
import { borderRadius, colors, gridSize } from '@keystonejs/ui/src/theme';

function uploadButtonLabelFn({ state }) {
  return state === 'empty' ? 'Upload Image' : 'Change Image';
}
function cancelButtonLabelFn({ state }) {
  switch (state) {
    case 'value':
      return 'Remove Image';
    case 'removed':
      return 'Undo Remove';
    case 'changed':
    default:
      return 'Cancel';
  }
}

type ChangeState = 'empty' | 'value' | 'removed' | 'updated';

export default class FileField extends Component {
  static propTypes = {
    cancelButtonLabel: PropTypes.func,
    disabled: PropTypes.bool,
    field: PropTypes.object,
    onChange: PropTypes.func,
    uploadButtonLabel: PropTypes.func,
  };
  static defaultProps = {
    uploadButtonLabel: uploadButtonLabelFn,
    cancelButtonLabel: cancelButtonLabelFn,
  };
  constructor(props) {
    super(props);
    const { field, item } = props;

    this.originalFile = item[field.path];
    const changeStatus = this.originalFile ? 'value' : 'empty';

    this.state = {
      dataURI: null,
      changedMessage: null,
      errorMessage: null,
      isLoading: false,
      changeStatus,
    };
  }
  componentWillUnmount() {
    console.log('Will Unmount');
  }

  // ==============================
  // Change Handlers
  // ==============================

  onCancel = () => {
    const { field, onChange } = this.props;

    onChange(field, this.originalFile);
    const changeStatus = this.getFile() ? 'value' : 'empty';

    console.log('onCancel', changeStatus);

    this.setState({
      changeMessage: null,
      changeStatus,
      dataURI: null,
    });
  };
  onRemove = () => {
    const { field, onChange } = this.props;

    this.setState({
      changeMessage: 'Save to Remove',
      changeStatus: 'removed',
    });

    onChange(field, null);
  };
  onChange = ({
    target: {
      validity,
      files: [file],
    },
  }) => {
    if (!file) return; // bail if the user cancels from the file browser

    const { field, onChange } = this.props;

    // basic validity check
    if (!validity.valid) {
      this.setState({
        errorMessage: 'Something went wrong, please reload and try again.',
      });
      return;
    }

    // check if the file is actually an image
    if (!file.type.includes('image')) {
      this.setState({
        errorMessage: 'Only image files are allowed. Please try again.',
      });
      return;
    } else if (this.state.errorMessage) {
      this.setState({ errorMessage: null });
    }

    this.setState({
      changeMessage: 'Save to Upload',
      changeStatus: 'updated',
    });

    onChange(field, file);
    this.getDataURI(file);
  };
  openFileBrowser = () => {
    if (this.inputRef) this.inputRef.click();
  };

  // ==============================
  // Getters
  // ==============================

  getFile = () => {
    const { field, item } = this.props;
    const { changeStatus } = this.state;

    return changeStatus === 'removed' ? this.originalFile : item[field.path];
  };

  getDataURI = file => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadstart = () => {
      this.setState({ isLoading: true });
    };
    reader.onerror = err => {
      console.error('Error with Cloudinary preview', err);
      this.setState({
        errorMessage: 'Something went wrong, please reload and try again.',
      });
    };
    reader.onloadend = upload => {
      this.setState({ isLoading: false, dataURI: upload.target.result });
    };
  };
  getImagePath = () => {
    const { dataURI } = this.state;
    const file = this.getFile();

    return (file && file.publicUrlTransformed) || dataURI;
  };
  getInputRef = ref => {
    this.inputRef = ref;
  };

  // ==============================
  // Renderers
  // ==============================

  renderUploadButton = () => {
    const { uploadButtonLabel } = this.props;
    const { changeStatus, isLoading } = this.state;

    return (
      <LoadingButton
        onClick={this.openFileBrowser}
        isLoading={isLoading}
        variant="ghost"
      >
        {uploadButtonLabel({ state: changeStatus })}
      </LoadingButton>
    );
  };
  renderCancelButton = () => {
    const { cancelButtonLabel } = this.props;
    const { changeStatus } = this.state;

    // possible states; no case for 'empty' as cancel is not rendered
    let appearance = 'warning';
    let onClick = this.onRemove;
    switch (changeStatus) {
      case 'removed':
        appearance = 'primary';
        onClick = this.onCancel;
        break;
      case 'updated':
        onClick = this.onCancel;
        break;
    }

    return (
      <Button onClick={onClick} variant="subtle" appearance={appearance}>
        {cancelButtonLabel({ state: changeStatus })}
      </Button>
    );
  };

  render() {
    const { autoFocus, field } = this.props;
    const { changeMessage, errorMessage } = this.state;

    const file = this.getFile();
    const imagePath = this.getImagePath();

    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          {imagePath ? (
            <Wrapper>
              <Image src={imagePath} alt={field.path} />
              <Content>
                <FlexGroup>
                  {this.renderUploadButton()}
                  {this.renderCancelButton()}
                </FlexGroup>
                {errorMessage ? (
                  <ErrorInfo>{errorMessage}</ErrorInfo>
                ) : file ? (
                  <FlexGroup growIndexes={[0]}>
                    <MetaInfo>{file.filename || file.name}</MetaInfo>
                    {changeMessage ? (
                      <ChangeInfo>{changeMessage}</ChangeInfo>
                    ) : null}
                  </FlexGroup>
                ) : null}
                {}
              </Content>
            </Wrapper>
          ) : (
            <FlexGroup>{this.renderUploadButton()}</FlexGroup>
          )}

          <HiddenInput
            autoComplete="off"
            autoFocus={autoFocus}
            innerRef={this.getInputRef}
            type="file"
            name={field.path}
            onChange={this.onChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}

// ==============================
// Styled Components
// ==============================

const Wrapper = props => (
  <div css={{ alignItems: 'flex-start', display: 'flex' }} {...props} />
);
const Content = props => <div css={{ flex: 1, minWidth: 0 }} {...props} />;
const Image = props => (
  <div
    css={{
      backgroundColor: 'white',
      borderRadius,
      border: `1px solid ${colors.N20}`,
      flexShrink: 0,
      lineHeight: 0,
      marginRight: gridSize,
      width: 130,
      textAlign: 'center',
      padding: 4,
    }}
  >
    <img
      css={{
        height: 'auto',
        maxWidth: '100%',
      }}
      {...props}
    />
  </div>
);
const Info = ({ styles, ...props }) => (
  <div
    css={{
      borderRadius,
      border: '1px solid transparent',
      display: 'inline-block',
      fontSize: '0.85em',
      marginTop: gridSize,
      maxWidth: '100%',
      minWidth: 1,
      padding: `${gridSize / 2}px ${gridSize}px`,
      whiteSpace: 'nowrap',
      ...styles,
    }}
    {...props}
  />
);
const MetaInfo = props => (
  <Info
    styles={{
      backgroundColor: colors.N05,
      borderColor: colors.N10,
      color: colors.N60,

      // clip from beginning of string
      direction: 'rtl',
      overflow: 'hidden',
      textAlign: 'left',
      textOverflow: 'ellipsis',
    }}
    {...props}
  />
);
const ErrorInfo = props => (
  <Info
    styles={{
      backgroundColor: colors.R.L90,
      borderColor: colors.R.L80,
      color: colors.R.D20,
    }}
    {...props}
  />
);
const ChangeInfo = props => (
  <Info
    styles={{
      backgroundColor: colors.B.L90,
      borderColor: colors.B.L80,
      color: colors.B.D20,
    }}
    {...props}
  />
);
