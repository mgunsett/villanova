import { useRef, useEffect } from "react";
import {
  Box, Flex, HStack, Text, IconButton, Badge, Button,
  Menu, MenuButton, MenuList, MenuItem, useDisclosure,
  Drawer, DrawerOverlay, DrawerContent, DrawerBody, DrawerCloseButton,
  VStack, Divider, Image,
} from "@chakra-ui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, ChevronDown, Menu as MenuIcon } from "lucide-react";
import { gsap } from "gsap";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES } from "../../utils/categories";
import Logo from "../ui/Logo";
import AuthModal from "../auth/AuthModal";
import logoVillanova from "../../assets/logo_villanova.svg";

const Navbar = () => {
  const navRef = useRef(null);
  const { scrolled } = useScrollPosition(60);
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const authModal = useDisclosure();
  const mobileMenu = useDisclosure();

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.3 }
    );
  }, []);

  useEffect(() => {
    gsap.to(navRef.current, {
      backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.72)' : 'transparent',
      backdropFilter:  scrolled ? "blur(16px)" : "blur(0px)",
      boxShadow:       scrolled ? "0 2px 20px rgba(0,0,0,0.1)" : "none",
      duration: 0.4,
      ease: "power2.out",
    });
  }, [scrolled]);

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Box
        ref={navRef}
        position="fixed"
        top={0} left={0} right={0}
        zIndex={1000}
        px={{ base: 4, md: 8, lg: 12 }}
        transition="all 0.3s"
      >
        <Flex align="center" justify="space-between" mx="auto" maxW="1400px" h="62px">
          <Link to="/">
            <Image src={logoVillanova} alt="Villanova Logo" w={["100px", "120px", "350px"]} h={["40px", "50px", "70px"]}  />
          </Link>

          <HStack spacing={8} display={{ base: "none", lg: "flex" }}>
            <Menu> 
              <MenuButton
                as={Button}
                variant="ghost"
                rightIcon={<ChevronDown size={14} />}
                fontSize="xs"
                fontWeight={700}
                letterSpacing="wider"
                textTransform="uppercase"
                color="brand.muted"
                _hover={{ color: "brand.ocean", bg: "transparent" }}
              >
                Productos
              </MenuButton>
              <MenuList minW="180px" bg="brand.white" border="2px solid" borderColor="brand.sand">
                {CATEGORIES.map((cat) => (
                  <MenuItem
                    key={cat.slug}
                    onClick={() => navigate(`/categoria/${cat.slug}`)}
                    fontSize="sm"
                    fontWeight={500}
                    _hover={{ bg: "brand.light", color: "brand.ocean" }}
                  >
                    <HStack spacing={2}>
                      {cat.icon ? <cat.icon size={cat.iconSize || 16} /> : null}
                      <Text>{cat.label}</Text>
                    </HStack>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Button
              variant="ghost"
              fontSize="xs"
              fontWeight={700}
              letterSpacing="wider"
              textTransform="uppercase"
              color="brand.muted"
              onClick={() => scrollToSection("about")}
              _hover={{ color: "brand.ocean", bg: "transparent" }}
            >
              Nosotros
            </Button>

            <Button
              variant="ghost"
              fontSize="xs"
              fontWeight={700}
              letterSpacing="wider"
              textTransform="uppercase"
              color="brand.muted"
              onClick={() => navigate("/como-comprar")}
              _hover={{ color: "brand.ocean", bg: "transparent" }}
            >
              ¿Cómo comprar?
            </Button>

            <Button
              variant="ghost"
              fontSize="xs"
              fontWeight={700}
              letterSpacing="wider"
              textTransform="uppercase"
              color="brand.muted"
              onClick={() => scrollToSection("contacto")}
              _hover={{ color: "brand.ocean", bg: "transparent" }}
            >
              Contacto
            </Button>
          </HStack>

          <HStack spacing={3}>
            <Box position="relative" cursor="pointer" onClick={() => navigate("/carrito")}>
              <ShoppingBag size={22} color="var(--chakra-colors-brand-dark)" strokeWidth={1.5} />
              {totalItems > 0 && (
                <Badge
                  position="absolute" top="-8px" right="-8px"
                  bg="brand.ocean" color="brand.white"
                  borderRadius="full" minW="18px" h="18px"
                  display="flex" alignItems="center" justifyContent="center"
                  fontSize="2xs" fontWeight={700}
                >
                  {totalItems}
                </Badge>
              )}
            </Box>

            <IconButton
              icon={<User size={22} strokeWidth={1.5} />}
              variant="ghost"
              color="brand.dark"
              aria-label="Mi cuenta"
              onClick={isAuthenticated ? () => navigate("/mi-cuenta") : authModal.onOpen}
              _hover={{ bg: "brand.sand" }}
            />

            {isAdmin && (
              <Button variant="outline" size="sm" fontSize="2xs" onClick={() => navigate("/admin")}>
                Admin
              </Button>
            )}

            <IconButton
              icon={<MenuIcon size={24} strokeWidth={1.5} />}
              variant="ghost"
              color="brand.dark"
              aria-label="Menú"
              display={{ base: "flex", lg: "none" }}
              onClick={mobileMenu.onOpen}
              _hover={{ bg: "brand.sand" }}
            />
          </HStack>
        </Flex>
      </Box>

      {/*-------------- Drawer mobile ---------------------------------*/}

      <Drawer isOpen={mobileMenu.isOpen} onClose={mobileMenu.onClose} placement="right">
        <DrawerOverlay />
        <DrawerContent bg="brand.white">
          <DrawerCloseButton />
          <DrawerBody pt={16}>
            <VStack align="stretch" spacing={4}>
              <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="wider" textTransform="uppercase" color="brand.ocean">
                Categorías
              </Text>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.slug}
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={() => { navigate(`/categoria/${cat.slug}`); mobileMenu.onClose(); }}
                  fontSize="md"
                  fontWeight={500}
                >
                  <HStack spacing={2}>
                    {cat.icon ? <cat.icon size={cat.iconSize || 16} /> : null}
                    <Text>{cat.label}</Text>
                  </HStack>
                </Button>
              ))}
              <Divider />
              <Button variant="ghost" justifyContent="flex-start" onClick={() => { scrollToSection("about"); mobileMenu.onClose(); }}>
                Nosotros
              </Button>
              <Button variant="ghost" justifyContent="flex-start" onClick={() => { navigate("/como-comprar"); mobileMenu.onClose(); }}>
                ¿Cómo comprar?
              </Button>
              <Button variant="ghost" justifyContent="flex-start" onClick={() => { scrollToSection("contacto"); mobileMenu.onClose(); }}>
                Contacto
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <AuthModal isOpen={authModal.isOpen} onClose={authModal.onClose} />
    </>
  );
};

export default Navbar;
