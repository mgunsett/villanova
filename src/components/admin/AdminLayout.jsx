import {
  Box, Flex, VStack, Text, Icon, Divider, Avatar,
  useDisclosure, Drawer, DrawerOverlay, DrawerContent,
  DrawerCloseButton, DrawerBody, IconButton,
} from "@chakra-ui/react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3,
  ArrowLeftRight, Menu as MenuIcon, LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/firebase/auth";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard",  icon: LayoutDashboard, path: "/admin" },
  { label: "Productos",  icon: Package,         path: "/admin/productos" },
  { label: "Órdenes",    icon: ShoppingCart,     path: "/admin/ordenes" },
  { label: "Stock",      icon: BarChart3,        path: "/admin/stock" },
  { label: "Movimientos", icon: ArrowLeftRight,  path: "/admin/movimientos" },
];

const SidebarContent = ({ onClose }) => {
  const location = useLocation();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  return (
    <Flex direction="column" h="100%" bg="brand.charcoal" color="brand.white" py={6}>
      <Box px={6} mb={6}>
        <Text fontFamily="heading" fontSize="xl" letterSpacing="wider" color="brand.sky">
          VILLANOVA
        </Text>
        <Text fontSize="2xs" color="brand.muted" textTransform="uppercase" letterSpacing="widest">
          Panel Admin
        </Text>
      </Box>

      <Divider borderColor="brand.slate" mb={4} />

      <VStack spacing={1} align="stretch" flex={1} px={3}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/admin" && location.pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} onClick={onClose}>
              <Flex
                align="center"
                gap={3}
                px={4}
                py={3}
                borderRadius="md"
                bg={isActive ? "brand.ocean" : "transparent"}
                color={isActive ? "brand.white" : "brand.muted"}
                _hover={{ bg: isActive ? "brand.ocean" : "brand.slate", color: "brand.white" }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <Icon as={item.icon} boxSize={5} />
                <Text fontSize="sm" fontWeight={isActive ? 600 : 400}>
                  {item.label}
                </Text>
              </Flex>
            </Link>
          );
        })}
      </VStack>

      <Divider borderColor="brand.slate" my={4} />

      <Box px={4}>
        <Flex align="center" gap={3} px={2} mb={3}>
          <Avatar size="sm" name={profile?.displayName} bg="brand.ocean" color="brand.white" />
          <Box>
            <Text fontSize="sm" fontWeight={600} noOfLines={1}>{profile?.displayName}</Text>
            <Text fontSize="2xs" color="brand.muted">{profile?.role}</Text>
          </Box>
        </Flex>
        <Flex
          align="center"
          gap={3}
          px={4}
          py={2}
          borderRadius="md"
          cursor="pointer"
          color="brand.muted"
          _hover={{ bg: "brand.slate", color: "brand.error" }}
          transition="all 0.2s"
          onClick={handleLogout}
        >
          <Icon as={LogOut} boxSize={4} />
          <Text fontSize="sm">Cerrar sesión</Text>
        </Flex>
      </Box>
    </Flex>
  );
};

const AdminLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar desktop */}
      <Box
        display={{ base: "none", lg: "block" }}
        w="260px"
        flexShrink={0}
      >
        <SidebarContent onClose={() => {}} />
      </Box>

      {/* Sidebar mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="260px">
          <DrawerCloseButton color="brand.white" />
          <DrawerBody p={0}>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main area */}
      <Box flex={1} overflow="auto" bg="brand.light">
        {/* Top bar mobile */}
        <Flex
          display={{ base: "flex", lg: "none" }}
          align="center"
          px={4}
          py={3}
          bg="brand.white"
          borderBottom="2px solid"
          borderColor="brand.sand"
        >
          <IconButton
            icon={<MenuIcon size={20} />}
            variant="ghost"
            aria-label="Abrir menú"
            onClick={onOpen}
          />
          <Text ml={3} fontFamily="heading" fontSize="lg" color="brand.ocean">
            Admin
          </Text>
        </Flex>

        <Box p={{ base: 4, md: 6, lg: 8 }} maxW="1400px" mx="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default AdminLayout;
