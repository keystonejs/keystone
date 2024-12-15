import { Gradients, type IconProps } from './util'

export function Thinkmill ({ grad, ...props }: IconProps) {
  return (
    <svg aria-label="Thinkmill" role="img" viewBox="0 0 400 400" {...props}>
      <Gradients name="Thinkmill" />
      <g clipPath="url(#a)">
        <g fillRule="evenodd" clipPath="url(#b)" clipRule="evenodd">
          <path
            fill="#FF3838"
            d="M200 400c110.46 0 200-89.54 200-200S310.46 0 200 0 0 89.54 0 200s89.54 200 200 200Z"
          />
          <path
            fill="#FF3838"
            d="M200 400c110.46 0 200-89.54 200-200S310.46 0 200 0 0 89.54 0 200s89.54 200 200 200Z"
          />
          <path
            fill="#fff"
            d="M126.9 229.29c0 11.2 3.73 15.72 13.56 15.72 2.56 0 5.3-.39 6.88-.98v17.5a49.82 49.82 0 0 1-12.58 1.77c-21.03 0-30.27-8.85-30.27-30.67v-53.28H87.78v-17.1h16.7v-24.97h22.42v24.97h19.46v17.1H126.9v49.94Zm119.13-51.31c7.27-11.4 16.9-18.09 32.04-18.09 21.23 0 34.2 13.76 34.2 40.7v61.53h-22.4v-59.37c0-17.7-6.88-24.77-18.09-24.77-13.17 0-21.03 11.2-21.03 30.27v53.87h-22.41v-61.73c0-14.16-6.3-22.41-17.9-22.41-13.36 0-21.03 11.4-21.03 30.66v53.48h-22.4v-99.87h21.42v12h.4c7.07-9.64 15.91-14.36 27.71-14.36 13.76 0 24.38 6.3 29.49 18.09Z"
          />
        </g>
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h400v400H0z" />
        </clipPath>
        <clipPath id="b">
          <path fill="#fff" d="M0 0h400v400H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}
