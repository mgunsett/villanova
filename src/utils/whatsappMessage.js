export const buildWhatsAppMessage = (items, subtotal, customerName = "", shippingInfo = null) => {
  let msg = `🏄 *Nuevo pedido VILLAANOVA*\n\n`;
  if (customerName) msg += `👤 ${customerName}\n\n`;
  msg += `📦 *Detalle del pedido:*\n`;
  items.forEach((item) => {
    const price = item.product.salePrice || item.product.price;
    const colorText = item.color ? `, Color ${item.color}` : "";
    msg += `• ${item.product.name} (Talle ${item.size}${colorText}) x${item.quantity} — $${price * item.quantity}\n`;
  });

  const shippingCost = shippingInfo?.cost || 0;
  const total = subtotal + shippingCost;

  msg += `\n💰 *Subtotal productos: $${subtotal}*\n`;

  if (shippingInfo?.method === "local") {
    msg += `📍 *Entrega:* Retiro por local — GRATIS\n`;
  } else if (shippingInfo?.method === "delivery") {
    const label = shippingCost === 3000 ? "Envío cercano" : "Envío a domicilio";
    msg += `🚚 *${label} (${shippingInfo.city}):* $${shippingCost}\n`;
  }

  msg += `\n🛍️ *Total a abonar: $${total}*`;
  return encodeURIComponent(msg);
};
