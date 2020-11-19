import React, { useMemo } from 'react';

type AssignableRef<T = any> = React.Ref<T | null>;

/**
 * Passes or assigns an arbitrary value to a ref function or object.
 *
 * @param ref
 * @param value
 */
function assignRef<T = any>(ref: AssignableRef<T>, value: any) {
	if (ref == null) return;
	if (typeof ref === 'function') {
		ref(value);
	} else {
		try {
			// @ts-ignore
			ref.current = value;
		} catch (error) {
			throw new Error(`Cannot assign value "${value}" to ref "${ref}"`);
		}
	}
}

/**
 * Passes or assigns a value to multiple refs (typically a DOM node). Useful for
 * dealing with components that need an explicit ref for DOM calculations but
 * also forwards refs assigned by an app.
 *
 * @param refs Refs to fork
 */
export function useForkedRef<T = any>(...refs: AssignableRef<T>[]) {
	return useMemo(() => {
		if (refs.every((ref) => ref == null)) {
			return null;
		}

		return (node: any) => {
			refs.forEach((ref) => {
				assignRef(ref, node);
			});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, refs);
}
