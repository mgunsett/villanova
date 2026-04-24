import { doc, updateDoc } from "firebase/firestore";
import { db } from "./config";
import { buildInventoryPayload } from "../../utils/inventory";

export const updateStock = async (productId, { variantStock, colors = [] }) => {
  const inventory = buildInventoryPayload({ variantStock, colors });
  return updateDoc(doc(db, "products", productId), inventory);
};
