import {
  collection, doc, getDocs, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const ORDERS_COL = "orders";

export const createOrder = async (orderData) => {
  return addDoc(collection(db, ORDERS_COL), {
    ...orderData,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getOrders = async (filters = {}) => {
  const constraints = [];
  if (filters.userId) constraints.push(where("userId", "==", filters.userId));
  if (filters.status) constraints.push(where("status", "==", filters.status));
  constraints.push(orderBy("createdAt", "desc"));

  const snap = await getDocs(query(collection(db, ORDERS_COL), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateOrderStatus = async (id, status) => {
  return updateDoc(doc(db, ORDERS_COL, id), {
    status,
    updatedAt: serverTimestamp(),
  });
};
