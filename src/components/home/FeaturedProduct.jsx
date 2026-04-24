import { useRef, useEffect, useState } from "react";
import {
  Box, Grid, GridItem, VStack, HStack, Text, Button, Badge, Image, Spinner, Flex,
} from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../hooks/useProducts";
import { formatPrice } from "../../utils/formatters";
import SizeSelector from "../products/SizeSelector";
import ColorSelector from "../products/ColorSelector";
import { getAvailableColorsForSize, getProductSizeTotals } from "../../utils/inventory";

gsap.registerPlugin(ScrollTrigger);

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
          <VStack align="flex-start" spacing={6}>
            <Badge bg="brand.ocean" color="white" fontSize="2xs" fontWeight={700} px={3} py={1} borderRadius="md" letterSpacing="0.1em" textTransform="uppercase">
              Producto destacado
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
              <Text fontFamily="body" fontWeight={700} fontSize="2xl" color="brand.dark">
                {formatPrice(product.salePrice || product.price)}
              </Text>
              {product.salePrice && (
                <Text fontFamily="body" fontSize="lg" color="brand.muted" textDecoration="line-through">
                  {formatPrice(product.price)}
                </Text>
              )}
            </HStack>

            <Text fontFamily="body" fontSize="sm" color="brand.muted" lineHeight={1.8} maxW="420px">
              {product.description}
            </Text>

            <Box w="100%">
              <SizeSelector sizes={sizeTotals} selected={selectedSize} onChange={setSelectedSize} />
            </Box>

            {hasColors && (
              <Box w="100%">
                <ColorSelector colors={availableColors} selected={selectedColor} onChange={setSelectedColor} />
              </Box>
            )}

            <VStack w="100%" spacing={3}>
              <Button
                variant="primary"
                size="lg"
                w="100%"
                py={7}
                onClick={handleAdd}
                isDisabled={!selectedSize || (hasColors && !selectedColor)}
                opacity={!selectedSize || (hasColors && !selectedColor) ? 0.5 : 1}
              >
                Agregar al carrito
              </Button>
              <Text fontSize="2xs" color="brand.muted" letterSpacing="0.1em" textTransform="uppercase">
                {hasColors ? "Elegí talle y color para continuar" : "Elegí un talle para continuar"}
              </Text>
            </VStack>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default FeaturedProduct;
