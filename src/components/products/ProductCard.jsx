import { useRef } from "react";
import { Box, VStack, HStack, Text, Image, Badge } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "../../utils/formatters";

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

        <HStack position="absolute" top={3} left={3} spacing={2}>
          {product.featured && (
            <Badge bg="brand.ocean" color="white" fontSize="2xs" fontWeight={700} px={2} py={0.5} borderRadius="md">
              Destacado
            </Badge>
          )}
          {hasDiscount && (
            <Badge bg="brand.error" color="white" fontSize="2xs" fontWeight={700} px={2} py={0.5} borderRadius="md">
              Oferta
            </Badge>
          )}
          {Object.values(product.sizes || {}).every((s) => s === 0) && (
            <Badge bg="brand.muted" color="white" fontSize="2xs" px={2} borderRadius="md">
              Sin stock
            </Badge>
          )}
        </HStack>

        <Box
          position="absolute" bottom={3} right={3}
          opacity={0} _groupHover={{ opacity: 1 }}
          transition="opacity 0.25s"
          onClick={(e) => { e.stopPropagation(); if (onQuickAdd) onQuickAdd(product); }}
        >
          <Box
            w="42px" h="42px"
            borderRadius="full"
            bg="brand.ocean"
            display="flex" alignItems="center" justifyContent="center"
            _hover={{ bg: "brand.deep" }}
            transition="all 0.2s"
            color="white"
            boxShadow="md"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
          </Box>
        </Box>
      </Box>

      <VStack align="flex-start" spacing={1} px={1}>
        <Text fontFamily="body" fontSize="2xs" fontWeight={700} letterSpacing="0.15em" textTransform="uppercase" color="brand.ocean">
          {product.category}
        </Text>
        <Text fontFamily="body" fontWeight={600} fontSize="md" color="brand.dark" lineHeight={1.2} noOfLines={2}>
          {product.name}
        </Text>
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
      </VStack>
    </Box>
  );
};

export default ProductCard;
