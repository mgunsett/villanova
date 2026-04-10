import { Box, VStack, Text, Button, HStack, Divider } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatters";
import CartItem from "../components/cart/CartItem";
import { ShoppingBag } from "lucide-react";

const CartPage = () => {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <VStack py={32} spacing={6} textAlign="center" px={4}>
        <ShoppingBag size={48} color="var(--chakra-colors-brand-muted)" strokeWidth={1} />
        <Text fontFamily="heading" fontSize="4xl" color="brand.dark">
          Tu carrito está vacío
        </Text>
        <Text fontFamily="body" color="brand.muted">
          ¡Agregá productos para empezar a comprar!
        </Text>
        <Button variant="primary" onClick={() => navigate("/")}>
          Explorar productos
        </Button>
      </VStack>
    );
  }

  return (
    <Box maxW="800px" mx="auto" py={{ base: 8, md: 16 }} px={4}>
      <VStack spacing={3} mb={8} textAlign="center">
        <Text fontFamily="heading" fontSize={{ base: "4xl", md: "5xl" }} color="brand.dark">
          Tu carrito
        </Text>
        <Text fontFamily="body" color="brand.muted">
          {totalItems} {totalItems === 1 ? "producto" : "productos"}
        </Text>
      </VStack>

      <VStack spacing={3} mb={8}>
        {items.map((item) => (
          <CartItem key={item.key} item={item} />
        ))}
      </VStack>

      <Divider borderColor="brand.sand" mb={6} />

      <HStack justify="space-between" mb={6}>
        <Text fontFamily="body" fontWeight={700} fontSize="lg" color="brand.dark">
          Subtotal
        </Text>
        <Text fontFamily="body" fontWeight={700} fontSize="xl" color="brand.ocean">
          {formatPrice(subtotal)}
        </Text>
      </HStack>

      <VStack spacing={3}>
        <Button variant="primary" size="lg" w="100%" py={7} onClick={() => navigate("/checkout")}>
          Ir a pagar
        </Button>
        <Button variant="ghost" size="sm" onClick={clearCart} color="brand.muted">
          Vaciar carrito
        </Button>
      </VStack>
    </Box>
  );
};

export default CartPage;
