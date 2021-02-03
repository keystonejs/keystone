/** @jsx jsx */

import { useEffect, useState } from 'react';
import { jsx } from '@emotion/core';

import Signin from '../../components/auth/signin';
import Signup from '../../components/auth/signup';
import ForgotPassword from '../../components/auth/forgotPassword';
import { Modal } from '../Modal';

const views = {
  signin: {
    content: Signin,
    title: 'Signin',
  },
  signup: {
    content: Signup,
    title: 'Join',
  },
  forgot: {
    content: ForgotPassword,
    title: 'Forgot Password',
  },
};

const AuthModal = ({ children, mode: initialMode }) => {
  const [isOpen, setOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);

  // helpers
  const closeModal = event => {
    if (event) {
      event.preventDefault();
    }
    setOpen(false);
  };
  const openModal = event => {
    if (event) {
      event.preventDefault();
    }
    setOpen(true);
  };

  const onClickForgot = event => {
    event.preventDefault();
    setMode('forgot');
  };
  const onClickSignin = event => {
    event.preventDefault();
    setMode('signin');
  };

  // reset the mode on "unmount"
  useEffect(() => {
    setMode(initialMode);
  }, [isOpen]);

  const view = views[mode];
  const Content = view.content;

  return (
    <>
      {children({ openModal })}
      <Modal title={view.title} isOpen={isOpen} onClose={closeModal}>
        <Content
          onClickForgot={onClickForgot}
          onClickSignin={onClickSignin}
          renderContext="modal"
          onSuccess={closeModal}
        />
      </Modal>
    </>
  );
};

export default AuthModal;
