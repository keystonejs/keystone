import { useBrand } from './Brand';

export const useFonts = ({ path }) => {
	const { TYPE } = useBrand();

	return {
		'': TYPE.files[''].map(file => {
			const { src, ...rest } = file['@font-face'];
			return { '@font-face': { src: src.replace(/_PATH_/g, path), ...rest } };
		}),
	};
};
