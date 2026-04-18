// src/components/admin/AdminLayout.jsx
import { useEffect, useState } from "react";
import {
  Box, Flex, VStack, Text, IconButton, Avatar,
  useDisclosure, Drawer, DrawerOverlay, DrawerContent,
  DrawerCloseButton, DrawerBody, Divider, Badge, Tooltip,
} from "@chakra-ui/react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3,
  ArrowLeftRight, Menu as MenuIcon, LogOut, ExternalLink,
  ChevronLeft, ChevronRight, Waves,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/firebase/auth";

const NAV_ITEMS = [
  { label: "Dashboard",   icon: LayoutDashboard, path: "/admin",             exact: true  },
  { label: "Productos",   icon: Package,          path: "/admin/productos",   exact: false },
  { label: "Órdenes",     icon: ShoppingCart,     path: "/admin/ordenes",     exact: false },
  { label: "Stock",       icon: BarChart3,         path: "/admin/stock",       exact: false },
  { label: "Movimientos", icon: ArrowLeftRight,   path: "/admin/movimientos", exact: false },
];

// ── Nav item ────────────────────────────────────────────────────────
const NavItem = ({ item, collapsed, onClose }) => {
  const location = useLocation();
  const isActive = item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);

  return (
    <Tooltip
      label={collapsed ? item.label : ""}
      placement="right"
      hasArrow
      bg="brand.ocean"
      color="white"
      fontSize="xs"
      openDelay={100}
    >
      <NavLink to={item.path} onClick={onClose} style={{ width: "100%" }}>
        <Flex
          align="center"
          gap={collapsed ? 0 : 3}
          px={collapsed ? 0 : 3}
          py={2.5}
          mx={2}
          borderRadius="lg"
          justify={collapsed ? "center" : "flex-start"}
          position="relative"
          bg={isActive ? "rgba(66,165,245,0.12)" : "transparent"}
          color={isActive ? "brand.sky" : "rgba(255,255,255,0.45)"}
          _hover={{ bg: "rgba(66,165,245,0.08)", color: "rgba(255,255,255,0.85)" }}
          transition="all 0.18s"
          cursor="pointer"
        >
          {isActive && (
            <Box
              position="absolute"
              left={0}
              top="18%"
              h="64%"
              w="2.5px"
              bg="brand.sky"
              borderRadius="0 3px 3px 0"
            />
          )}
          <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
          {!collapsed && (
            <Text
              fontFamily="body"
              fontSize="sm"
              fontWeight={isActive ? 600 : 400}
              flex={1}
            >
              {item.label}
            </Text>
          )}
          {!collapsed && isActive && (
            <Box w="5px" h="5px" borderRadius="full" bg="brand.sky" opacity={0.8} />
          )}
        </Flex>
      </NavLink>
    </Tooltip>
  );
};

