/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';
import PropTypes from 'prop-types';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { AlertIcon, ShieldIcon } from '@arch-ui/icons';
import { HiddenInput } from '@arch-ui/input';
import { Lozenge } from '@arch-ui/lozenge';
import { Button, LoadingButton } from '@arch-ui/button';
import { FlexGroup } from '@arch-ui/layout';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

// NOTE: we need flow 😢
// Status enum: 'empty' | 'stored' | 'removed' | 'updated'

function uploadButtonLabelFn({ status }) {
  return status === 'empty' ? 'Upload Image' : 'Change Image';
}
function cancelButtonLabelFn({ status }) {
  switch (status) {
    case 'stored':
      return 'Remove Image';
    case 'removed':
      return 'Undo Remove';
    case 'updated':
    default:
      return 'Cancel';
  }
}
function statusMessageFn({ status }) {
  switch (status) {
    case 'removed':
      return 'save to remove';
    case 'updated':
      return 'save to upload';
  }
}
function errorMessageFn({ type }) {
  switch (type) {
    case 'invalid':
      return 'Only image files are allowed. Please try again.';
    case 'save':
      return 'Something went wrong, please reload and try again.';
    case 'preview':
      return 'Something went wrong, please try again.';
  }
}

export default class FileField extends Component {
  static propTypes = {
    cancelButtonLabel: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    errorMessage: PropTypes.func.isRequired,
    field: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    statusMessage: PropTypes.func.isRequired,
    uploadButtonLabel: PropTypes.func.isRequired,
  };
  static defaultProps = {
    cancelButtonLabel: cancelButtonLabelFn,
    errorMessage: errorMessageFn,
    statusMessage: statusMessageFn,
    uploadButtonLabel: uploadButtonLabelFn,
  };
  constructor(props) {
    super(props);
    const { field, item } = props;

    this.originalFile = item[field.path];
    const changeStatus = this.originalFile ? 'stored' : 'empty';

    this.state = {
      changeStatus,
      dataURI: null,
      errorMessage: null,
      isLoading: false,
      oldImagePath: null,
    };
  }

  // ==============================
  // Change Handlers
  // ==============================

  onCancel = () => {
    const { field, onChange } = this.props;

    // revert to the original file if available
    onChange(field, this.originalFile);

    this.setState({
      changeStatus: this.originalFile ? 'stored' : 'empty',
      dataURI: null,
      errorMessage: null,
    });
  };
  onRemove = () => {
    const { field, onChange } = this.props;

    this.setState({
      changeStatus: 'removed',
      errorMessage: null,
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

    const { errorMessage, field, onChange } = this.props;

    // basic validity check
    if (!validity.valid) {
      this.setState({
        errorMessage: errorMessage({ type: 'save' }),
      });
      return;
    }

    // check if the file is actually an image
    if (!file.type.includes('image')) {
      this.setState({
        errorMessage: errorMessage({ type: 'invalid' }),
      });
      return;
    } else if (this.state.errorMessage) {
      this.setState({ errorMessage: null });
    }

    this.setState({
      changeStatus: 'updated',
      oldImagePath: this.getImagePath(), // used during FileReader processing
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

    const isRemoved = changeStatus === 'removed';
    const file = isRemoved ? this.originalFile : item[field.path];
    const type = file && file['__typename'] ? 'server' : 'client';

    return { file, type };
  };
  getDataURI = file => {
    const { errorMessage } = this.props;
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadstart = () => {
      this.setState({ isLoading: true });
    };
    reader.onerror = err => {
      console.error('Error with Cloudinary preview', err);
      this.setState({
        errorMessage: errorMessage({ type: 'preview' }),
      });
    };
    reader.onloadend = upload => {
      this.setState({ isLoading: false, dataURI: upload.target.result });
    };
  };
  getImagePath = () => {
    const { dataURI, oldImagePath } = this.state;
    const { file } = this.getFile();

    // avoid jank during FileReader processing keeping the old image in place
    return (file && file.publicUrlTransformed) || dataURI || oldImagePath;
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
      <LoadingButton onClick={this.openFileBrowser} isLoading={isLoading} variant="ghost">
        {uploadButtonLabel({ status: changeStatus })}
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
        {cancelButtonLabel({ status: changeStatus })}
      </Button>
    );
  };

  render() {
    const { autoFocus, field, statusMessage, itemErrors } = this.props;
    const { changeStatus, errorMessage } = this.state;

    const { file } = this.getFile();
    const imagePath = this.getImagePath();
    const showStatusMessage = ['removed', 'updated'].includes(changeStatus);
    const isEmpty = changeStatus === 'empty';
    const htmlID = `ks-input-${field.path}`;
    const canRead = !(
      itemErrors[field.path] instanceof Error && itemErrors[field.path].name === 'AccessDeniedError'
    );

    return (
      <FieldContainer>
        <FieldLabel
          htmlFor={htmlID}
          css={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {field.label}{' '}
          {!canRead ? (
            <ShieldIcon
              title={itemErrors[field.path].message}
              css={{ color: colors.N20, marginRight: '1em' }}
            />
          ) : null}
        </FieldLabel>
        <FieldInput>
          {!isEmpty && imagePath ? (
            <Wrapper>
              <Image src={imagePath} alt={field.path} />
              <Content>
                <FlexGroup style={{ marginBottom: gridSize }}>
                  {this.renderUploadButton()}
                  {this.renderCancelButton()}
                </FlexGroup>
                {errorMessage ? (
                  <ErrorInfo>{errorMessage}</ErrorInfo>
                ) : file ? (
                  <FlexGroup isInline growIndexes={[0]}>
                    <MetaInfo>{file.filename || file.name}</MetaInfo>
                    {showStatusMessage ? (
                      <ChangeInfo status={changeStatus}>
                        {statusMessage({ status: changeStatus })}
                      </ChangeInfo>
                    ) : null}
                  </FlexGroup>
                ) : null}
              </Content>
            </Wrapper>
          ) : (
            this.renderUploadButton()
          )}

          <HiddenInput
            autoComplete="off"
            autoFocus={autoFocus}
            id={htmlID}
            innerRef={this.getInputRef}
            name={field.path}
            onChange={this.onChange}
            type="file"
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}

// ==============================
// Styled Components
// ==============================

const Wrapper = props => <div css={{ alignItems: 'flex-start', display: 'flex' }} {...props} />;
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
      padding: 4,
      position: 'relative',
      textAlign: 'center',
      width: 130, // 120px image + chrome
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
const MetaInfo = props => <Lozenge crop="right" {...props} />;
const ErrorInfo = ({ children, ...props }) => (
  <Lozenge
    style={{
      backgroundColor: colors.R.L80,
      borderColor: 'transparent',
      color: colors.R.D20,
      display: 'inline-flex',
    }}
    {...props}
  >
    <AlertIcon css={{ marginRight: gridSize }} />
    {children}
  </Lozenge>
);
const appearanceMap = {
  default: 'primary',
  removed: 'danger',
  updated: 'create',
};
const ChangeInfo = ({ status = 'default', ...props }) => {
  const appearance = appearanceMap[status];
  return <Lozenge appearance={appearance} {...props} />;
};
