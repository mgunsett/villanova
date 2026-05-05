import { useEffect, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Grid, GridItem, VStack, HStack, Text, Button, Image, Badge, Box, Divider,
} from "@chakra-ui/react";
import { Truck, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatters";
import SizeSelector from "./SizeSelector";
import ColorSelector from "./ColorSelector";
import { getAvailableColorsForSize, getProductSizeTotals } from "../../utils/inventory";

const BENEFITS = [
  "Calce cómodo y talle exacto",
  "Ideal para uso diario",
  "Tela suave y de primera calidad",
];

const TRUST_ITEMS = [
  { icon: Truck,       text: "Envíos a todo el país" },
  { icon: RotateCcw,   text: "Cambios sin problemas" },
  { icon: ShieldCheck, text: "Compra 100% segura" },
];

const ProductModal = ({ product, isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    setSelectedSize(null);
    setSelectedColor(null);
    setCurrentImg(0);
  }, [product?.id, isOpen]);

  useEffect(() => {
    setSelectedColor(null);
  }, [selectedSize]);

  if (!product) return null;

  const images = product.images || [];
  const hasColors = (product.colors || []).length > 0;
  const sizeTotals = getProductSizeTotals(product);
  const availableColors = getAvailableColorsForSize(product, selectedSize);
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const handleAdd = () => {
    if (!selectedSize || (hasColors && !selectedColor)) return;
    addItem(product, selectedSize, selectedColor);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered>
      <ModalOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(8px)" />
      <ModalContent bg="brand.white" borderRadius="xl" mx={4} overflow="hidden">
        <ModalCloseButton zIndex={10} />
        <ModalBody p={0}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} minH="550px">
            <GridItem bg="brand.sand" position="relative">
              <Image
                src={images[currentImg] || `https://placehold.co/500x600/1565C0/FFFFFF?text=${product.name}`}
                alt={product.name}
                w="100%" h="100%"
                objectFit="cover"
                minH="400px"
              />
              {images.length > 1 && (
                <HStack position="absolute" bottom={4} left="50%" transform="translateX(-50%)" spacing={2}>
                  {images.map((_, i) => (
                    <Box
                      key={i}
                      w={i === currentImg ? "24px" : "8px"} h="4px"
                      borderRadius="full"
                      bg="white"
                      opacity={i === currentImg ? 1 : 0.5}
                      cursor="pointer"
                      onClick={() => setCurrentImg(i)}
                      transition="all 0.2s"
                    />
                  ))}
                </HStack>
              )}
            </GridItem>

            <GridItem p={{ base: 5, md: 8 }}>
              <VStack align="flex-start" spacing={4} h="100%" justify="center">
                <HStack>
                  {product.featured && (
                    <Badge bg="brand.ocean" color="white" fontSize="2xs" fontWeight={700} px={3} py={1} borderRadius="md">
                      Destacado
                    </Badge>
                  )}
                  {hasDiscount && (
                    <Badge bg="brand.error" color="white" fontSize="2xs" fontWeight={700} px={3} py={1} borderRadius="md">
                      Oferta
                    </Badge>
                  )}
                </HStack>

                <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.2em" textTransform="uppercase" color="brand.ocean">
                  {product.category}
                </Text>

                <Text fontFamily="heading" fontSize={{ base: "3xl", md: "4xl" }} color="brand.dark" lineHeight={1}>
                  {product.name}
                </Text>

                <HStack spacing={3} align="baseline">
                  <Text fontFamily="body" fontWeight={800} fontSize="2xl" color="brand.ocean">
                    {formatPrice(product.salePrice || product.price)}
                  </Text>
                  {hasDiscount && (
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

                <Text fontSize="2xs" color="brand.muted" letterSpacing="0.1em" textTransform="uppercase" w="100%" textAlign="center">
                  {hasColors ? "Elegí talle y color para continuar" : "Elegí un talle para continuar"}
                </Text>

                <Divider borderColor="brand.sand" />

                {/* Beneficios */}
                <VStack align="flex-start" spacing={1.5} w="100%">
                  {BENEFITS.map((b) => (
                    <HStack key={b} spacing={2}>
                      <Text fontSize="xs" color="brand.success">✓</Text>
                      <Text fontFamily="body" fontSize="xs" color="brand.muted" fontWeight={500}>{b}</Text>
                    </HStack>
                  ))}
                </VStack>

                <Divider borderColor="brand.sand" />

                {/* Trust */}
                <HStack spacing={4} flexWrap="wrap" w="100%">
                  {TRUST_ITEMS.map((t) => (
                    <HStack key={t.text} spacing={1.5}>
                      <t.icon size={13} color="#1565C0" strokeWidth={2} />
                      <Text fontFamily="body" fontSize="2xs" color="brand.muted" fontWeight={600}>{t.text}</Text>
                    </HStack>
                  ))}
                </HStack>
              </VStack>
            </GridItem>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProductModal;
