import { useRef, useEffect, useState } from "react";
import {
  Box, Grid, GridItem, VStack, HStack, Text, Button, Badge, Image, Spinner, Flex, Divider,
} from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Truck, RotateCcw, Zap } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../hooks/useProducts";
import { formatPrice } from "../../utils/formatters";
import SizeSelector from "../products/SizeSelector";
import ColorSelector from "../products/ColorSelector";
import { getAvailableColorsForSize, getProductSizeTotals } from "../../utils/inventory";

gsap.registerPlugin(ScrollTrigger);

const BENEFITS = [
  "Calce cómodo y talle exacto",
  "Ideal para uso diario",
  "Tela suave y de primera calidad",
];

const FeaturedProduct = () => {
  const { products, loading } = useProducts({ featured: true, limit: 1 });
  const product = products[0];
  const sectionRef = useRef(null);
  const imagesRef  = useRef(null);
  const infoRef    = useRef(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    setSelectedColor(null);
  }, [selectedSize]);

  useEffect(() => {
    if (!product) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(imagesRef.current, { x: -60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none reverse" },
      });
      gsap.fromTo(infoRef.current, { x: 60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none reverse" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [product]);

  const handleAdd = () => {
    const hasColors = (product?.colors || []).length > 0;
    if (!selectedSize || (hasColors && !selectedColor)) return;
    addItem(product, selectedSize, selectedColor);
  };

  if (loading) {
    return (
      <Flex py={{ base: 16, md: 24 }} justify="center" align="center" bg="brand.light">
        <Spinner size="xl" color="brand.ocean" thickness="3px" />
      </Flex>
    );
  }

  if (!product) return null;
  const images = product.images || [];
  const hasColors = (product.colors || []).length > 0;
  const sizeTotals = getProductSizeTotals(product);
  const availableColors = getAvailableColorsForSize(product, selectedSize);

  return (
    <Box ref={sectionRef} py={{ base: 16, md: 24 }} px={{ base: 4, md: 8, lg: 16 }} bg="brand.light" overflow="hidden">
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={{ base: 12, lg: 16 }} maxW="1200px" mx="auto" alignItems="center">
        <GridItem ref={imagesRef}>
          <Grid templateColumns="2fr 1fr" templateRows="auto auto" gap={3} h={{ base: "500px", md: "620px" }}>
            <GridItem rowSpan={2}>
              <Image src={images[0]} alt={product.name} w="100%" h="100%" objectFit="cover" borderRadius="lg" bg="brand.sand" />
            </GridItem>
            <GridItem>
              <Image src={images[1]} alt={product.name} w="100%" h="100%" objectFit="cover" borderRadius="lg" bg="brand.sand" />
            </GridItem>
            <GridItem>
              <Image src={images[2]} alt={product.name} w="100%" h="100%" objectFit="cover" borderRadius="lg" bg="brand.sand" />
            </GridItem>
          </Grid>
        </GridItem>

        <GridItem ref={infoRef}>
          <VStack align="flex-start" spacing={5}>
            <Badge bg="brand.ocean" color="white" fontSize="2xs" fontWeight={700} px={3} py={1} borderRadius="md" letterSpacing="0.1em" textTransform="uppercase">
              ⭐ Producto destacado
            </Badge>

            <VStack align="flex-start" spacing={1}>
              <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
                {product.category}
              </Text>
              <Text fontFamily="heading" fontWeight={400} fontSize={{ base: "4xl", md: "5xl" }} letterSpacing="0.03em" color="brand.dark" lineHeight={1}>
                {product.name}
              </Text>
            </VStack>

            <HStack spacing={3} align="baseline">
              <Text fontFamily="body" fontWeight={800} fontSize="3xl" color="brand.ocean">
                {formatPrice(product.salePrice || product.price)}
              </Text>
              {product.salePrice && (
                <Text fontFamily="body" fontSize="lg" color="brand.muted" textDecoration="line-through">
                  {formatPrice(product.price)}
                </Text>
              )}
            </HStack>

            {/* Urgencia */}
            <HStack
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="md"
              px={3}
              py={2}
              spacing={2}
            >
              <Zap size={14} color="#EF4444" strokeWidth={2.5} />
              <Text fontFamily="body" fontSize="xs" fontWeight={700} color="red.600">
                Quedan pocas unidades disponibles
              </Text>
            </HStack>

            <Box w="100%">
              <SizeSelector sizes={sizeTotals} selected={selectedSize} onChange={setSelectedSize} />
            </Box>

            {hasColors && (
              <Box w="100%">
                <ColorSelector colors={availableColors} selected={selectedColor} onChange={setSelectedColor} />
              </Box>
            )}

            <VStack w="100%" spacing={2}>
              <Button
                size="lg"
                w="100%"
                py={7}
                bg="brand.ocean"
                color="white"
                fontWeight={800}
                fontSize="md"
                letterSpacing="0.05em"
                _hover={{ bg: "brand.deep", transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(21,101,192,0.4)" }}
                transition="all 0.3s"
                boxShadow="0 4px 15px rgba(21,101,192,0.3)"
                onClick={handleAdd}
                isDisabled={!selectedSize || (hasColors && !selectedColor)}
                opacity={!selectedSize || (hasColors && !selectedColor) ? 0.5 : 1}
              >
                Comprar ahora
              </Button>
              <Text fontSize="2xs" color="brand.muted" letterSpacing="0.1em" textTransform="uppercase">
                {hasColors ? "Elegí talle y color para continuar" : "Elegí un talle para continuar"}
              </Text>
            </VStack>

            <Divider borderColor="brand.sand" />

            {/* Beneficios */}
            <VStack align="flex-start" spacing={2} w="100%">
              {BENEFITS.map((b) => (
                <HStack key={b} spacing={2}>
                  <Text fontSize="sm" color="brand.success" fontWeight={700}>✓</Text>
                  <Text fontFamily="body" fontSize="sm" color="brand.muted">{b}</Text>
                </HStack>
              ))}
            </VStack>

            <Divider borderColor="brand.sand" />

            {/* Trust */}
            <HStack spacing={5} flexWrap="wrap">
              <HStack spacing={1.5}>
                <Truck size={14} color="#1565C0" strokeWidth={2} />
                <Text fontFamily="body" fontSize="xs" color="brand.muted" fontWeight={600}>Envíos a todo el país</Text>
              </HStack>
              <HStack spacing={1.5}>
                <RotateCcw size={14} color="#1565C0" strokeWidth={2} />
                <Text fontFamily="body" fontSize="xs" color="brand.muted" fontWeight={600}>Cambios disponibles</Text>
              </HStack>
            </HStack>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default FeaturedProduct;
