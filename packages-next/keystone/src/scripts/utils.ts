import path from 'path';
// TODO: Read config path from process args
export const CONFIG_PATH = path.join(process.cwd(), 'keystone');

// TODO: Read port from config or process args
export const PORT = process.env.PORT || 3000;
