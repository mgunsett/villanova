import { useRef } from "react";
import { Box, VStack, HStack, Text, Image, Badge, Button } from "@chakra-ui/react";
import { gsap } from "gsap";
import { formatPrice } from "../../utils/formatters";
import { isProductOutOfStock } from "../../utils/inventory";

const getStockLabel = (product) => {
  const sizes = product.sizes || {};
  const total = Object.values(sizes).reduce((sum, v) => sum + (Number(v) || 0), 0);
  if (total <= 0) return null;
  if (total <= 4) return "Últimas unidades";
  if (total <= 10) return "Stock bajo";
  return null;
};

const isNewProduct = (product) => {
  if (!product.createdAt) return false;
  const ms =
    typeof product.createdAt.toMillis === "function"
      ? product.createdAt.toMillis()
      : typeof product.createdAt.seconds === "number"
      ? product.createdAt.seconds * 1000
      : 0;
  return ms > Date.now() - 30 * 24 * 60 * 60 * 1000;
};

const ProductCard = ({ product, onClick, onQuickAdd }) => {
  const cardRef = useRef(null);
  const imgRef  = useRef(null);

  const handleMouseEnter = () => {
    gsap.to(imgRef.current, { scale: 1.06, duration: 0.5, ease: "power2.out" });
    gsap.to(cardRef.current, { y: -6, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    gsap.to(imgRef.current, { scale: 1, duration: 0.5, ease: "power2.out" });
    gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
  };

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const outOfStock  = isProductOutOfStock(product);
  const stockLabel  = !outOfStock ? getStockLabel(product) : null;
  const showNew     = isNewProduct(product);

  return (
    <Box ref={cardRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} cursor="pointer" onClick={onClick} role="group">
      <Box position="relative" overflow="hidden" borderRadius="lg" mb={3} bg="brand.sand">
        <Box overflow="hidden" h={{ base: "260px", sm: "300px", md: "340px" }}>
          <Image
            ref={imgRef}
            src={product.images?.[0] || `https://placehold.co/400x500/1565C0/FFFFFF?text=${product.name}`}
            alt={product.name}
            w="100%" h="100%"
            objectFit="cover"
          />
        </Box>

        {/* Badges superiores */}
        <HStack position="absolute" top={3} left={3} spacing={2} flexWrap="wrap">
          {showNew && (
            <Badge bg="brand.success" color="white" fontSize="2xs" fontWeight={700} px={2} py={0.5} borderRadius="md">
              Nuevo
            </Badge>
          )}
          {product.featured && !showNew && (
            <Badge bg="brand.ocean" color="white" fontSize="2xs" fontWeight={700} px={2} py={0.5} borderRadius="md">
              Destacado
            </Badge>
          )}
          {hasDiscount && (
            <Badge bg="brand.error" color="white" fontSize="2xs" fontWeight={700} px={2} py={0.5} borderRadius="md">
              Oferta
            </Badge>
          )}
          {outOfStock && (
            <Badge bg="brand.muted" color="white" fontSize="2xs" px={2} borderRadius="md">
              Sin stock
            </Badge>
          )}
        </HStack>

        {/* Badge de urgencia (stock bajo) */}
        {stockLabel && (
          <Box position="absolute" bottom={3} left={3}>
            <Badge
              bg="rgba(239,68,68,0.92)"
              color="white"
              fontSize="2xs"
              fontWeight={700}
              px={2}
              py={0.5}
              borderRadius="md"
              letterSpacing="0.03em"
            >
              🔥 {stockLabel}
            </Badge>
          </Box>
        )}
      </Box>

      <VStack align="flex-start" spacing={1} px={1}>
        <Text fontFamily="body" fontSize="2xs" fontWeight={700} letterSpacing="0.15em" textTransform="uppercase" color="brand.ocean">
          {product.category}
        </Text>
        <Text fontFamily="body" fontWeight={600} fontSize="md" color="brand.dark" lineHeight={1.2} noOfLines={2}>
          {product.name}
        </Text>
        <HStack spacing={2} align="baseline" w="100%" justify="space-between">
          <HStack spacing={2} align="baseline">
            <Text fontFamily="body" fontWeight={700} fontSize="md" color="brand.dark">
              {formatPrice(product.salePrice || product.price)}
            </Text>
            {hasDiscount && (
              <Text fontFamily="body" fontSize="sm" color="brand.muted" textDecoration="line-through">
                {formatPrice(product.price)}
              </Text>
            )}
          </HStack>
        </HStack>

        {/* Botón visible en mobile / hover en desktop */}
        <Button
          size="sm"
          w="100%"
          mt={1}
          bg="brand.ocean"
          color="white"
          fontSize="xs"
          fontWeight={700}
          letterSpacing="0.06em"
          borderRadius="md"
          _hover={{ bg: "brand.deep" }}
          transition="all 0.2s"
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          isDisabled={outOfStock}
          opacity={{ base: 1, md: 0, _groupHover: 1 }}
          display="block"
          sx={{ ".chakra-box:hover &": { opacity: 1 } }}
        >
          {outOfStock ? "Sin stock" : "Comprar →"}
        </Button>
      </VStack>
    </Box>
  );
};

export default ProductCard;
