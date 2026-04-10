import { doc, updateDoc } from "firebase/firestore";
import { db } from "./config";

export const updateStock = async (productId, sizes) => {
  return updateDoc(doc(db, "products", productId), { sizes });
};
