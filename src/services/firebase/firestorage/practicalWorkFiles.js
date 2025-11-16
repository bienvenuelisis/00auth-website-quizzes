/**
 * @fileoverview Firebase Storage service for Practical Work files
 * Handles file uploads, downloads, and deletions for practical work deliverables
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata
} from 'firebase/storage';
import { storage } from '../../../config/firebase';
import { saveFileMetadata } from '../firestore/practicalWorks';

// Storage paths
const PRACTICAL_WORKS_PATH = 'practical-works';

/**
 * Get storage path for a practical work file
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} fileName - File name
 * @returns {string} Storage path
 */
function getPracticalWorkFilePath(userId, practicalWorkId, fileName) {
  // Clean filename to remove special characters
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${PRACTICAL_WORKS_PATH}/${userId}/${practicalWorkId}/${cleanFileName}`;
}

/**
 * Validate file before upload
 * @param {File} file - File object
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
function validateFile(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime'
    ]
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${maxSize / 1024 / 1024}MB)`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Upload a file for a practical work
 * @param {File} file - File to upload
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} deliverableId - Deliverable ID
 * @param {Function} onProgress - Progress callback (percent)
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
export async function uploadPracticalWorkFile(
  file,
  userId,
  practicalWorkId,
  deliverableId,
  onProgress = null
) {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Create storage reference
    const filePath = getPracticalWorkFilePath(userId, practicalWorkId, file.name);
    const storageRef = ref(storage, filePath);

    // Upload with progress tracking if callback provided
    let uploadTask;
    if (onProgress) {
      uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          throw error;
        }
      );

      await uploadTask;
    } else {
      await uploadBytes(storageRef, file);
    }

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Save file metadata to Firestore
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      url: downloadURL
    };

    const metadataId = await saveFileMetadata(
      userId,
      practicalWorkId,
      deliverableId,
      fileInfo
    );

    return {
      success: true,
      url: downloadURL,
      metadata: {
        id: metadataId,
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath
      }
    };
  } catch (error) {
    console.error('Error uploading practical work file:', error);
    throw error;
  }
}

/**
 * Upload multiple files
 * @param {Array<File>} files - Files to upload
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} deliverableId - Deliverable ID
 * @param {Function} onProgress - Progress callback (fileIndex, percent)
 * @returns {Promise<Array<Object>>} Upload results
 */
export async function uploadMultiplePracticalWorkFiles(
  files,
  userId,
  practicalWorkId,
  deliverableId,
  onProgress = null
) {
  const results = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const result = await uploadPracticalWorkFile(
        file,
        userId,
        practicalWorkId,
        deliverableId,
        onProgress ? (percent) => onProgress(i, percent) : null
      );
      results.push(result);
    } catch (error) {
      errors.push({
        file: file.name,
        error: error.message
      });
    }
  }

  return {
    successful: results,
    failed: errors,
    totalUploaded: results.length,
    totalFailed: errors.length
  };
}

/**
 * Delete a file from storage
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} fileName - File name
 * @returns {Promise<void>}
 */
export async function deletePracticalWorkFile(userId, practicalWorkId, fileName) {
  try {
    const filePath = getPracticalWorkFilePath(userId, practicalWorkId, fileName);
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting practical work file:', error);
    throw error;
  }
}

/**
 * Delete all files for a practical work submission
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteAllPracticalWorkFiles(userId, practicalWorkId) {
  try {
    const folderPath = `${PRACTICAL_WORKS_PATH}/${userId}/${practicalWorkId}`;
    const folderRef = ref(storage, folderPath);

    // List all files in the folder
    const listResult = await listAll(folderRef);

    // Delete each file
    const deletionPromises = listResult.items.map(item => deleteObject(item));
    await Promise.all(deletionPromises);

    return {
      success: true,
      deletedCount: listResult.items.length
    };
  } catch (error) {
    console.error('Error deleting all practical work files:', error);
    throw error;
  }
}

/**
 * Get file metadata from storage
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} fileName - File name
 * @returns {Promise<Object>} File metadata
 */
export async function getPracticalWorkFileMetadata(userId, practicalWorkId, fileName) {
  try {
    const filePath = getPracticalWorkFilePath(userId, practicalWorkId, fileName);
    const fileRef = ref(storage, filePath);
    const metadata = await getMetadata(fileRef);

    return {
      name: metadata.name,
      size: metadata.size,
      contentType: metadata.contentType,
      created: metadata.timeCreated,
      updated: metadata.updated,
      fullPath: metadata.fullPath
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}

/**
 * List all files for a practical work
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @returns {Promise<Array<Object>>} List of files with metadata
 */
export async function listPracticalWorkFiles(userId, practicalWorkId) {
  try {
    const folderPath = `${PRACTICAL_WORKS_PATH}/${userId}/${practicalWorkId}`;
    const folderRef = ref(storage, folderPath);

    const listResult = await listAll(folderRef);

    // Get metadata and download URLs for each file
    const filePromises = listResult.items.map(async (itemRef) => {
      const metadata = await getMetadata(itemRef);
      const downloadURL = await getDownloadURL(itemRef);

      return {
        name: metadata.name,
        size: metadata.size,
        type: metadata.contentType,
        url: downloadURL,
        created: metadata.timeCreated,
        updated: metadata.updated,
        fullPath: metadata.fullPath
      };
    });

    return await Promise.all(filePromises);
  } catch (error) {
    console.error('Error listing practical work files:', error);
    throw error;
  }
}

/**
 * Get download URL for a file
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} fileName - File name
 * @returns {Promise<string>} Download URL
 */
export async function getPracticalWorkFileURL(userId, practicalWorkId, fileName) {
  try {
    const filePath = getPracticalWorkFilePath(userId, practicalWorkId, fileName);
    const fileRef = ref(storage, filePath);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
}

/**
 * Check if a file exists
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} fileName - File name
 * @returns {Promise<boolean>} True if file exists
 */
export async function practicalWorkFileExists(userId, practicalWorkId, fileName) {
  try {
    const filePath = getPracticalWorkFilePath(userId, practicalWorkId, fileName);
    const fileRef = ref(storage, filePath);
    await getMetadata(fileRef);
    return true;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      return false;
    }
    throw error;
  }
}

/**
 * Get total storage used by a user for practical works
 * @param {string} userId - User ID
 * @returns {Promise<number>} Total bytes used
 */
export async function getUserPracticalWorkStorageUsed(userId) {
  try {
    const userFolderPath = `${PRACTICAL_WORKS_PATH}/${userId}`;
    const userFolderRef = ref(storage, userFolderPath);

    const listResult = await listAll(userFolderRef);

    let totalSize = 0;

    // Recursively get all files
    const getSize = async (folderRef) => {
      const result = await listAll(folderRef);

      for (const itemRef of result.items) {
        const metadata = await getMetadata(itemRef);
        totalSize += metadata.size;
      }

      for (const prefixRef of result.prefixes) {
        await getSize(prefixRef);
      }
    };

    await getSize(userFolderRef);

    return totalSize;
  } catch (error) {
    console.error('Error getting user storage usage:', error);
    return 0;
  }
}

export default {
  uploadPracticalWorkFile,
  uploadMultiplePracticalWorkFiles,
  deletePracticalWorkFile,
  deleteAllPracticalWorkFiles,
  getPracticalWorkFileMetadata,
  listPracticalWorkFiles,
  getPracticalWorkFileURL,
  practicalWorkFileExists,
  getUserPracticalWorkStorageUsed
};
