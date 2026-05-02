import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import {
  buildInventoryPayload,
  getSizeTotalsFromVariantStock,
  normalizeColorList,
  normalizeSizeTotals,
  normalizeVariantStock,
} from "../../utils/inventory";

const PRODUCTS_COL = "products";

const getCreatedAtValue = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") return (value.seconds * 1000) + Math.floor((value.nanoseconds || 0) / 1000000);
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortProductsByCreatedAtDesc = (products) => (
  [...products].sort((a, b) => getCreatedAtValue(b.createdAt) - getCreatedAtValue(a.createdAt))
);

/* Normaliza un documento de Firestore para que siempre tenga la forma esperada */
const normalizeProduct = (raw) => ({
  ...raw,
  name:        raw.name        || "Sin nombre",
  price:       Number(raw.price) || 0,
  salePrice:   raw.salePrice != null ? Number(raw.salePrice) : null,
  category:    raw.category    || "",
  description: raw.description || "",
  images:      Array.isArray(raw.images) ? raw.images : raw.image ? [raw.image] : [],
  colors:      normalizeColorList(
                 Array.isArray(raw.colors)
                   ? raw.colors
                   : typeof raw.color === "string" && raw.color.trim()
                     ? [raw.color.trim()]
                     : []
               ),
  variantStock: normalizeVariantStock(
                  raw.variantStock,
                  (raw.sizes && typeof raw.sizes === "object" && !Array.isArray(raw.sizes))
                    ? raw.sizes
                    : Array.isArray(raw.sizes)
                      ? Object.fromEntries(raw.sizes.map((s) => [s, 99]))
                      : {},
                  raw.colors
                ),
  sizes:       getSizeTotalsFromVariantStock(
                 normalizeVariantStock(
                   raw.variantStock,
                   (raw.sizes && typeof raw.sizes === "object" && !Array.isArray(raw.sizes))
                     ? raw.sizes
                     : Array.isArray(raw.sizes)
                       ? Object.fromEntries(raw.sizes.map((s) => [s, 99]))
                       : {},
                   raw.colors
                 ),
                 normalizeSizeTotals(raw.sizes)
               ),
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
  const limitValue = filters.limit ? Number(filters.limit) : null;
  const constraintsWithLimit = limitValue ? [...constraints, limit(limitValue)] : constraints;

  /* orderBy("createdAt") requiere índice compuesto; intentamos con él y sin él */
  try {
    const snap = await getDocs(query(col, ...constraintsWithLimit, orderBy("createdAt", "desc")));
    const products = snap.docs.map((d) => normalizeProduct({ id: d.id, ...d.data() }));
    return products;
  } catch (indexErr) {
    const snap = await getDocs(query(col, ...constraints));
    const products = sortProductsByCreatedAtDesc(
      snap.docs.map((d) => normalizeProduct({ id: d.id, ...d.data() }))
    );
    return limitValue ? products.slice(0, limitValue) : products;
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
  const inventory = buildInventoryPayload({
    variantStock: data.variantStock || {},
    colors: data.colors || [],
  });

  return addDoc(collection(db, PRODUCTS_COL), {
    ...data,
    ...inventory,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateProduct = async (id, data) => {
  const inventory = data.variantStock || data.colors || data.sizes
    ? buildInventoryPayload({
        variantStock: data.variantStock || normalizeVariantStock({}, data.sizes, data.colors),
        colors: data.colors || [],
      })
    : null;

  return updateDoc(doc(db, PRODUCTS_COL, id), {
    ...data,
    ...(inventory || {}),
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id) => {
  return updateDoc(doc(db, PRODUCTS_COL, id), { active: false, updatedAt: serverTimestamp() });
};

export const hardDeleteProduct = async (id) => {
  return deleteDoc(doc(db, PRODUCTS_COL, id));
};

export const getFeaturedProducts = () => getProducts({ featured: true, limit: 1 });

export const getRelatedProducts = async (category, excludeId, max = 4) => {
  const products = await getProducts({ category, limit: max + 1 });
  return products.filter((p) => p.id !== excludeId).slice(0, max);
};
