import { useRef, useEffect } from "react";
import { Box, VStack, HStack, Text, SimpleGrid, Avatar } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const REVIEWS = [
  {
    id: 1,
    name: "Pablo G.",
    avatar: "P",
    rating: 4.5,
    text: "Excelente calidad, llegó rapidísimo. Me lo puse el mismo día que llegó. ¡100% recomendado!",
    product: "Remera Urban",
  },
  {
    id: 2,
    name: "Luciano M.",
    avatar: "L",
    rating: 5,
    text: "Muy buena atención. El talle perfecto y las calidades excelentes, voy a volver a comprar.",
    product: "Buzo Drop Invernal",
  },
  {
    id: 3,
    name: "Nico P.",
    avatar: "N",
    rating: 5,
    text: "Me encantó todo. El empaque llegó perfecto y el producto superó mis expectativas.",
    product: "Bermuda Streetwear",
  },
  {
    id: 4,
    name: "Matías R.",
    avatar: "M",
    rating: 5,
    text: "Primera vez que compro online ropa y no me arrepentí. Stock real, talle correcto. Muchísimas gracias chicos!",
    product: "Campera Invierno",
  },
];

const StarRating = ({ count = 5 }) => (
  <HStack spacing={0.5}>
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
    ))}
  </HStack>
);

const ReviewCard = ({ review, cardRef }) => (
  <Box
    ref={cardRef}
    bg="brand.white"
    borderRadius="xl"
    p={{ base: 5, md: 6 }}
    border="1px solid"
    borderColor="brand.sand"
    boxShadow="sm"
    _hover={{ boxShadow: "md", transform: "translateY(-3px)" }}
    transition="all 0.3s"
  >
    <VStack align="flex-start" spacing={3}>
      <StarRating count={review.rating} />
      <Text fontFamily="body" fontSize="sm" color="brand.dark" lineHeight={1.7} fontStyle="italic">
        "{review.text}"
      </Text>
      <HStack spacing={3}>
        <Avatar
          size="sm"
          name={review.name}
          bg="brand.ocean"
          color="white"
          fontSize="xs"
          fontWeight={700}
        />
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontWeight={700} fontSize="sm" color="brand.dark">
            {review.name}
          </Text>
          <Text fontFamily="body" fontSize="2xs" color="brand.muted">
            {review.product}
          </Text>
        </VStack>
      </HStack>
    </VStack>
  </Box>
);

const ReviewsSection = () => {
  const sectionRef = useRef(null);
  const cardsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box
      ref={sectionRef}
      py={{ base: 16, md: 20 }}
      px={{ base: 4, md: 8 }}
      bg="brand.light"
    >
      <VStack spacing={2} textAlign="center" mb={10}>
        <Text
          fontFamily="body"
          fontSize="xs"
          fontWeight={700}
          letterSpacing="0.3em"
          textTransform="uppercase"
          color="brand.ocean"
        >
          Lo que dicen nuestros clientes
        </Text>
        <Text
          fontFamily="heading"
          fontWeight={400}
          fontSize={{ base: "3xl", md: "4xl" }}
          color="brand.dark"
          letterSpacing="0.03em"
        >
          +500 clientes satisfechos
        </Text>
        <HStack justify="center" spacing={1} pt={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
          ))}
          <Text fontFamily="body" fontSize="sm" color="brand.muted" fontWeight={600} ml={2}>
            4.9 / 5 promedio
          </Text>
        </HStack>
      </VStack>

      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 4 }}
        gap={{ base: 4, md: 6 }}
        maxW="1300px"
        mx="auto"
      >
        {REVIEWS.map((review, i) => (
          <ReviewCard
            key={review.id}
            review={review}
            cardRef={(el) => (cardsRef.current[i] = el)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ReviewsSection;
