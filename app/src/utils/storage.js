import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadFile({ uri, file, pathPrefix, uid }) {
  const safeName = (file?.name || `file_${Date.now()}`).replace(/[^a-zA-Z0-9_.-]/g, '_');
  const fullPath = `${pathPrefix}/${uid}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, fullPath);
  let blob;
  let contentType = file?.type || 'application/octet-stream';
  if (uri) {
    const res = await fetch(uri);
    blob = await res.blob();
    contentType = blob.type || contentType;
  } else if (file) {
    blob = file;
  } else {
    throw new Error('No file or uri provided');
  }
  const snap = await uploadBytes(storageRef, blob, { contentType });
  const url = await getDownloadURL(snap.ref);
  return { url, path: fullPath };
}