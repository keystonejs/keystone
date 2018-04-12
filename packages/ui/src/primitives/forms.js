import React from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

export const Input = styled('input')`
  background-color: white;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 0.3rem;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  color: inherit;
  font-size: 14px;
  padding: 8px;
  margin-bottom: 8px;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  width: 100%;

  &:hover {
    border-color: #bbb;
    outline: 0;
  }
  &:focus {
    border-color: #1385e5;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
      0 0 0 3px rgba(19, 133, 229, 0.1);
    outline: 0;
  }
`;

const ButtonComponent = props => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button {...props} />;
};

export const PrimaryButton = styled(ButtonComponent)`
  background: linear-gradient(to bottom, #1f8be6 0%, #1178ce 100%) #1385e5;
  border-width: 1px;
  border-style: solid;
  border-color: #1178ce #0f6ab7 #0e64ac;
  border-radius: 0.3rem;
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  font-weight: 400;
  padding: 8px 16px;
  outline: 0;
  touch-action: manipulation;
  text-decoration: none !important;
  user-select: none;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: white;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);

  &:focus,
  &:hover {
    color: white;
    text-decoration: none;
    background: linear-gradient(to bottom, #2b91e8 0%, #127eda 100%);
    border-color: #127eda #1178ce #1071c3;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
    outline: none;
  }

  &:active {
    background-color: #1178ce;
    background-image: none;
    border-color: #0e64ac #1071c3 #1178ce;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;
