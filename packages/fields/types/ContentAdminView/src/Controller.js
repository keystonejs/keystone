import { Controller } from '@voussoir/admin-view-text';

export class ContentController extends Controller {
  getValue = data => {
    const { path } = this.config;
    if (!data || !data[path]) {
      // Forcibly return null if empty string
      return { structure: null };
    }
    return { structure: data[path] };
  };
}
