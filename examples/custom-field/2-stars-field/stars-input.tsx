import React from 'react';

type StarsInputProps = {
  value: number | null;
  onChange?: (value: number | null) => void;
  maxStars: number;
  autoFocus?: boolean;
};

export function StarsInput(props: StarsInputProps) {
  return (
    <div>
      <div>
        <label>
          <input
            autoFocus={props.autoFocus}
            type="radio"
            disabled={props.onChange === undefined}
            checked={props.value === 0}
            onChange={() => {
              props.onChange?.(0);
            }}
          />
          0 Stars
        </label>
      </div>
      {Array.from({
        length: props.maxStars,
      }).map((_, i) => {
        const star = i + 1;
        return (
          <div>
            <label key={star}>
              <input
                type="radio"
                checked={props.value === star}
                disabled={props.onChange === undefined}
                onChange={() => {
                  props.onChange?.(star);
                }}
              />
              {props.value !== null && props.value >= star ? fullStar : emptyStar}
              {star} Star{star === 1 ? '' : 's'}
            </label>
          </div>
        );
      })}
      <div>
        <label>
          <input
            type="radio"
            checked={props.value === null}
            disabled={props.onChange === undefined}
            onChange={() => {
              props.onChange?.(null);
            }}
          />
          No selection
        </label>
      </div>
    </div>
  );
}

const fullStar = (
  <svg width="22" height="21" viewBox="0 0 44 42" xmlns="http://www.w3.org/2000/svg">
    <path
      stroke="#ED5910"
      strokeWidth="2"
      fill="#F8E71C"
      d="M22 30.972L10.244 39.18l4.175-13.717-11.44-8.643 14.335-.27L22 3l4.686 13.55 14.335.27-11.44 8.643 4.175 13.717z"
    />
  </svg>
);

const emptyStar = (
  <svg width="22" height="21" viewBox="0 0 44 42" xmlns="http://www.w3.org/2000/svg">
    <path
      stroke="#BBB"
      strokeWidth="2"
      fill="#FFF"
      d="M22 30.972L10.244 39.18l4.175-13.717-11.44-8.643 14.335-.27L22 3l4.686 13.55 14.335.27-11.44 8.643 4.175 13.717z"
    />
  </svg>
);
