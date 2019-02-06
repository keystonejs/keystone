import TextController from '../Text/Controller';

export default class ContentController extends TextController {
  getValue = data => {
    const { path } = this.config;
    if (!data || !data[path]) {
      // Forcibly return null if empty string
      return { structure: null };
    }
    return { structure: data[path] };
  };
}
