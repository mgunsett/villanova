import { SIZES } from "./constants";

export const DEFAULT_COLOR_KEY = "__default";

const toStock = (value) => Math.max(0, Number(value) || 0);

const uniq = (values) => [...new Set(values)];

export const getAllSizeKeys = () => SIZES.map((size) => (typeof size === "object" ? size.key : size));

export const normalizeColorList = (colors = []) => uniq(
  (Array.isArray(colors) ? colors : [])
    .map((color) => String(color).trim())
    .filter(Boolean)
);

export const normalizeSizeTotals = (rawSizes = {}) => {
  if (!rawSizes || typeof rawSizes !== "object" || Array.isArray(rawSizes)) return {};

  return Object.fromEntries(
    Object.entries(rawSizes)
      .map(([sizeKey, stock]) => [String(sizeKey).trim(), toStock(stock)])
      .filter(([sizeKey]) => sizeKey)
  );
};

export const normalizeVariantStock = (rawVariantStock = {}, rawSizes = {}, rawColors = []) => {
  const variantStock = rawVariantStock && typeof rawVariantStock === "object" && !Array.isArray(rawVariantStock)
    ? rawVariantStock
    : {};
  const sizeTotals = normalizeSizeTotals(rawSizes);
  const colors = normalizeColorList(rawColors);
  const sizeKeys = uniq([...Object.keys(sizeTotals), ...Object.keys(variantStock)]);

  return Object.fromEntries(
    sizeKeys.map((sizeKey) => {
      const rawRow = variantStock[sizeKey];
      if (rawRow && typeof rawRow === "object" && !Array.isArray(rawRow)) {
        const normalizedRow = Object.fromEntries(
          Object.entries(rawRow)
            .map(([colorKey, stock]) => [String(colorKey).trim(), toStock(stock)])
            .filter(([colorKey]) => colorKey)
        );

        if (Object.keys(normalizedRow).length > 0) {
          return [sizeKey, normalizedRow];
        }
      }

      const fallbackStock = sizeTotals[sizeKey] ?? 0;
      if (colors.length === 1) {
        return [sizeKey, { [colors[0]]: fallbackStock }];
      }

      return [sizeKey, { [DEFAULT_COLOR_KEY]: fallbackStock }];
    })
  );
};

export const getSizeTotalsFromVariantStock = (variantStock = {}, fallbackSizes = {}) => {
  const normalizedFallback = normalizeSizeTotals(fallbackSizes);
  const rows = variantStock && typeof variantStock === "object" && !Array.isArray(variantStock)
    ? Object.entries(variantStock)
    : [];

  if (!rows.length) return normalizedFallback;

  return Object.fromEntries(
    rows.map(([sizeKey, row]) => {
      const total = row && typeof row === "object" && !Array.isArray(row)
        ? Object.values(row).reduce((sum, stock) => sum + toStock(stock), 0)
        : 0;
      return [sizeKey, total];
    })
  );
};

export const getProductSizeTotals = (product = {}) => (
  getSizeTotalsFromVariantStock(product.variantStock, product.sizes)
);

export const getTotalStock = (productOrSizes = {}) => {
  const sizes = productOrSizes.variantStock || productOrSizes.sizes
    ? getProductSizeTotals(productOrSizes)
    : normalizeSizeTotals(productOrSizes);

  return Object.values(sizes).reduce((sum, stock) => sum + toStock(stock), 0);
};

export const isProductOutOfStock = (product = {}) => getTotalStock(product) === 0;

export const hasExplicitColorStock = (product = {}, sizeKey = null) => {
  const rows = product.variantStock && typeof product.variantStock === "object" ? product.variantStock : {};
  const targets = sizeKey ? [[sizeKey, rows[sizeKey]]] : Object.entries(rows);
  return targets.some(([, row]) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return false;
    return Object.keys(row).some((colorKey) => colorKey !== DEFAULT_COLOR_KEY);
  });
};

export const getSizeStock = (product = {}, sizeKey) => {
  const sizes = getProductSizeTotals(product);
  return toStock(sizes[sizeKey]);
};

export const getVariantStock = (product = {}, sizeKey, color = null) => {
  const row = product.variantStock?.[sizeKey];

  if (row && typeof row === "object" && !Array.isArray(row)) {
    if (color && row[color] != null) return toStock(row[color]);
    if (row[DEFAULT_COLOR_KEY] != null) return toStock(row[DEFAULT_COLOR_KEY]);
  }

  const sizeStock = product.sizes?.[sizeKey];
  return toStock(sizeStock);
};

export const getAvailableColorsForSize = (product = {}, sizeKey) => {
  if (!sizeKey) return [];

  const row = product.variantStock?.[sizeKey];
  if (row && typeof row === "object" && !Array.isArray(row)) {
    const explicit = Object.entries(row)
      .filter(([colorKey, stock]) => colorKey !== DEFAULT_COLOR_KEY && toStock(stock) > 0)
      .map(([colorKey, stock]) => ({ value: colorKey, label: colorKey, stock: toStock(stock) }));

    if (explicit.length > 0) return explicit;
  }

  const sizeStock = getSizeStock(product, sizeKey);
  if (sizeStock <= 0) return [];

  return normalizeColorList(product.colors).map((color) => ({
    value: color,
    label: color,
    stock: sizeStock,
  }));
};

export const syncVariantStockShape = (variantStock = {}, sizeKeys = [], colors = []) => {
  const normalizedColors = normalizeColorList(colors);
  const uniqueSizes = uniq(sizeKeys.filter(Boolean));

  return Object.fromEntries(
    uniqueSizes.map((sizeKey) => {
      const currentRow = variantStock[sizeKey] && typeof variantStock[sizeKey] === "object" && !Array.isArray(variantStock[sizeKey])
        ? variantStock[sizeKey]
        : {};

      if (!normalizedColors.length) {
        return [sizeKey, { [DEFAULT_COLOR_KEY]: toStock(currentRow[DEFAULT_COLOR_KEY]) }];
      }

      const hasExplicitColorStock = normalizedColors.some((color) => currentRow[color] != null);
      const fallbackDefaultStock = toStock(currentRow[DEFAULT_COLOR_KEY]);

      const nextRow = Object.fromEntries(
        normalizedColors.map((color, index) => [
          color,
          toStock(
            currentRow[color] != null
              ? currentRow[color]
              : !hasExplicitColorStock && index === 0
                ? fallbackDefaultStock
                : 0
          ),
        ])
      );

      return [sizeKey, nextRow];
    })
  );
};

export const buildInventoryPayload = ({ variantStock = {}, colors = [] }) => {
  const normalizedColors = normalizeColorList(colors);
  const normalizedVariantStock = syncVariantStockShape(variantStock, Object.keys(variantStock), normalizedColors);
  const sizes = getSizeTotalsFromVariantStock(normalizedVariantStock);

  return {
    colors: normalizedColors,
    variantStock: normalizedVariantStock,
    sizes,
  };
};