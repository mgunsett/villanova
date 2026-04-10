export const buildWhatsAppMessage = (items, subtotal, customerName = "") => {
  let msg = `🏄 *Nuevo pedido VILLAANOVA*\n\n`;
  if (customerName) msg += `👤 ${customerName}\n\n`;
  msg += `📦 *Detalle del pedido:*\n`;
  items.forEach((item) => {
    const price = item.product.salePrice || item.product.price;
    msg += `• ${item.product.name} (Talle ${item.size}) x${item.quantity} — $${price * item.quantity}\n`;
  });
  msg += `\n💰 *Total: $${subtotal}*`;
  return encodeURIComponent(msg);
};
