import crypto from 'crypto';

export const generateApiKey = () => `gb_${crypto.randomBytes(32).toString('hex')}`;
