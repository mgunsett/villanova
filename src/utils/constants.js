
export const SIZES = [
  { key: "SM", label: "S" },
  { key: "ME", label: "M" },
  { key: "LA", label: "L" },
  { key: "XL", label: "XL" },
];

export const ORDER_STATUS = {
  pending:          { label: "Pendiente",       color: "yellow" },
  approved:         { label: "Aprobado",        color: "green"  },
  transfer_pending: { label: "Transferencia",   color: "blue"   },
  shipped:          { label: "Enviado",         color: "purple" },
  cancelled:        { label: "Cancelado",       color: "red"    },
};

export const TRANSFER_DISCOUNT = 0.10;

export const SHIPPING_COSTS = {
  local:  0,
  nearby: 3000,
  far:    11000,
};

export const NEARBY_CITIES = ["SANTA FE", "SANTO TOME", "RINCON", "COLASTINE"];

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/vilanova.sf/",
  facebook:  "https://facebook.com/villaanova.surfskate",
  tiktok:    "https://tiktok.com/@villaanova.surfskate",
};
