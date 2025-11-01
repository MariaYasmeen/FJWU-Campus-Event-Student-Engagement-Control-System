import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadFile({ file, pathPrefix, uid }) {
  if (!file) throw new Error('No file provided');
  const safeName = file.name?.replace(/[^a-zA-Z0-9_.-]/g, '_') || `file_${Date.now()}`;
  const fullPath = `${pathPrefix}/${uid}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, fullPath);
  const metadata = { contentType: file.type || 'application/octet-stream' };
  const snap = await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(snap.ref);
  return { url, path: fullPath };
}