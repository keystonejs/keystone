import React, { createRef, Fragment, useState, useRef, useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

const ContainerQuery = ({ children, render }) => {
  const [width, setWidth] = useState('auto');

  const measureElement = createRef();
  const resizeObserver = useRef();

  useEffect(() => {
    const measure = measureElement.current;

    resizeObserver.current = new ResizeObserver(([entry]) => {
      setWidth(entry.target.offsetWidth);
    });

    resizeObserver.current.observe(measure);
    setWidth(measure.offsetWidth);

    return () => {
      if (resizeObserver && measureElement.current) {
        resizeObserver.current.disconnect(measureElement.current);
      }

      resizeObserver.current = null;
    };
  });

  return render ? (
    render({
      ref: measureElement,
      width,
    })
  ) : (
    <Fragment>
      <div ref={measureElement} />
      {children({ width })}
    </Fragment>
  );
};

export default ContainerQuery;
