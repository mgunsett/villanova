import { useRef, useEffect, useState, useCallback } from "react";
import { Box, Flex, Text, Button, VStack, HStack, IconButton, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "../../assets/banner_1.svg";
import banner2 from "../../assets/banner_2.svg";
import banner3 from "../../assets/banner_3.svg";

const SLIDES = [
   {
    id: 1,
    bg: "linear-gradient(135deg, #1565C0 0%, #0D47A1 40%, #0F0F0F 100%)",
    eyebrow: "Camperas / Buzos · Invierno '26",
    title: "DROP\n INVERNAL",
    subtitle: "Para las sesiones más frías",
    cta: "Ver Buzos",
    ctaLink: "/categoria/camperas",
    image: banner3,
  },
  {
    id: 2,
    bg: "linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #42A5F5 100%)",
    eyebrow: "Remeras · Otoño 2026",
    title: "MARCANDO\nTU ESTILO",
    subtitle: "Primeras marcas urbanas a precios accesibles",
    cta: "Ver colección",
    ctaLink: "/categoria/remeras",
    image: banner2,
  },
  {
    id: 3 ,
    bg: "linear-gradient(135deg, #0F0F0F 0%, #1A1A2E 50%, #2C2C3A 100%)",
    eyebrow: "Bermudas / Pantalones · Streetwear '26",
    title: "PRIMERAS \n MARCAS",
    subtitle: "Todos lo nuevo de forma accesible",
    cta: "Ver categoría",
    ctaLink: "/categoria/bermudas",
    image: banner1,
  },
];

const HeroCarousel = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
  const slidesRef    = useRef([]);
  const eyebrowRef   = useRef(null);
  const titleRef     = useRef(null);
  const subtitleRef  = useRef(null);
  const ctaRef       = useRef(null);
  const dotsRef      = useRef([]);
  const autoRef      = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.6 });
    tl.fromTo(eyebrowRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" })
      .fromTo(titleRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "-=0.4")
      .fromTo(subtitleRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.5")
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4");
  }, []);

  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startAuto();
    return () => clearInterval(autoRef.current);
  }, [startAuto]);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      [eyebrowRef.current, titleRef.current, subtitleRef.current, ctaRef.current],
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
    );
    if (slidesRef.current[current]) {
      gsap.fromTo(slidesRef.current[current], { scale: 1.05, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "power2.out" });
    }
    dotsRef.current.forEach((dot, i) => {
      gsap.to(dot, { width: i === current ? "32px" : "8px", opacity: i === current ? 1 : 0.4, duration: 0.3, ease: "power2.out" });
    });
  }, [current]);

  const goTo = (idx) => {
    if (isAnimating || idx === current) return;
    clearInterval(autoRef.current);
    setIsAnimating(true);
    gsap.to([eyebrowRef.current, titleRef.current, subtitleRef.current, ctaRef.current], {
      y: -20, opacity: 0, duration: 0.3, stagger: 0.04, ease: "power2.in",
      onComplete: () => { setCurrent(idx); setIsAnimating(false); startAuto(); },
    });
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);
  const slide = SLIDES[current];

  return (
    <Box ref={containerRef} position="relative" h={{ base: "92vh", md: "92vh" }} overflow="hidden" >
      {/* Slides de fondo */}
      {SLIDES.map((s, i) => ( 
        <Box
          key={s.id}
          ref={(el) => (slidesRef.current[i] = el)}
          position="absolute"
          inset={0}
          background={s.bg}
          opacity={i === current ? 1 : 0}
          transition="opacity 0.1s"
          zIndex={i === current ? 1 : 0}
        >
          <Image src={s.image} alt={`Banner ${s.id}`} objectFit="cover" w="100%" h="100%" opacity={0.90} />
          {/* Patrón de olas decorativo */}
          <Box
            position="absolute"
            bottom={0} left={0} right={0}
            h="120px"
            opacity={0.1}
            bgImage="repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 42px)"
          />
          {/* Círculo decorativo grande */}
          <Box
            position="absolute"
            right={{ base: "-20%", md: "-5%" }}
            top="-10%"
            w={{ base: "80vw", md: "45vw" }}
            h={{ base: "80vw", md: "45vw" }}
            maxW="600px" maxH="600px"
            borderRadius="full"
            border="2px solid rgba(255,255,255,0.1)"
          />
          <Box
            position="absolute"
            left="-10%"
            bottom="-15%"
            w="35vw" h="35vw"
            maxW="400px" maxH="400px"
            borderRadius="full"
            border="2px solid rgba(255,255,255,0.08)"
          />
        </Box>
        
      ))}

      {/* Contenido */}
      <Flex
        position="relative"
        zIndex={2}
        h="100%"
        align="center"
        px={{ base: 6, md: 12, lg: 20 }}
        maxW="1400px"
        mx="auto"
      >
        <VStack align="flex-start" spacing={3} maxW="650px">
          <Text
            ref={eyebrowRef}
            fontFamily="body"
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.3em"
            textTransform="uppercase"
            color="rgba(255,255,255,0.7)"
          >
            {slide.eyebrow}
          </Text>
          <Text
            ref={titleRef}
            fontFamily="heading"
            fontWeight={400}
            fontSize={{ base: "6xl", md: "7xl", lg: "100px" }}
            lineHeight={0.95}
            color="white"
            letterSpacing="0.02em"
            whiteSpace="pre-line"
          >
            {slide.title}
          </Text>
            <Text
              ref={subtitleRef}
              fontFamily="body"
              fontSize={{ base: "md", md: "lg" }}
              color="rgb(255, 255, 255)"
              fontWeight={400}
            >
              {slide.subtitle}
            </Text>
          <Box ref={ctaRef} pt={2}>
            <Button
              bg="brand.white"
              color="brand.dark"
              px={8} py={6}
              fontSize="sm"
              fontWeight={700}
              letterSpacing="0.15em"
              textTransform="uppercase"
              borderRadius="md"
              _hover={{ bg: "brand.ocean", color: "white", transform: "translateY(-3px)" }}
              transition="all 0.3s"
              onClick={() => navigate(slide.ctaLink)}
            >
              {slide.cta}
            </Button>
          </Box>
        </VStack>
      </Flex>

      {/* Controles */}
      <HStack position="absolute" bottom={8} left="50%" transform="translateX(-50%)" zIndex={3} spacing={4}>
        <IconButton
          icon={<ChevronLeft size={20} />}
          variant="ghost"
          color="white"
          aria-label="Anterior"
          onClick={prev}
          _hover={{ bg: "rgba(255,255,255,0.15)" }}
          borderRadius="full"
          size="sm"
        />
        <HStack spacing={2}>
          {SLIDES.map((_, i) => (
            <Box
              key={i}
              ref={(el) => (dotsRef.current[i] = el)}
              w={i === current ? "32px" : "8px"}
              h="4px"
              borderRadius="full"
              bg="white"
              opacity={i === current ? 1 : 0.4}
              cursor="pointer"
              onClick={() => goTo(i)}
              transition="all 0.3s"
            />
          ))}
        </HStack>
        <IconButton
          icon={<ChevronRight size={20} />}
          variant="ghost"
          color="white"
          aria-label="Siguiente"
          onClick={next}
          _hover={{ bg: "rgba(255,255,255,0.15)" }}
          borderRadius="full"
          size="sm"
        />
      </HStack>
    </Box>
  );
};

export default HeroCarousel;
