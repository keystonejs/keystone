/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component, Suspense } from 'react';
import { useImage } from 'react-image';
import PropTypes from 'prop-types';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { AlertIcon, FileMediaIcon } from '@primer/octicons-react';
import { HiddenInput } from '@arch-ui/input';
import { LoadingIndicator } from '@arch-ui/loading';
import { Lozenge } from '@arch-ui/lozenge';
import { Button, LoadingButton } from '@arch-ui/button';
import { FlexGroup } from '@arch-ui/layout';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';
import isEqual from 'lodash.isequal';

function uploadButtonLabelFn({ status }) {
  return status === 'empty' ? 'Upload File' : 'Change File';
}
function cancelButtonLabelFn({ status }) {
  switch (status) {
    case 'stored':
      return 'Remove File';
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
    case 'save':
      return 'Something went wrong, please reload and try again.';
    case 'preview':
      return 'Something went wrong, please try again.';
  }
}

export default class FileField extends Component {
  static getDerivedStateFromProps(props, state) {
    const { savedValue, value } = props;
    const { changeStatus } = state;

    switch (changeStatus) {
      case 'removed':
        //file was removed and change was saved.
        if (savedValue === null && value === null) {
          return {
            originalFile: savedValue,
            changeStatus: 'empty',
          };
        }
        break;
      case 'updated':
        //file was updated and change was saved
        if (isEqual(savedValue, value)) {
          return {
            originalFile: savedValue,
            changeStatus: 'stored',
          };
        }
        break;
    }
    return null;
  }

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
    const { value } = props;

    const changeStatus = value ? 'stored' : 'empty';

    this.state = {
      originalFile: value,
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
    // revert to the original file if available
    const { originalFile } = this.state;
    this.props.onChange(originalFile);

    if (this.inputRef) this.inputRef.value = '';

    this.setState({
      changeStatus: originalFile ? 'stored' : 'empty',
      dataURI: null,
      errorMessage: null,
    });
  };
  onRemove = () => {
    this.setState({
      changeStatus: 'removed',
      errorMessage: null,
    });

    this.props.onChange(null);
  };
  onChange = ({
    target: {
      validity,
      files: [file],
    },
  }) => {
    if (!file) return; // bail if the user cancels from the file browser

    const { errorMessage, onChange } = this.props;
    const newState = { changeStatus: 'updated' };

    // basic validity check
    if (!validity.valid) {
      this.setState({
        errorMessage: errorMessage({ type: 'save' }),
      });
      return;
    }

    // resolve data URI for images
    if (file.type.includes('image')) {
      this.getDataURI(file);
      newState.oldImagePath = this.getImagePath(); // used during FileReader processing
    } else if (this.state.dataURI) {
      this.setState({ dataURI: null, errorMessage: null });
    }

    onChange(file);
    this.setState(newState);
  };
  openFileBrowser = () => {
    if (this.inputRef) this.inputRef.click();
  };

  // ==============================
  // Getters
  // ==============================

  getFile = () => {
    const { value } = this.props;
    const { changeStatus, originalFile } = this.state;

    const isRemoved = changeStatus === 'removed';
    const file = isRemoved ? originalFile : value;
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
    const { dataURI } = this.state;
    const { file } = this.getFile();

    // avoid jank during FileReader processing keeping the old image in place
    return file && file.mimetype && file.mimetype.includes('image') ? file.publicUrl : dataURI;
  };
  getInputRef = ref => {
    this.inputRef = ref;
  };

  // ==============================
  // Renderers
  // ==============================

  renderUploadButton = () => {
    const { uploadButtonLabel, isDisabled } = this.props;
    const { changeStatus, isLoading } = this.state;

    return (
      <LoadingButton
        onClick={this.openFileBrowser}
        isLoading={isLoading}
        variant="ghost"
        isDisabled={isDisabled}
      >
        {uploadButtonLabel({ status: changeStatus })}
      </LoadingButton>
    );
  };
  renderCancelButton = () => {
    const { cancelButtonLabel, isDisabled } = this.props;
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
      <Button onClick={onClick} variant="subtle" appearance={appearance} isDisabled={isDisabled}>
        {cancelButtonLabel({ status: changeStatus })}
      </Button>
    );
  };

  render() {
    const { autoFocus, field, statusMessage, errors, isDisabled } = this.props;
    const { changeStatus, errorMessage } = this.state;

    const { file } = this.getFile();
    const imagePath = this.getImagePath();
    const showStatusMessage = ['removed', 'updated'].includes(changeStatus);
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <FieldDescription text={field.adminDoc} />
        <FieldInput>
          {file ? (
            <Wrapper>
              {imagePath && <ImageContainer src={imagePath} alt={field.path} />}
              <Content>
                <FlexGroup style={{ marginBottom: gridSize }}>
                  {this.renderUploadButton()}
                  {this.renderCancelButton()}
                </FlexGroup>
                {errorMessage ? (
                  <ErrorInfo>{errorMessage}</ErrorInfo>
                ) : (
                  <FlexGroup isInline growIndexes={[0]}>
                    <MetaInfo href={file.publicUrl}>{file.filename || file.name}</MetaInfo>
                    {showStatusMessage ? (
                      <ChangeInfo status={changeStatus}>
                        {statusMessage({ status: changeStatus })}
                      </ChangeInfo>
                    ) : null}
                  </FlexGroup>
                )}
              </Content>
            </Wrapper>
          ) : (
            this.renderUploadButton()
          )}

          <HiddenInput
            autoComplete="off"
            autoFocus={autoFocus}
            id={htmlID}
            ref={this.getInputRef}
            name={field.path}
            onChange={this.onChange}
            type="file"
            disabled={isDisabled}
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

const Image = ({ src: imgSrc, alt }) => {
  const { src } = useImage({ srcList: imgSrc });
  return <img css={{ display: 'block', height: 'auto', maxWidth: '100%' }} src={src} alt={alt} />;
};

const ImageContainer = props => {
  return (
    <div
      css={{
        backgroundColor: 'white',
        borderRadius,
        border: `1px solid ${colors.N20}`,
        flexShrink: 0,
        marginRight: gridSize,
        padding: '4px',
        position: 'relative',
        textAlign: 'center',
        width: 130, // 120px image + chrome
      }}
    >
      <ImageErrorBoundary>
        <Suspense fallback={<LoadingIndicator />}>
          <Image {...props} />
        </Suspense>
      </ImageErrorBoundary>
    </div>
  );
};

class ImageErrorBoundary extends Component {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div css={{ padding: '4px 0', color: colors.N40 }}>
          <div>
            <FileMediaIcon />
          </div>
          <span css={{ fontSize: '0.9em' }}>Could not load image</span>
        </div>
      );
    }

    return this.props.children;
  }
}
