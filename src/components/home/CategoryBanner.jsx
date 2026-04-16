import { useRef, useEffect } from "react";
import { Box, SimpleGrid, VStack, Text, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORIES } from "../../utils/constants";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const CAT_PLACEHOLDERS = {
  remeras:    "https://placehold.co/600x800/1565C0/FFFFFF?text=REMERAS",
  bermudas:   "https://placehold.co/600x800/42A5F5/FFFFFF?text=BERMUDAS",
  pantalones: "https://placehold.co/600x800/0D47A1/FFFFFF?text=PANTALONES",
  camperas:   "https://placehold.co/600x800/0F0F0F/FFFFFF?text=CAMPERAS",
  accesorios: "https://placehold.co/600x800/2C2C3A/FFFFFF?text=ACCESORIOS",
};

const CategoryBanner = () => {
  const ref   = useRef(null);
  const cards = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cards.current, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const navigate = useNavigate();

  return (
    <Box ref={ref} py={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} bg="brand.dark">
      <VStack spacing={10} maxW="1200px" mx="auto">
        <VStack spacing={2} textAlign="center">
          <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.3em" textTransform="uppercase" color="brand.sky">
            Colecciones
          </Text>
          <Text fontFamily="heading" fontWeight={400} fontSize={{ base: "4xl", md: "5xl" }} color="brand.white" letterSpacing="0.03em">
            Explorá por categoría
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} gap={4} w="100%">
          {CATEGORIES.map((cat, i) => (
            <Box
              key={cat.slug}
              ref={(el) => (cards.current[i] = el)}
              position="relative"
              overflow="hidden"
              borderRadius="lg"
              cursor="pointer"
              role="group"
              h={{ base: "140px", md: "360px" }}
              onClick={() => navigate(`/categoria/${cat.slug}`)}
            >
              <Image
                src={CAT_PLACEHOLDERS[cat.slug]}
                alt={cat.label}
                w="100%" h="100%"
                objectFit="cover"
                transform="scale(1)"
                _groupHover={{ transform: "scale(1.08)" }}
                transition="transform 0.6s ease"
              />
              <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(0,0,0,0.75) 0%, transparent 50%)" />
              <VStack position="absolute" bottom={5} left={5} align="flex-start" spacing={1}>
                <Text fontFamily="heading" fontSize={{ base: "xl", md: "2xl" }} color="white" letterSpacing="0.05em">
                  {cat.label}
                </Text>
                <Box
                  display="flex" alignItems="center" gap={2}
                  opacity={0} _groupHover={{ opacity: 1 }}
                  transition="opacity 0.3s" color="brand.sky"
                >
                  <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.15em" textTransform="uppercase">
                    Ver todo
                  </Text>
                  <ArrowRight size={14} />
                </Box>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default CategoryBanner;
