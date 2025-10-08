import { ref, set, get, push, remove } from 'firebase/database';
import { database } from './firebase';

// Convert file to base64 string
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
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
      // Small file - store directly
      const fileRef = push(ref(database, `files/${sanitizedPath}`));
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64Data,
        uploadedAt: new Date().toISOString(),
        originalPath: path,
        chunks: 1,
        chunkIndex: 0
      };
      await set(fileRef, fileData);
      return fileRef.key!;
    } else {
      // Large file - split into chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const chunkPromises = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const chunkBase64 = await fileToBase64(chunk);

        const chunkRef = push(ref(database, `files/${sanitizedPath}`));
        const chunkData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: chunkBase64,
          uploadedAt: new Date().toISOString(),
          originalPath: path,
          chunks: totalChunks,
          chunkIndex: i,
          totalSize: file.size
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
      const chunkedRef = ref(database, `files/${baseKey}_chunked`);
      const chunkedSnapshot = await get(chunkedRef);

      if (chunkedSnapshot.exists()) {
        const chunksData = chunkedSnapshot.val();
        const chunks = Object.values(chunksData).sort((a: any, b: any) => a.chunkIndex - b.chunkIndex);

        // Combine all chunk data
        let combinedBase64 = '';
        for (const chunk of chunks) {
          combinedBase64 += (chunk as any).data.split(',')[1]; // Remove data URL prefix and combine
        }

        // Add back the data URL prefix from the first chunk
        const firstChunk = chunks[0] as any;
        return `data:${firstChunk.type};base64,${combinedBase64}`;
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