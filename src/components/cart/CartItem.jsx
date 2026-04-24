import { Box, HStack, Text, Image, VStack, IconButton } from "@chakra-ui/react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatters";

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem, getItemMaxQuantity } = useCart();
  const price = item.product.salePrice || item.product.price;
  const maxQuantity = getItemMaxQuantity(item);
  const canIncrease = item.quantity < maxQuantity;

  return (
    <HStack spacing={4} p={4} bg="brand.white" borderRadius="lg" boxShadow="sm">
      <Image
        src={item.product.images?.[0] || `https://placehold.co/80x80/1565C0/FFFFFF?text=IMG`}
        alt={item.product.name}
        w="80px" h="80px"
        objectFit="cover"
        borderRadius="md"
      />

      <VStack align="flex-start" flex={1} spacing={1}>
        <Text fontFamily="body" fontWeight={600} fontSize="sm" color="brand.dark" noOfLines={1}>
          {item.product.name}
        </Text>
        <Text fontFamily="body" fontSize="xs" color="brand.muted">
          Talle: {item.size}
        </Text>
        {item.color && (
          <Text fontFamily="body" fontSize="xs" color="brand.muted">
            Color: {item.color}
          </Text>
        )}
        <Text fontFamily="body" fontWeight={700} fontSize="sm" color="brand.ocean">
          {formatPrice(price * item.quantity)}
        </Text>
      </VStack>

      <HStack spacing={1}>
        <IconButton
          icon={<Minus size={14} />}
          variant="ghost"
          size="sm"
          aria-label="Menos"
          onClick={() => updateQuantity(item.key, item.quantity - 1)}
          color="brand.muted"
          _hover={{ color: "brand.dark" }}
        />
        <Text fontFamily="body" fontWeight={700} fontSize="sm" minW="24px" textAlign="center">
          {item.quantity}
        </Text>
        <IconButton
          icon={<Plus size={14} />}
          variant="ghost"
          size="sm"
          aria-label="Más"
          onClick={() => updateQuantity(item.key, item.quantity + 1)}
          isDisabled={!canIncrease}
          color="brand.muted"
          _hover={{ color: "brand.dark" }}
        />
      </HStack>

      <IconButton
        icon={<Trash2 size={16} />}
        variant="ghost"
        size="sm"
        aria-label="Eliminar"
        onClick={() => removeItem(item.key)}
        color="brand.muted"
        _hover={{ color: "brand.error" }}
      />
    </HStack>
  );
};

export default CartItem;
