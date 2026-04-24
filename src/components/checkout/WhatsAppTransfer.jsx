import { Box, Button, VStack, Text, HStack } from "@chakra-ui/react";
import { MessageCircle } from "lucide-react";
import { TRANSFER_DISCOUNT } from "../../utils/constants";
import { formatPrice } from "../../utils/formatters";
import { buildWhatsAppMessage } from "../../utils/whatsappMessage";

const WhatsAppTransfer = ({ orderData, disabled }) => {
  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";

  const transferTotal = orderData?.subtotal
    ? orderData.subtotal * (1 - TRANSFER_DISCOUNT)
    : 0;

  const handleClick = () => {
    if (disabled || !orderData) return;

    const items = orderData.items.map((i) => ({
      product: { name: i.name, salePrice: i.price, price: i.price },
      size: i.size || "-",
      color: i.color || null,
      quantity: i.quantity,
    }));

    const msg = buildWhatsAppMessage(items, orderData.subtotal, orderData.payer?.name);
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
  };

  return (
    <Box
      bg="brand.white"
      borderRadius="lg"
      border="0.5px solid rgba(160,120,90,0.15)"
      p={5}
    >
      <VStack spacing={3} align="stretch">
        <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
          🏦 Transferencia bancaria
        </Text>
        <HStack justify="space-between">
          <Text fontFamily="body" fontSize="xs" color="brand.muted">
            10% de descuento pagando por transferencia
          </Text>
          <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.success">
            {formatPrice(transferTotal)}
          </Text>
        </HStack>

        <Button
          variant="whatsapp"
          size="lg"
          w="100%"
          py={7}
          fontSize="xs"
          letterSpacing="0.15em"
          leftIcon={<MessageCircle size={18} />}
          onClick={handleClick}
          isDisabled={disabled}
        >
          Coordinar por WhatsApp
        </Button>

        <Text fontFamily="body" fontSize="2xs" color="brand.muted" textAlign="center">
          Te enviaremos los datos de la cuenta para transferir
        </Text>
      </VStack>
    </Box>
  );
};

export default WhatsAppTransfer;
