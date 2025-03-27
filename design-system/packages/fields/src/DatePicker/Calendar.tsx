/** @jsxRuntime classic */
/** @jsx jsx */

import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { css } from '@emotion/react';
import { jsx } from '@keystone-ui/core';

/* Base styles for the rdp: https://github.com/gpbl/react-day-picker/blob/main/src/style.css */
const baseStyles = css`
  .rdp-root {
    --rdp-accent-color: blue;
    --rdp-accent-background-color: #f0f0ff;
    --rdp-day-height: 44px;
    --rdp-day-width: 44px;
    --rdp-day_button-border-radius: 100%;
    --rdp-day_button-border: 2px solid transparent;
    --rdp-day_button-height: 42px;
    --rdp-day_button-width: 42px;
    --rdp-selected-border: 2px solid var(--rdp-accent-color);
    --rdp-disabled-opacity: 0.5;
    --rdp-outside-opacity: 0.75;
    --rdp-today-color: var(--rdp-accent-color);
    --rdp-dropdown-gap: 0.5rem;
    --rdp-months-gap: 2rem;
    --rdp-nav_button-disabled-opacity: 0.5;
    --rdp-nav_button-height: 2.25rem;
    --rdp-nav_button-width: 2.25rem;
    --rdp-nav-height: 2.75rem;
    --rdp-range_middle-background-color: var(--rdp-accent-background-color);
    --rdp-range_middle-color: inherit;
    --rdp-range_start-color: white;
    --rdp-range_start-background: linear-gradient(
      var(--rdp-gradient-direction),
      transparent 50%,
      var(--rdp-range_middle-background-color) 50%
    );
    --rdp-range_start-date-background-color: var(--rdp-accent-color);
    --rdp-range_end-background: linear-gradient(
      var(--rdp-gradient-direction),
      var(--rdp-range_middle-background-color) 50%,
      transparent 50%
    );
    --rdp-range_end-color: white;
    --rdp-range_end-date-background-color: var(--rdp-accent-color);
    --rdp-week_number-border-radius: 100%;
    --rdp-week_number-border: 2px solid transparent;
    --rdp-week_number-height: var(--rdp-day-height);
    --rdp-week_number-opacity: 0.75;
    --rdp-week_number-width: var(--rdp-day-width);
    --rdp-weeknumber-text-align: center;
    --rdp-weekday-opacity: 0.75;
    --rdp-weekday-padding: 0.5rem 0rem;
    --rdp-weekday-text-align: center;
    --rdp-gradient-direction: 90deg;
    --rdp-animation_duration: 0.3s;
    --rdp-animation_timing: cubic-bezier(0.4, 0, 0.2, 1);
  }

  .rdp-root[dir='rtl'] {
    --rdp-gradient-direction: -90deg;
  }

  .rdp-root[data-broadcast-calendar='true'] {
    --rdp-outside-opacity: unset;
  }

  .rdp-root {
    position: relative;
    box-sizing: border-box;
  }

  .rdp-root * {
    box-sizing: border-box;
  }

  .rdp-day {
    width: var(--rdp-day-width);
    height: var(--rdp-day-height);
    text-align: center;
  }

  .rdp-day_button {
    background: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    font: inherit;
    color: inherit;
    justify-content: center;
    align-items: center;
    display: flex;
    width: var(--rdp-day_button-width);
    height: var(--rdp-day_button-height);
    border: var(--rdp-day_button-border);
    border-radius: var(--rdp-day_button-border-radius);
  }

  .rdp-day_button:disabled {
    cursor: revert;
  }

  .rdp-caption_label {
    z-index: 1;
    position: relative;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    border: 0;
  }

  .rdp-dropdown:focus-visible ~ .rdp-caption_label {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }

  .rdp-button_next,
  .rdp-button_previous {
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    font: inherit;
    color: inherit;
    -moz-appearance: none;
    -webkit-appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    appearance: none;
    width: var(--rdp-nav_button-width);
    height: var(--rdp-nav_button-height);
  }

  .rdp-button_next:disabled,
  .rdp-button_next[aria-disabled='true'],
  .rdp-button_previous:disabled,
  .rdp-button_previous[aria-disabled='true'] {
    cursor: revert;
    opacity: var(--rdp-nav_button-disabled-opacity);
  }

  .rdp-chevron {
    display: inline-block;
    fill: var(--rdp-accent-color);
  }

  .rdp-root[dir='rtl'] .rdp-nav .rdp-chevron {
    transform: rotate(180deg);
    transform-origin: 50%;
  }

  .rdp-dropdowns {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--rdp-dropdown-gap);
  }

  .rdp-dropdown {
    z-index: 2;
    opacity: 0;
    appearance: none;
    position: absolute;
    inset-block-start: 0;
    inset-block-end: 0;
    inset-inline-start: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    cursor: inherit;
    border: none;
    line-height: inherit;
  }

  .rdp-dropdown_root {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .rdp-dropdown_root[data-disabled='true'] .rdp-chevron {
    opacity: var(--rdp-disabled-opacity);
  }

  .rdp-month_caption {
    display: flex;
    align-content: center;
    height: var(--rdp-nav-height);
    font-weight: bold;
    font-size: large;
  }

  .rdp-months {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: var(--rdp-months-gap);
    max-width: fit-content;
  }

  .rdp-month_grid {
    border-collapse: collapse;
  }

  .rdp-nav {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    display: flex;
    align-items: center;
    height: var(--rdp-nav-height);
  }

  .rdp-weekday {
    opacity: var(--rdp-weekday-opacity);
    padding: var(--rdp-weekday-padding);
    font-weight: 500;
    font-size: smaller;
    text-align: var(--rdp-weekday-text-align);
    text-transform: var(--rdp-weekday-text-transform);
  }

  .rdp-week_number {
    opacity: var(--rdp-week_number-opacity);
    font-weight: 400;
    font-size: small;
    height: var(--rdp-week_number-height);
    width: var(--rdp-week_number-width);
    border: var(--rdp-week_number-border);
    border-radius: var(--rdp-week_number-border-radius);
    text-align: var(--rdp-weeknumber-text-align);
  }

  .rdp-today:not(.rdp-outside) {
    color: var(--rdp-today-color);
  }

  .rdp-selected {
    font-weight: bold;
    font-size: large;
  }

  .rdp-selected .rdp-day_button {
    border: var(--rdp-selected-border);
  }

  .rdp-outside {
    opacity: var(--rdp-outside-opacity);
  }

  .rdp-disabled {
    opacity: var(--rdp-disabled-opacity);
  }

  .rdp-hidden {
    visibility: hidden;
    color: var(--rdp-range_start-color);
  }

  .rdp-range_start {
    background: var(--rdp-range_start-background);
  }

  .rdp-range_start .rdp-day_button {
    background-color: var(--rdp-range_start-date-background-color);
    color: var(--rdp-range_start-color);
  }

  .rdp-range_middle {
    background-color: var(--rdp-range_middle-background-color);
  }

  .rdp-range_middle .rdp-day_button {
    border-color: transparent;
    border: unset;
    border-radius: unset;
    color: var(--rdp-range_middle-color);
  }

  .rdp-range_end {
    background: var(--rdp-range_end-background);
    color: var(--rdp-range_end-color);
  }

  .rdp-range_end .rdp-day_button {
    color: var(--rdp-range_start-color);
    background-color: var(--rdp-range_end-date-background-color);
  }

  .rdp-range_start.rdp-range_end {
    background: revert;
  }

  .rdp-focusable {
    cursor: pointer;
  }

  @keyframes rdp-slide_in_left {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes rdp-slide_in_right {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes rdp-slide_out_left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  @keyframes rdp-slide_out_right {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .rdp-weeks_before_enter {
    animation: rdp-slide_in_left var(--rdp-animation_duration) var(--rdp-animation_timing) forwards;
  }

  .rdp-weeks_before_exit {
    animation: rdp-slide_out_left var(--rdp-animation_duration) var(--rdp-animation_timing) forwards;
  }

  .rdp-weeks_after_enter {
    animation: rdp-slide_in_right var(--rdp-animation_duration) var(--rdp-animation_timing) forwards;
  }

  .rdp-weeks_after_exit {
    animation: rdp-slide_out_right var(--rdp-animation_duration) var(--rdp-animation_timing)
      forwards;
  }

  .rdp-root[dir='rtl'] .rdp-weeks_after_enter {
    animation: rdp-slide_in_left var(--rdp-animation_duration) var(--rdp-animation_timing) forwards;
  }

  .rdp-root[dir='rtl'] .rdp-weeks_before_exit {
    animation: rdp-slide_out_right var(--rdp-animation_duration) var(--rdp-animation_timing)
      forwards;
  }

  .rdp-root[dir='rtl'] .rdp-weeks_before_enter {
    animation: rdp-slide_in_right var(--rdp-animation_duration) var(--rdp-animation_timing) forwards;
  }

  .rdp-root[dir='rtl'] .rdp-weeks_after_exit {
    animation: rdp-slide_out_left var(--rdp-animation_duration) var(--rdp-animation_timing) forwards;
  }

  @keyframes rdp-fade_in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes rdp-fade_out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .rdp-caption_after_enter {
    animation: rdp-fade_in var(--rdp-animation_duration) var(--rdp-animation_timing) forwards;
  }

  .rdp-caption_after_exit {
    animation: rdp-fade_out var(--rdp-animation_duration) var(--rdp-animation_timing) forwards;
  }

  .rdp-caption_before_enter {
    animation: rdp-fade_in var(--rdp-animation_duration) var(--rdp-animation_timing) forwards;
  }

  .rdp-caption_before_exit {
    animation: rdp-fade_out var(--rdp-animation_duration) var(--rdp-animation_timing) forwards;
  }
`;

/* Custom styles for the rdp */
const customStyles = css`
  .rdp-root {
    padding: 8px;
  }
`;

export const Calendar = ({ animate = true, weekStartsOn = 1, ...props }: DayPickerProps) => {
  return (
    <div css={[baseStyles, customStyles]}>
      <DayPicker animate={animate} weekStartsOn={weekStartsOn} mode="single" {...props} />
    </div>
  );
};
