import { Box, VStack, Text, Button, Input, Divider } from "@chakra-ui/react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatters";
import { useState } from "react";
import toast from "react-hot-toast";
import { buildWhatsAppMessage } from "../utils/whatsappMessage";

const CheckoutPage = () => {
  const { items, subtotal } = useCart();
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [address, setAddress] = useState("");

  const handleWhatsApp = () => {
    if (!name || !phone) {
      toast.error("Completá nombre y teléfono");
      return;
    }
    const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";
    const msg = buildWhatsAppMessage(items, subtotal, name);
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
  };

  if (items.length === 0) {
    return (
      <VStack py={32} spacing={4} textAlign="center">
        <Text fontFamily="heading" fontSize="4xl" color="brand.dark">
          No hay productos en el carrito
        </Text>
      </VStack>
    );
  }

  return (
    <Box maxW="600px" mx="auto" py={{ base: 8, md: 16 }} px={4}>
      <VStack spacing={2} mb={8} textAlign="center">
        <Text fontFamily="heading" fontSize={{ base: "4xl", md: "5xl" }} color="brand.dark">
          Checkout
        </Text>
        <Text fontFamily="body" color="brand.muted">
          Completá tus datos para finalizar la compra
        </Text>
      </VStack>

      <VStack spacing={4} mb={8}>
        <Input placeholder="Nombre completo *" value={name} onChange={(e) => setName(e.target.value)} px={4} py={3} />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} px={4} py={3} />
        <Input placeholder="Teléfono *" value={phone} onChange={(e) => setPhone(e.target.value)} px={4} py={3} />
        <Input placeholder="Dirección de envío" value={address} onChange={(e) => setAddress(e.target.value)} px={4} py={3} />
      </VStack>

      <Divider borderColor="brand.sand" mb={6} />

      <VStack spacing={2} mb={6} align="stretch">
        {items.map((item) => (
          <Box key={item.key} display="flex" justifyContent="space-between">
            <Text fontFamily="body" fontSize="sm" color="brand.dark">
              {item.product.name} ({item.size}) x{item.quantity}
            </Text>
            <Text fontFamily="body" fontSize="sm" fontWeight={700}>
              {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
            </Text>
          </Box>
        ))}
        <Divider borderColor="brand.sand" />
        <Box display="flex" justifyContent="space-between">
          <Text fontFamily="body" fontWeight={700} fontSize="lg">Total</Text>
          <Text fontFamily="body" fontWeight={700} fontSize="lg" color="brand.ocean">{formatPrice(subtotal)}</Text>
        </Box>
      </VStack>

      <VStack spacing={3}>
        <Button variant="whatsapp" size="lg" w="100%" py={7} onClick={handleWhatsApp}>
          Pagar por WhatsApp
        </Button>
        <Text fontFamily="body" fontSize="2xs" color="brand.muted" textAlign="center">
          Te redirigiremos a WhatsApp para coordinar el pago.
        </Text>
      </VStack>
    </Box>
  );
};

export default CheckoutPage;