// ── Sidebar content ──────────────────────────────────────────────────
const SidebarContent = ({ collapsed, onToggle, onClose, isMobile }) => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  return (
    <Flex
      direction="column"
      h="100%"
      bg="brand.charcoal"
      borderRight="1px solid rgba(255,255,255,0.05)"
    >
      {/* Logo */}
      <Flex
        align="center"
        justify={collapsed ? "center" : "space-between"}
        px={collapsed ? 0 : 4}
        py={4}
        minH="60px"
        borderBottom="1px solid rgba(255,255,255,0.05)"
      >
        {!collapsed && (
          <Flex align="center" gap={2.5}>
            <Box color="brand.sky"><Waves size={20} strokeWidth={1.5} /></Box>
            <VStack spacing={0} align="flex-start" lineHeight={1}>
              <Text
                fontFamily="heading"
                fontSize="lg"
                letterSpacing="0.18em"
                color="white"
              >
                VILLANOVA
              </Text>
              <Text
                fontFamily="body"
                fontSize="2xs"
                letterSpacing="0.22em"
                textTransform="uppercase"
                color="brand.sky"
                opacity={0.6}
              >
                Admin
              </Text>
            </VStack>
          </Flex>
        )}
        {collapsed && <Box color="brand.sky"><Waves size={20} strokeWidth={1.5} /></Box>}
        {!isMobile && (
          <IconButton
            icon={collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            size="xs"
            variant="ghost"
            color="rgba(255,255,255,0.3)"
            onClick={onToggle}
            _hover={{ color: "white", bg: "rgba(255,255,255,0.06)" }}
            borderRadius="full"
            aria-label="Toggle sidebar"
            flexShrink={0}
          />
        )}
      </Flex>

      {/* Navigation */}
      <VStack spacing={0.5} align="stretch" flex={1} py={3} overflowY="auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} onClose={onClose} />
        ))}
      </VStack>

      <Divider borderColor="rgba(255,255,255,0.05)" />

      {/* Ver tienda */}
      <Tooltip label={collapsed ? "Ver tienda" : ""} placement="right" hasArrow bg="brand.ocean">
        <Flex
          align="center"
          gap={collapsed ? 0 : 3}
          px={collapsed ? 0 : 5}
          py={3}
          justify={collapsed ? "center" : "flex-start"}
          color="rgba(255,255,255,0.3)"
          _hover={{ color: "brand.sky", cursor: "pointer" }}
          transition="color 0.18s"
          onClick={() => window.open("/", "_blank")}
        >
          <ExternalLink size={15} strokeWidth={1.5} />
          {!collapsed && (
            <Text fontFamily="body" fontSize="xs" color="inherit">
              Ver tienda
            </Text>
          )}
        </Flex>
      </Tooltip>

      {/* User */}
      <Box
        borderTop="1px solid rgba(255,255,255,0.05)"
        px={collapsed ? 2 : 3}
        py={3}
      >
        {!collapsed && (
          <Flex align="center" gap={2.5} mb={2} px={1}>
            <Avatar
              size="sm"
              name={profile?.displayName || user?.email}
              bg="brand.ocean"
              color="white"
              fontSize="xs"
              fontFamily="body"
            />
            <VStack align="flex-start" spacing={0} flex={1} overflow="hidden">
              <Text fontFamily="body" fontSize="xs" fontWeight={600} color="white" noOfLines={1}>
                {profile?.displayName || "Admin"}
              </Text>
              <Badge
                bg="rgba(21,101,192,0.25)"
                color="brand.sky"
                fontSize="2xs"
                borderRadius="full"
                px={2}
                fontFamily="body"
                textTransform="capitalize"
              >
                {profile?.role || "admin"}
              </Badge>
            </VStack>
          </Flex>
        )}
        {collapsed && (
          <Flex justify="center" mb={2}>
            <Avatar size="sm" name={profile?.displayName} bg="brand.ocean" color="white" fontSize="xs" />
          </Flex>
        )}
        <Tooltip label={collapsed ? "Cerrar sesión" : ""} placement="right" hasArrow bg="brand.ocean">
          <Flex
            align="center"
            gap={collapsed ? 0 : 2.5}
            px={2}
            py={2}
            borderRadius="lg"
            justify={collapsed ? "center" : "flex-start"}
            color="rgba(255,255,255,0.3)"
            _hover={{ bg: "rgba(239,68,68,0.1)", color: "brand.error", cursor: "pointer" }}
            transition="all 0.18s"
            onClick={async () => { await logoutUser(); navigate("/"); }}
          >
            <LogOut size={15} strokeWidth={1.5} />
            {!collapsed && (
              <Text fontFamily="body" fontSize="xs">Cerrar sesión</Text>
            )}
          </Flex>
        </Tooltip>
      </Box>
    </Flex>
  );
};

// ── Layout principal ─────────────────────────────────────────────────
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  // Cerrar drawer mobile al navegar
  useEffect(() => { onClose(); }, [location.pathname]);

  const sidebarW = collapsed ? "64px" : "220px";

  return (
    <Flex h="100vh" overflow="hidden" bg="brand.light">
      {/* Sidebar desktop */}
      <Box
        display={{ base: "none", lg: "block" }}
        w={sidebarW}
        flexShrink={0}
        h="100vh"
        position="sticky"
        top={0}
        transition="width 0.22s ease"
        overflow="hidden"
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          onClose={() => {}}
          isMobile={false}
        />
      </Box>

      {/* Drawer mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay bg="rgba(15,15,15,0.75)" backdropFilter="blur(3px)" />
        <DrawerContent maxW="220px" p={0}>
          <DrawerCloseButton color="rgba(255,255,255,0.5)" top={3} right={3} _hover={{ color: "white" }} />
          <DrawerBody p={0}>
            <SidebarContent collapsed={false} onToggle={() => {}} onClose={onClose} isMobile />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main content */}
      <Flex flex={1} direction="column" overflow="hidden" h="100vh">
        {/* Topbar mobile */}
        <Flex
          display={{ base: "flex", lg: "none" }}
          align="center"
          justify="space-between"
          px={4}
          py={3}
          bg="brand.charcoal"
          borderBottom="1px solid rgba(255,255,255,0.05)"
          flexShrink={0}
        >
          <IconButton
            icon={<MenuIcon size={20} />}
            variant="ghost"
            color="white"
            onClick={onOpen}
            _hover={{ bg: "rgba(255,255,255,0.07)" }}
            aria-label="Menú"
          />
          <Flex align="center" gap={2}>
            <Box color="brand.sky"><Waves size={18} strokeWidth={1.5} /></Box>
            <Text fontFamily="heading" fontSize="lg" color="white" letterSpacing="0.14em">
              VILLANOVA
            </Text>
          </Flex>
          <Box w="40px" />
        </Flex>

        {/* Page */}
        <Box flex={1} overflowY="auto" bg="brand.light">
          <Box p={{ base: 4, md: 6, lg: 8 }} maxW="1400px" mx="auto">
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default AdminLayout;
