import apiClient from '../api/client.js';

/**
 * @description Uploads a CSV file and returns the parsed import batch preview.
 * @param {File} file - CSV file selected by the user
 * @param {(progress: number) => void} onProgress - Upload progress callback
 * @returns {Promise<Object>} API Response containing import batch metadata and parsed rows
 */
export const uploadCsvImport = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post('/imports/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (!progressEvent.total || typeof onProgress !== 'function') {
        return;
      }

      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(Math.min(percentCompleted, 100));
    }
  });
};

export default {
  uploadCsvImport
};
