
import classnames from 'classnames'
import { type HTMLAttributes } from 'react'

type AlertProps = {
  look?: 'neutral' | 'tip' | 'warn' | 'error'
} & HTMLAttributes<HTMLElement>

export function Alert ({ look = 'neutral', className, ...props }: AlertProps) {
  const classes = classnames('hint', look, className) // styles for this component can be found in the _app.js file
  return <div className={classes} {...props} />
}
