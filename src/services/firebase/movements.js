import {
  collection, getDocs, addDoc, query, orderBy,
  where, serverTimestamp, limit,
} from "firebase/firestore";
import { db } from "./config";

const MOVEMENTS_COL = "stockMovements";

/**
 * Registra un movimiento de stock
 * @param {{ productId, productName, sizeKey, colorKey, quantity, type, reason }} data
 * type: "in" | "out" | "adjustment"
 */
export const createMovement = async (data) => {
  return addDoc(collection(db, MOVEMENTS_COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getMovements = async (filters = {}) => {
  const constraints = [];
  if (filters.productId) constraints.push(where("productId", "==", filters.productId));
  if (filters.type) constraints.push(where("type", "==", filters.type));
  constraints.push(orderBy("createdAt", "desc"));
  if (filters.limit) constraints.push(limit(filters.limit));

  const snap = await getDocs(query(collection(db, MOVEMENTS_COL), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
