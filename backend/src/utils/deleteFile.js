import fs from 'fs/promises';
import path from 'path';

export const deleteUploadedFile = async (filePath) => {
  if (!filePath) return;

  const absolutePath = path.resolve(filePath);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};
