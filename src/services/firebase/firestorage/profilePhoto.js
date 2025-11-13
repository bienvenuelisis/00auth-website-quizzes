/**
 * Service de gestion des photos de profil dans Firebase Storage
 */

import { uploadFile, deleteFile, getFileDownloadURL } from './helpers';

const PROFILE_PHOTOS_PATH = 'profile-photos';

/**
 * Upload une photo de profil pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {File} file - Fichier image
 * @param {Object} callbacks - Callbacks pour le suivi
 * @param {Function} [callbacks.onProgress] - Callback de progression (0-100)
 * @param {Function} [callbacks.onError] - Callback d'erreur
 * @param {Function} [callbacks.onSuccess] - Callback de succès avec URL
 * @returns {Promise<string>} - URL de téléchargement de la photo
 */
export async function uploadProfilePhoto(userId, file, callbacks = {}) {
  // Valider le fichier
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    const error = new Error(validation.error);
    callbacks.onError?.(error.message);
    throw error;
  }

  // Générer un nom de fichier unique
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const fileName = `${userId}_${timestamp}.${extension}`;
  const filePath = `${PROFILE_PHOTOS_PATH}/${fileName}`;

  // Métadonnées
  const metadata = {
    contentType: file.type,
    customMetadata: {
      userId,
      uploadedAt: new Date().toISOString()
    }
  };

  try {
    // Upload du fichier
    const downloadURL = await uploadFile({
      filePath,
      file,
      metadata,
      onProgress: callbacks.onProgress,
      onProgressBytes: callbacks.onProgressBytes,
      onError: callbacks.onError,
      onSuccess: callbacks.onSuccess
    });

    return downloadURL;
  } catch (error) {
    callbacks.onError?.(error.message);
    throw error;
  }
}

/**
 * Supprime une photo de profil
 * @param {string} photoURL - URL de la photo à supprimer
 * @returns {Promise<void>}
 */
export async function deleteProfilePhoto(photoURL) {
  if (!photoURL) return;

  try {
    // Extraire le chemin depuis l'URL
    const path = extractPathFromURL(photoURL);
    if (path) {
      await deleteFile(path);
    }
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    throw error;
  }
}

/**
 * Récupère l'URL de téléchargement d'une photo de profil
 * @param {string} userId - ID de l'utilisateur
 * @param {string} fileName - Nom du fichier
 * @returns {Promise<string>} - URL de téléchargement
 */
export async function getProfilePhotoURL(userId, fileName) {
  const filePath = `${PROFILE_PHOTOS_PATH}/${fileName}`;
  return await getFileDownloadURL(filePath);
}

/**
 * Valide un fichier image
 * @param {File} file - Fichier à valider
 * @returns {{isValid: boolean, error?: string}}
 */
function validateImageFile(file) {
  // Vérifier que c'est bien un fichier
  if (!file || !(file instanceof File)) {
    return { isValid: false, error: 'Invalid file' };
  }

  // Vérifier le type MIME
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG and WebP are allowed.'
    };
  }

  // Vérifier la taille (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File too large. Maximum size is 5MB.'
    };
  }

  return { isValid: true };
}

/**
 * Extrait le chemin du fichier depuis une URL Firebase Storage
 * @param {string} url - URL Firebase Storage
 * @returns {string|null} - Chemin du fichier
 */
function extractPathFromURL(url) {
  try {
    // Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?token=...
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/);
    if (pathMatch) {
      return decodeURIComponent(pathMatch[1]);
    }
    return null;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
}

/**
 * Redimensionne une image avant l'upload (client-side)
 * @param {File} file - Fichier image
 * @param {number} maxWidth - Largeur maximale
 * @param {number} maxHeight - Hauteur maximale
 * @returns {Promise<Blob>} - Image redimensionnée
 */
export async function resizeImage(file, maxWidth = 800, maxHeight = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculer les nouvelles dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Créer un canvas et redimensionner
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          file.type,
          0.9
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Prépare une image pour l'upload (redimensionne si nécessaire)
 * @param {File} file - Fichier image
 * @returns {Promise<File|Blob>} - Image prête pour l'upload
 */
export async function prepareImageForUpload(file) {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Si l'image est trop grande, la redimensionner
  if (file.size > 1024 * 1024) {
    // > 1MB
    const resizedBlob = await resizeImage(file);
    return new File([resizedBlob], file.name, { type: file.type });
  }

  return file;
}
