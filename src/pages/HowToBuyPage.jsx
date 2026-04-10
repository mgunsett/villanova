import { VStack, Text, Box, OrderedList, ListItem } from "@chakra-ui/react";

const HowToBuyPage = () => {
  return (
    <Box maxW="800px" mx="auto" py={{ base: 8, md: 16 }} px={4}>
      <VStack spacing={2} mb={10} textAlign="center">
        <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.3em" textTransform="uppercase" color="brand.ocean">
          Guía
        </Text>
        <Text fontFamily="heading" fontSize={{ base: "4xl", md: "5xl" }} color="brand.dark">
          ¿Cómo comprar?
        </Text>
      </VStack>

      <VStack spacing={8} align="stretch">
        {[
          { step: "Elegí tus productos", desc: "Navegá nuestras categorías, elegí talle y agregá al carrito." },
          { step: "Revisá tu carrito", desc: "Verificá los productos, talles y cantidades seleccionadas." },
          { step: "Completá tus datos", desc: "Ingresá nombre, teléfono y dirección de envío en el checkout." },
          { step: "Elegí método de pago", desc: "Pagá con MercadoPago (tarjeta/transferencia) o coordiná por WhatsApp." },
          { step: "Recibí tu pedido", desc: "Preparamos y enviamos tu paquete. ¡Seguilo por WhatsApp!" },
        ].map((item, i) => (
          <Box key={i} display="flex" gap={4} alignItems="flex-start">
            <Box
              minW="48px" h="48px"
              borderRadius="lg"
              bg="brand.ocean"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontFamily="heading"
              fontSize="2xl"
            >
              {i + 1}
            </Box>
            <VStack align="flex-start" spacing={1}>
              <Text fontFamily="body" fontWeight={700} fontSize="md" color="brand.dark">
                {item.step}
              </Text>
              <Text fontFamily="body" fontSize="sm" color="brand.muted" lineHeight={1.7}>
                {item.desc}
              </Text>
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default HowToBuyPage;
