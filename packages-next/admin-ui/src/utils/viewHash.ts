import crypto from 'crypto';

// Generate an 8-character hash of a views path
export const viewHash = (views: string) =>
  `view${crypto.createHash('sha256').update(views).digest('hex').slice(0, 8)}`;
