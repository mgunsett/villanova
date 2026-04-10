import { useRef, useEffect } from "react";
import { Box, Flex, VStack, Text } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Package, CreditCard, ShieldCheck, Truck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TRUST_ITEMS = [
  { icon: Truck,        title: "Envíos a todo el país",   desc: "Tu pedido llega a cualquier punto de Argentina" },
  { icon: CreditCard,   title: "Todas las tarjetas",      desc: "Pagá con MercadoPago en hasta 12 cuotas" },
  { icon: ShieldCheck,  title: "Compra 100% segura",      desc: "Tus datos y pagos siempre protegidos" },
  { icon: Package,      title: "Empaque cuidado",         desc: "Cada prenda llega perfecta a tu puerta" },
];

const TrustBanner = () => {
  const ref   = useRef(null);
  const items = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(items.current, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "back.out(1.5)",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <Box ref={ref} py={14} px={{ base: 4, md: 8 }} bg="brand.white" borderY="2px solid" borderColor="brand.sand">
      <Flex justify="space-around" align="flex-start" wrap="wrap" gap={8} maxW="1100px" mx="auto">
        {TRUST_ITEMS.map((item, i) => (
          <VStack key={item.title} ref={(el) => (items.current[i] = el)} align="center" spacing={3} maxW="220px">
            <Box
              w="56px" h="56px"
              borderRadius="lg"
              bg="brand.ocean"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <item.icon size={24} color="white" strokeWidth={1.5} />
            </Box>
            <VStack spacing={1}>
              <Text fontFamily="body" fontWeight={700} fontSize="sm" color="brand.dark" textAlign="center">
                {item.title}
              </Text>
              <Text fontFamily="body" fontSize="xs" color="brand.muted" textAlign="center" lineHeight={1.6}>
                {item.desc}
              </Text>
            </VStack>
          </VStack>
        ))}
      </Flex>
    </Box>
  );
};

export default TrustBanner;
