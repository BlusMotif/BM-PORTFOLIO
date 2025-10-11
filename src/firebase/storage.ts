import { ref, set, get, push, remove } from 'firebase/database';
import { database } from './firebase';

// Convert file to base64 string
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// Chunk size for large files (4MB to stay under 5MB limit)
const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB

// Upload file to Realtime Database (with chunking for large files)
export const uploadFile = async (path: string, file: File): Promise<string> => {
  try {
    const base64Data = await fileToBase64(file);
    const sanitizedPath = path.replace(/\./g, '_').replace(/\//g, '_');

    if (file.size <= CHUNK_SIZE) {
      // Validate the base64 data
      if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
        throw new Error('Invalid base64 data for file');
      }

      // Small file - store directly using sanitized path as key
      const fileRef = ref(database, `files/${sanitizedPath}`);
      const fileData = {
        data: base64Data
      };
      await set(fileRef, fileData);
      return sanitizedPath;
    } else {
      // Large file - split into chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const chunkPromises = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const chunkBase64 = await fileToBase64(chunk);

        // Validate the base64 data
        if (!chunkBase64 || typeof chunkBase64 !== 'string' || !chunkBase64.startsWith('data:')) {
          throw new Error(`Invalid base64 data for chunk ${i}`);
        }

        const chunkRef = push(ref(database, `files/${sanitizedPath}`));
        const chunkData = {
          data: chunkBase64,
          index: i,
          total: totalChunks
        };

        chunkPromises.push(set(chunkRef, chunkData));
      }

      await Promise.all(chunkPromises);
      return `${sanitizedPath}_chunked`;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${(error as Error).message}`);
  }
};

// Get file data from Realtime Database by key (reassembles chunks if needed)
export const getFileURL = async (fileKey: string): Promise<string | null> => {
  try {
    if (!fileKey || fileKey.startsWith('data:') || fileKey.startsWith('http')) {
      // If it's already a data URL or HTTP URL, return as-is
      return fileKey;
    }

    // Check if it's a chunked file (ends with _chunked)
    if (fileKey.endsWith('_chunked')) {
      const baseKey = fileKey.replace('_chunked', '');
      const chunkedRef = ref(database, `files/${baseKey}`);
      const chunkedSnapshot = await get(chunkedRef);

      if (chunkedSnapshot.exists()) {
        const chunksData = chunkedSnapshot.val();
        
        // Ensure chunksData is an object and has values
        if (!chunksData || typeof chunksData !== 'object') {
          console.error('Invalid chunks data structure:', chunksData);
          return null;
        }
        
        const chunks = Object.values(chunksData).sort((a: any, b: any) => a.index - b.index);

        // Combine all chunk data
        let combinedBase64 = '';
        for (const chunk of chunks) {
          if (chunk && typeof chunk === 'object' && (chunk as any).data) {
            combinedBase64 += (chunk as any).data.split(',')[1]; // Remove data URL prefix and combine
          }
        }

        // Add back the data URL prefix from the first chunk
        const firstChunk = chunks[0] as any;
        if (firstChunk && firstChunk.data) {
          const mimeType = firstChunk.data.split(';')[0].split(':')[1];
          return `data:${mimeType};base64,${combinedBase64}`;
        }
      }
    } else {
      // Single file - get by exact key
      const fileRef = ref(database, `files/${fileKey}`);
      const snapshot = await get(fileRef);

      if (snapshot.exists()) {
        const fileData = snapshot.val();
        return fileData.data;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
};

// Delete file from database
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const sanitizedPath = path.replace(/\./g, '_').replace(/\//g, '_');

    // Try to delete single file
    const fileRef = ref(database, `files/${sanitizedPath}`);
    await remove(fileRef);

    // Also try to delete chunked files
    const chunkedRef = ref(database, `files/${sanitizedPath}_chunked`);
    await remove(chunkedRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${(error as Error).message}`);
  }
};