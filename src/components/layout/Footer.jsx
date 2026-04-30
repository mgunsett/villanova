import {
  Box, Grid, VStack, HStack, Text, Link, Divider, Flex, Image
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Logo from "../ui/Logo";
import { SOCIAL_LINKS} from "../../utils/constants";
import { CATEGORIES } from "../../utils/categories";
import logoVilanova2 from "../../assets/logo_vilanova2.svg";
import { LiaLaptopCodeSolid, LiaWhatsapp, LiaFacebookF, LiaInstagram  } from "react-icons/lia";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box bg="brand.dark" color="brand.sand" py={16} px={{ base: 6, md: 12 }}>
      <Grid
        templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }}
        gap={10}
        maxW="1200px"
        mx="auto"
        mb={10}
      >
        {/* Marca */}
        <VStack align="flex-start" spacing={4}>
          <Image src={logoVilanova2} alt="Vilanova Logo" w={'80px'}  />
          <HStack spacing={3} pt={2}>
            {[
              { href: SOCIAL_LINKS.instagram, Icon: LiaInstagram },
              { href: SOCIAL_LINKS.facebook,  Icon: LiaFacebookF  },
              { href: `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`, Icon: LiaWhatsapp },
            ].map(({ href, Icon }) => (
              <Link key={href} href={href} isExternal>
                <Flex
                  w="36px" h="36px"
                  borderRadius="full"
                  border="2px solid rgba(255,255,255,0.15)"
                  align="center" justify="center"
                  color="rgba(255,255,255,0.5)"
                  _hover={{ color: "brand.sky", borderColor: "brand.sky" }}
                  transition="all 0.2s"
                >
                  <Icon size={20} />
                </Flex>
              </Link>
            ))}
          </HStack>
        </VStack>

        {/* Categorías */}
        <VStack align="flex-start" spacing={3}>
          <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.25em" textTransform="uppercase" color="brand.sky" mb={1}>
            Tienda
          </Text>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              as={RouterLink}
              to={`/categoria/${cat.slug}`}
              fontFamily="body"
              fontSize="sm"
              color="rgba(255,255,255,0.5)"
              _hover={{ color: "brand.white" }}
              transition="color 0.2s"
            >
              {cat.label}
            </Link>
          ))}
        </VStack>

        {/* Info */}
        <VStack align="flex-start" spacing={3}>
          <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.25em" textTransform="uppercase" color="brand.sky" mb={1}>
            Información
          </Text>
          {[
            { label: "¿Cómo comprar?", to: "/como-comprar" },
            { label: "Mi cuenta",       to: "/mi-cuenta"    },
          ].map((item) => (
            <Link
              key={item.to}
              as={RouterLink}
              to={item.to}
              fontFamily="body"
              fontSize="sm"
              color="rgba(255,255,255,0.5)"
              _hover={{ color: "brand.white" }}
              transition="color 0.2s"
            >
              {item.label}
            </Link>
          ))}
          <Text fontFamily="body" fontSize="sm" color="rgba(255,255,255,0.5)">
            Santa Fe, Argentina
          </Text>
          
        </VStack>
      </Grid>

      <Divider borderColor="rgba(255,255,255,0.08)" mb={6} />

      <Flex maxW="1200px" mx="auto" justify="space-between" align="center" wrap="wrap" gap={3}>
        <Text fontFamily="body" fontSize="xs" color="rgba(255,255,255,0.3)" letterSpacing="0.05em">
          © {year} VILANOVA Surf & Skate. Todos los derechos reservados.
        </Text>
        <Text fontSize="12px" color="rgba(255,255,255,0.3)" letterSpacing="0.05em">
          Desarrollo Web -{' '}
          <Link
            href="https://matiasgunsett.netlify.app/"
            isExternal
            color="#2D5A47"
            _hover={{ borderColor: '#e8d5a370', color: '#e8d5a380' }}
            transition="color 0.3s"
          >
            Matias Gunsett <LiaLaptopCodeSolid style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle', fontSize: '20px', color: '#E8D5A3' }} />
          </Link>
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
