import { useEffect, useState, useRef, useMemo } from 'react';
import Popper from 'popper.js';

const defaultOpts = {
	placement: 'bottom',
	offset: '0, 0',
	flip: true,
	overflow: true,
};

const usePopper = (popperRef, referenceRef, options, inputs = []) => {
	const [styles, setStyles] = useState({});
	const opts = useMemo(() => ({ ...defaultOpts, ...options }), [
		options.placement,
		options.flip,
		options.overflow,
		options.offset,
	]);

	let instanceRef = useRef(null);

	useEffect(
		() => {
			const areElementsMounted = referenceRef.current !== null && popperRef.current !== null;
			if (areElementsMounted) {
				const instance = new Popper(referenceRef.current, popperRef.current, {
					placement: opts.placement,
					modifiers: {
						flip: {
							enabled: opts.flip,
						},
						preventOverflow: {
							enabled: opts.overflow,
						},
						applyStyle: {
							enabled: false,
						},
						offset: {
							offset: opts.offset,
						},
						setState: {
							order: 900,
							enabled: true,
							fn: data => {
								setStyles(data.offsets.popper);
								return data;
							},
						},
					},
				});
				instanceRef.current = instance;
				return () => {
					instance.destroy();
					setStyles({});

					instanceRef.current = null;
				};
			}
		},
		[opts, popperRef.current, referenceRef.current]
	);

	useEffect(() => {
		if (instanceRef.current !== null) {
			instanceRef.current.scheduleUpdate();
		}
	}, inputs);

	return [styles];
};

export default usePopper;
