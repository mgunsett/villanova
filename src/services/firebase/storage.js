import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

export const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path);
  const snap = await uploadBytes(storageRef, file);
  return getDownloadURL(snap.ref);
};
