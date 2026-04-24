import { createContext, useContext, useReducer, useCallback } from "react";
import toast from "react-hot-toast";
import { getSizeStock, getVariantStock, hasExplicitColorStock } from "../utils/inventory";

const CartContext = createContext(null);

const getTakenStock = (items, productId, size, color, currentKey = null, explicitColorStock = false) => (
  items
    .filter((item) => item.product.id === productId && item.size === size && item.key !== currentKey)
    .filter((item) => (explicitColorStock ? item.color === color : true))
    .reduce((sum, item) => sum + item.quantity, 0)
);

const getAvailableQuantity = (items, product, size, color, currentKey = null) => {
  const explicitColorStock = hasExplicitColorStock(product, size);
  const baseStock = explicitColorStock
    ? getVariantStock(product, size, color)
    : getSizeStock(product, size);

  return Math.max(0, baseStock - getTakenStock(items, product.id, size, color, currentKey, explicitColorStock));
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, size, color = null, quantity = 1 } = action.payload;
      const variantKey = color ? `${size}-${color}` : size;
      const key = `${product.id}-${variantKey}`;
      const existing = state.items.find((i) => i.key === key);
      const available = getAvailableQuantity(state.items, product, size, color, key);

      if (available <= 0) return state;

      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, i.quantity + available) } : i
          ),
          lastAdded: { product, size, color, quantity },
        };
      }

      return {
        ...state,
        items: [...state.items, { key, product, size, color, quantity: Math.min(quantity, available) }],
        lastAdded: { product, size, color, quantity },
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.key !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      const { key, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.key !== key) };
      }

      const currentItem = state.items.find((item) => item.key === key);
      if (!currentItem) return state;

      const available = getAvailableQuantity(
        state.items,
        currentItem.product,
        currentItem.size,
        currentItem.color,
        key
      );

      return {
        ...state,
        items: state.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(quantity, available) } : i)),
      };
    }

    case "CLEAR_CART":
      return { ...initialState };

    case "CLEAR_LAST_ADDED":
      return { ...state, lastAdded: null };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  lastAdded: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback((product, size, color = null, quantity = 1) => {
    const available = getAvailableQuantity(state.items, product, size, color);
    if (available <= 0) {
      toast.error("No hay stock disponible para esa variante");
      return;
    }

    dispatch({ type: "ADD_ITEM", payload: { product, size, color, quantity } });
    const variantLabel = color ? `Talle ${size} · Color ${color}` : `Talle ${size}`;
    toast.success(`${product.name} (${variantLabel}) agregado al carrito`);
  }, [state.items]);

  const removeItem = useCallback((key) => {
    dispatch({ type: "REMOVE_ITEM", payload: key });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    const currentItem = state.items.find((item) => item.key === key);
    if (!currentItem) return;

    const available = getAvailableQuantity(state.items, currentItem.product, currentItem.size, currentItem.color, key);
    if (quantity > available) {
      toast.error("No podés superar el stock disponible");
    }
    dispatch({ type: "UPDATE_QUANTITY", payload: { key, quantity } });
  }, [state.items]);

  const getItemMaxQuantity = useCallback((item) => {
    if (!item) return 0;
    return getAvailableQuantity(state.items, item.product, item.size, item.color, item.key);
  }, [state.items]);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const clearLastAdded = useCallback(() => {
    dispatch({ type: "CLEAR_LAST_ADDED" });
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + (i.product.salePrice || i.product.price) * i.quantity, 0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        lastAdded: state.lastAdded,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        getItemMaxQuantity,
        clearCart,
        clearLastAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
