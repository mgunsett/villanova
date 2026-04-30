import { useRef, useEffect } from "react";
import { Box, Grid, GridItem, VStack, Text, Image, Flex } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import local from "../../assets/about_local.svg";
import amanecer from "../../assets/amanecer.png";
import iconoOlas from "../../assets/icono_olas.png";
import iconoAgua from "../../assets/icono_agua.png";

gsap.registerPlugin(ScrollTrigger);

const AboutSection = () => {
  const sectionRef = useRef(null);
  const lineRef    = useRef(null);
  const textRef    = useRef(null);
  const imgRef     = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(lineRef.current, { scaleX: 0, transformOrigin: "left center" }, {
        scaleX: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
      gsap.fromTo(textRef.current.children, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });
      gsap.fromTo(imgRef.current, { x: 60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box id="about" ref={sectionRef} py={{ base: 20, md: 32 }} px={{ base: 6, md: 12, lg: 20 }} bg="brand.white" overflow="hidden" position="relative">
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={{ base: 12, lg: 20 }} maxW="1200px" mx="auto" alignItems="center">
        <GridItem>
          <VStack ref={textRef} align="flex-start" spacing={6} >
            <Box>
              <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.3em" textTransform="uppercase" color="brand.ocean" mb={3}>
                Quiénes somos
              </Text>
              <Box ref={lineRef} h="3px" w="60px" bg="brand.ocean" mb={6} borderRadius="full" />
            </Box>

            <Text fontFamily="heading" fontWeight={400} fontSize={{ base: "4xl", md: "5xl" }} color="brand.dark" lineHeight={1} letterSpacing="0.02em">
              SURF, SKATE &{" "}
              <Text as="span" color="brand.ocean">
                ESTILO
              </Text>
            </Text>

            <Text fontFamily="body" fontSize="md" color="brand.muted" lineHeight={1.9}>
              En VILANOVA creemos que vestirse bien va más allá de las tendencias. Vendemos indumentaria
              masculina de primeras Marcas linea Surf & Skate, para quienes buscan comodidad
              sin perder estilo.
            </Text>

            <Text fontFamily="body" fontSize="sm" color="brand.muted" lineHeight={1.8}>
              Creemos que vestirse bien tiene que estar al alcance de todos, por eso ofrecemos productos de calidad a precios accesibles.
            </Text>

            <Flex gap={8} pt={2}>
              {[
                { num: "100%", label: "Calidad" },
                { num: "+4500",  label: "Seguidores" },
                { num: "+3",    label: "Años de experiencia" },
              ].map((item) => (
                <VStack key={item.label} align="flex-start" spacing={0}>
                  <Text fontFamily="heading" fontSize="3xl" color="brand.ocean">
                    {item.num}
                  </Text>
                  <Text fontFamily="body" fontSize="2xs" fontWeight={700} letterSpacing="0.1em" textTransform="uppercase" color="brand.muted">
                    {item.label}
                  </Text>
                </VStack>
              ))}
            </Flex>
          </VStack>
        </GridItem>

        <GridItem ref={imgRef}>
          <Box position="relative">
            <Image
              src={local}
              alt="VILLAANOVA Surf & Skate"
              w="100%"
              borderRadius="xl"
              objectFit="cover"
            />
            <Image
              src={iconoOlas}
              alt="Icono ola"
              position="absolute"
              left={{ base: "-10%", md: "-10%", lg: "-20%" }}
              bottom="-8%"
              w={{  base: "100px", md: "170px", lg: "200px" }}
              h={{  base: "100px", md: "170px", lg: "200px" }}
              color="brand.ocean"
              opacity={0.35}
            />
            <Image
              src={iconoAgua}
              alt="VILLAANOVA Logo"
              position='absolute'
              w={{ base: "100px", md: "170px", lg: "200px" }}
              h={{ base: "70px", md: "120px", lg: "150px" }}
              top={{ base: "-5%", md: "-5%", lg: "-10%" }}
              right={{ base: "-10%", md: "-5%", lg: "-10%" }}
              opacity={0.60}
            />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AboutSection;
