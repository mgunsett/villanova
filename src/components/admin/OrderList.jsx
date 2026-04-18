// ═══════════════════════════════════════════════
// src/components/admin/OrderList.jsx
// Vista mixta: tabla con panel de detalle lateral al click
// ═══════════════════════════════════════════════
import { useEffect, useState } from "react";
import {
  Box, Text, Flex, Badge, Button, Select, Spinner, Input, HStack,
  VStack, Divider, Image, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  Drawer, DrawerOverlay, DrawerContent, DrawerBody, DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Search, Eye, ShoppingCart, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOrders, updateOrderStatus } from "../../services/firebase/orders";
import { ORDER_STATUS } from "../../utils/constants";
import { formatPrice, formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

// ── Panel de detalle lateral ─────────────────────────────────────────
const OrderDetailPanel = ({ order, onStatusChange, updating }) => {
  if (!order) return (
    <Flex h="100%" align="center" justify="center" direction="column" gap={3}>
      <ShoppingCart size={48} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
      <Text fontFamily="body" fontSize="sm" color="brand.muted" textAlign="center">
        Seleccioná una orden para ver el detalle
      </Text>
    </Flex>
  );

  const st = ORDER_STATUS[order.status] || { label: order.status, color: "gray" };

  return (
    <VStack align="stretch" spacing={5} h="100%" overflowY="auto" pb={4}>
      {/* Header del detalle */}
      <Box>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
          Orden
        </Text>
        <Text fontFamily="heading" fontSize="2xl" color="brand.dark" letterSpacing="0.05em">
          #{order.id.slice(0, 8).toUpperCase()}
        </Text>
        <HStack mt={1}>
          <Badge colorScheme={st.color} fontSize="xs" borderRadius="full" px={2} fontFamily="body">
            {st.label}
          </Badge>
          <Text fontFamily="body" fontSize="xs" color="brand.muted">{formatDate(order.createdAt)}</Text>
        </HStack>
      </Box>

      {/* Cambio de estado */}
      <Box>
        <Text fontFamily="body" fontSize="xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={2}>
          Cambiar estado
        </Text>
        <Select
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value)}
          isDisabled={updating}
          size="sm"
          bg="white"
          border="1px solid"
          borderColor="brand.sand"
          borderRadius="lg"
          fontFamily="body"
          fontSize="sm"
          _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
        >
          {Object.entries(ORDER_STATUS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </Select>
      </Box>

      <Divider borderColor="brand.sand" />

      {/* Cliente */}
      <Box>
        <Text fontFamily="body" fontSize="xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={2}>
          Cliente
        </Text>
        <VStack align="stretch" spacing={1.5}>
          {[
            { label: "Nombre",    val: order.customerName   || order.shipping?.name || "—" },
            { label: "Email",     val: order.customerEmail  || order.shipping?.email || "—" },
            { label: "Teléfono",  val: order.customerPhone  || order.shipping?.phone || "—" },
            { label: "Dirección", val: order.shippingAddress|| (order.shipping ? `${order.shipping.address}, ${order.shipping.city}` : "—") },
          ].map(({ label, val }) => (
            <Flex key={label} justify="space-between" gap={2}>
              <Text fontFamily="body" fontSize="xs" color="brand.muted" flexShrink={0}>{label}</Text>
              <Text fontFamily="body" fontSize="xs" color="brand.dark" textAlign="right" noOfLines={2}>{val}</Text>
            </Flex>
          ))}
        </VStack>
      </Box>

      <Divider borderColor="brand.sand" />

      {/* Productos */}
      <Box>
        <Text fontFamily="body" fontSize="xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={2}>
          Productos
        </Text>
        <VStack spacing={2.5} align="stretch">
          {(order.items || []).map((item, i) => (
            <HStack key={i} spacing={3}>
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  w="36px" h="44px"
                  objectFit="cover"
                  borderRadius="md"
                  flexShrink={0}
                  bg="brand.sand"
                />
              )}
              <VStack align="flex-start" spacing={0} flex={1}>
                <Text fontFamily="body" fontSize="xs" fontWeight={600} color="brand.dark" noOfLines={1}>
                  {item.name}
                </Text>
                <Text fontFamily="body" fontSize="2xs" color="brand.muted">
                  T.{item.size} · ×{item.quantity}
                </Text>
              </VStack>
              <Text fontFamily="body" fontSize="xs" fontWeight={600} color="brand.ocean" flexShrink={0}>
                {formatPrice((item.price || 0) * (item.quantity || 1))}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      <Divider borderColor="brand.sand" />

      {/* Totales */}
      <Box>
        {order.discount > 0 && (
          <Flex justify="space-between" mb={1}>
            <Text fontFamily="body" fontSize="xs" color="brand.muted">Descuento</Text>
            <Text fontFamily="body" fontSize="xs" color="brand.success" fontWeight={600}>
              -{formatPrice(order.discount)}
            </Text>
          </Flex>
        )}
        <Flex justify="space-between">
          <Text fontFamily="body" fontSize="sm" fontWeight={700} color="brand.dark">Total</Text>
          <Text fontFamily="heading" fontSize="xl" color="brand.ocean" letterSpacing="0.02em">
            {formatPrice(order.total || order.totals?.total || 0)}
          </Text>
        </Flex>
      </Box>
    </VStack>
  );
};

// ── OrderList principal ───────────────────────────────────────────────
const OrderList = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState(null);
  const [updating,     setUpdating]     = useState(false);
  const { isOpen, onOpen, onClose }     = useDisclosure(); // para mobile drawer

  const load = async () => {
    setLoading(true);
    try {
      const data = await getOrders(filterStatus ? { status: filterStatus } : {});
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelected((prev) => prev?.id === orderId ? { ...prev, status: newStatus } : prev);
      toast.success("Estado actualizado");
    } catch { toast.error("Error actualizando estado"); }
    finally { setUpdating(false); }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.customerName  || "").toLowerCase().includes(q) ||
      (o.customerEmail || "").toLowerCase().includes(q) ||
      (o.shipping?.name || "").toLowerCase().includes(q)
    );
  });

  const handleSelect = (order) => {
    setSelected(order);
    // En mobile abre drawer
    if (window.innerWidth < 1024) onOpen();
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.ocean">
            Ventas
          </Text>
          <Text fontFamily="heading" fontSize="4xl" color="brand.dark" letterSpacing="0.05em">
            ÓRDENES
          </Text>
        </VStack>
        <IconButton
          icon={<RefreshCw size={16} />}
          size="sm"
          variant="ghost"
          color="brand.muted"
          borderRadius="lg"
          onClick={load}
          aria-label="Recargar"
          _hover={{ bg: "brand.sand", color: "brand.dark" }}
        />
      </Flex>

      {/* Layout: tabla + panel */}
      <Flex gap={5} align="flex-start">
        {/* Columna izquierda: tabla */}
        <Box flex={1} minW={0}>
          {/* Filtros */}
          <Flex gap={3} mb={4} flexWrap="wrap">
            <HStack
              bg="white"
              border="1px solid"
              borderColor="brand.sand"
              borderRadius="lg"
              px={3}
              flex={1}
              maxW="280px"
              _focusWithin={{ borderColor: "brand.ocean" }}
            >
              <Search size={15} color="var(--chakra-colors-brand-muted)" />
              <Input
                variant="unstyled"
                placeholder="Buscar…"
                fontFamily="body"
                fontSize="sm"
                py={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </HStack>
            <Select
              maxW="170px"
              size="sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              bg="white"
              border="1px solid"
              borderColor="brand.sand"
              borderRadius="lg"
              fontFamily="body"
              _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
            >
              <option value="">Todos los estados</option>
              {Object.entries(ORDER_STATUS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </Select>
          </Flex>

          {loading ? (
            <Flex justify="center" py={12}><Spinner size="lg" color="brand.ocean" thickness="2px" /></Flex>
          ) : filtered.length === 0 ? (
            <Flex direction="column" align="center" py={12} gap={3}>
              <ShoppingCart size={40} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
              <Text fontFamily="body" color="brand.muted" fontSize="sm">Sin órdenes.</Text>
            </Flex>
          ) : (
            <VStack spacing={2} align="stretch">
              {filtered.map((order) => {
                const st        = ORDER_STATUS[order.status] || { label: order.status, color: "gray" };
                const isSelected = selected?.id === order.id;
                return (
                  <Flex
                    key={order.id}
                    bg={isSelected ? "rgba(21,101,192,0.05)" : "white"}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={isSelected ? "brand.ocean" : "brand.sand"}
                    p={4}
                    align="center"
                    gap={4}
                    cursor="pointer"
                    onClick={() => handleSelect(order)}
                    _hover={{ borderColor: "brand.sky", shadow: "sm" }}
                    transition="all 0.15s"
                    flexWrap="wrap"
                  >
                    <VStack align="flex-start" spacing={0} flex={1} minW="120px">
                      <Text fontFamily="body" fontSize="sm" fontWeight={700} color="brand.dark">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Text>
                      <Text fontFamily="body" fontSize="xs" color="brand.muted" noOfLines={1}>
                        {order.customerName || order.shipping?.name || "—"}
                      </Text>
                    </VStack>
                    <Text fontFamily="body" fontSize="xs" color="brand.muted" flexShrink={0}>
                      {formatDate(order.createdAt)}
                    </Text>
                    <Text fontFamily="body" fontSize="sm" fontWeight={700} color="brand.ocean" flexShrink={0}>
                      {formatPrice(order.total || order.totals?.total || 0)}
                    </Text>
                    <Badge
                      colorScheme={st.color}
                      fontSize="2xs"
                      borderRadius="full"
                      px={2}
                      fontFamily="body"
                      flexShrink={0}
                    >
                      {st.label}
                    </Badge>
                  </Flex>
                );
              })}
            </VStack>
          )}
        </Box>

        {/* Panel derecho — desktop */}
        <Box
          display={{ base: "none", lg: "block" }}
          w="320px"
          flexShrink={0}
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="brand.sand"
          p={5}
          position="sticky"
          top="24px"
          maxH="calc(100vh - 120px)"
          overflowY="auto"
        >
          <OrderDetailPanel
            order={selected}
            onStatusChange={handleStatusChange}
            updating={updating}
          />
        </Box>
      </Flex>

      {/* Drawer mobile */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody pt={10}>
            <OrderDetailPanel
              order={selected}
              onStatusChange={handleStatusChange}
              updating={updating}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default OrderList;