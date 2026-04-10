import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  query, where, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const PRODUCTS_COL = "products";

/* Normaliza un documento de Firestore para que siempre tenga la forma esperada */
const normalizeProduct = (raw) => ({
  ...raw,
  name:        raw.name        || "Sin nombre",
  price:       Number(raw.price) || 0,
  salePrice:   raw.salePrice != null ? Number(raw.salePrice) : null,
  category:    raw.category    || "",
  description: raw.description || "",
  images:      Array.isArray(raw.images) ? raw.images : raw.image ? [raw.image] : [],
  sizes:       (raw.sizes && typeof raw.sizes === "object" && !Array.isArray(raw.sizes))
                 ? raw.sizes
                 : Array.isArray(raw.sizes)
                   ? Object.fromEntries(raw.sizes.map((s) => [s, 99]))
                   : {},
  featured:    raw.featured === true,
  active:      raw.active !== false,
});

export const getProducts = async (filters = {}) => {
  const col = collection(db, PRODUCTS_COL);
  const constraints = [];

  if (filters.includeInactive !== true) {
    constraints.push(where("active", "==", true));
  }

  if (filters.category) constraints.push(where("category", "==", filters.category));
  if (filters.featured !== undefined) constraints.push(where("featured", "==", filters.featured));
  if (filters.limit) constraints.push(limit(filters.limit));

  /* orderBy("createdAt") requiere índice compuesto; intentamos con él y sin él */
  try {
    const snap = await getDocs(query(col, ...constraints, orderBy("createdAt", "desc")));
    const products = snap.docs.map((d) => normalizeProduct({ id: d.id, ...d.data() }));
    console.log("[Villaanova] Productos cargados:", products.length, products);
    return products;
  } catch (indexErr) {
    console.warn("[Villaanova] Query con orderBy falló (¿falta índice compuesto?). Reintentando sin orderBy…", indexErr.message);
    const snap = await getDocs(query(col, ...constraints));
    const products = snap.docs.map((d) => normalizeProduct({ id: d.id, ...d.data() }));
    console.log("[Villaanova] Productos cargados (sin orden):", products.length, products);
    return products;
  }
};

export const getProductBySlug = async (slug) => {
  const q = query(
    collection(db, PRODUCTS_COL),
    where("slug", "==", slug),
    where("active", "==", true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return normalizeProduct({ id: snap.docs[0].id, ...snap.docs[0].data() });
};

export const getProductById = async (id) => {
  const snap = await getDoc(doc(db, PRODUCTS_COL, id));
  return snap.exists() ? normalizeProduct({ id: snap.id, ...snap.data() }) : null;
};

export const createProduct = async (data) => {
  return addDoc(collection(db, PRODUCTS_COL), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateProduct = async (id, data) => {
  return updateDoc(doc(db, PRODUCTS_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id) => {
  return updateDoc(doc(db, PRODUCTS_COL, id), { active: false, updatedAt: serverTimestamp() });
};

export const getFeaturedProducts = () => getProducts({ featured: true, limit: 1 });

export const getRelatedProducts = async (category, excludeId, max = 4) => {
  const products = await getProducts({ category, limit: max + 1 });
  return products.filter((p) => p.id !== excludeId).slice(0, max);
};
