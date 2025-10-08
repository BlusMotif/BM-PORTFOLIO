import { ref, get, set, push, update, remove, onValue } from 'firebase/database';
import { database } from './firebase';

// Function to get data from a path
export const getData = async (path: string) => {
  const dataRef = ref(database, path);
  const snapshot = await get(dataRef);
  return snapshot.val();
};

// Function to set data at a path
export const setData = async (path: string, data: any) => {
  const dataRef = ref(database, path);
  await set(dataRef, data);
};

// Function to update data at a path
export const updateData = async (path: string, data: any) => {
  const dataRef = ref(database, path);
  await update(dataRef, data);
};

// Function to push new data (for lists)
export const pushData = async (path: string, data: any) => {
  const dataRef = ref(database, path);
  const newRef = push(dataRef);
  await set(newRef, data);
  return newRef.key;
};

// Function to remove data
export const removeData = async (path: string) => {
  const dataRef = ref(database, path);
  await remove(dataRef);
};

// Real-time listener
export { onValue, ref };