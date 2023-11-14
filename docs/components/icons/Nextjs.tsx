/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react'

import { Gradients, type IconProps } from './util'

export function Nextjs({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 102 52"
      aria-label="Nextjs"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Nextjs" />
      <path
        fill={grad ? `url(#Nextjs-${grad})` : 'currentColor'}
        stroke={grad ? `url(#Nextjs-${grad})` : 'currentColor'}
        strokeWidth="0.5"
        d="M24.584 14.0407H43.4351V15.2832H26.312V24.6341H42.414V25.8766H26.312V36.143H43.6314V37.3854H24.584V14.0407ZM45.1238 14.0407H47.1268L56.0025 24.3072L65.0746 14.0407L77.4141 1L57.1414 25.3861L67.588 37.3854H65.5066L56.0025 26.4651L46.4591 37.3854H44.4169L54.9421 25.3861L45.1238 14.0407ZM68.3342 15.2832V14.0407H89.8166V15.2832H79.9198V37.3854H78.1918V15.2832H68.3342Z"
      />
      <path
        fill={grad ? `url(#Nextjs-${grad})` : 'currentColor'}
        stroke={grad ? `url(#Nextjs-${grad})` : 'currentColor'}
        strokeWidth="0.5"
        d="M1 14.0406H3.16002L32.9455 51L20.6366 37.3853L2.80656 15.8062L2.72802 37.3853H1V14.0406Z"
      />
      <path
        fill={grad ? `url(#Nextjs-${grad})` : 'currentColor'}
        stroke={grad ? `url(#Nextjs-${grad})` : 'currentColor'}
        strokeWidth="0.5"
        d="M89.6422 35.768C89.9995 35.768 90.2601 35.5412 90.2601 35.2481C90.2601 34.9549 89.9995 34.7281 89.6422 34.7281C89.2892 34.7281 89.0244 34.9549 89.0244 35.2481C89.0244 35.5412 89.2892 35.768 89.6422 35.768ZM91.3402 34.4001C91.3402 35.2655 92.0926 35.8308 93.1895 35.8308C94.3579 35.8308 95.064 35.2481 95.064 34.236V30.673H94.1226V34.2326C94.1226 34.7944 93.7821 35.0945 93.1811 35.0945C92.6431 35.0945 92.2775 34.8153 92.2649 34.4001H91.3402ZM96.2955 34.3547C96.3627 35.255 97.2664 35.8308 98.6113 35.8308C100.049 35.8308 100.948 35.2271 100.948 34.264C100.948 33.5067 100.435 33.0879 99.1913 32.8471L98.5231 32.711C97.7329 32.5575 97.4135 32.3516 97.4135 31.9922C97.4135 31.5385 97.9094 31.2419 98.6533 31.2419C99.3594 31.2419 99.847 31.5315 99.9352 31.9956H100.851C100.797 31.1476 99.8974 30.5509 98.666 30.5509C97.342 30.5509 96.4594 31.1476 96.4594 32.0445C96.4594 32.7843 96.9596 33.224 98.0565 33.4369L98.8383 33.5939C99.641 33.751 99.9941 33.9813 99.9941 34.3652C99.9941 34.8118 99.4393 35.1364 98.6828 35.1364C97.8716 35.1364 97.3084 34.8328 97.2285 34.3547H96.2955Z"
      />
    </svg>
  )
}
