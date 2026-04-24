// ═══════════════════════════════════════════════
// src/components/admin/OrderDetail.jsx
// (Página completa independiente para /admin/ordenes/:orderId)
// ═══════════════════════════════════════════════
import { useEffect, useState } from "react";
import {
  Box, Text, Flex, Badge, Button, Select, Spinner,
  VStack, HStack, Table, Thead, Tbody, Tr, Th, Td,
  Image, Divider, SimpleGrid,
} from "@chakra-ui/react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase/config";
import { updateOrderStatus } from "../../services/firebase/orders";
import { ORDER_STATUS } from "../../utils/constants";
import { formatPrice, formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

const InfoRow = ({ label, value }) => (
  <Flex justify="space-between" py={2} borderBottom="1px solid" borderColor="brand.sand" _last={{ borderBottom: "none" }}>
    <Text fontFamily="body" fontSize="xs" color="brand.muted">{label}</Text>
    <Text fontFamily="body" fontSize="sm" color="brand.dark" fontWeight={500} textAlign="right" maxW="60%">{value || "—"}</Text>
  </Flex>
);

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const [order,     setOrder]    = useState(null);
  const [loading,   setLoading]  = useState(true);
  const [updating,  setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, "orders", orderId));
        if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error("[OrderDetail] Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
      toast.success("Estado actualizado");
    } catch { toast.error("Error actualizando estado"); }
    finally { setUpdating(false); }
  };

  if (loading) return <Flex justify="center" py={20}><Spinner size="lg" color="brand.ocean" thickness="2px" /></Flex>;
  if (!order)  return (
    <Box>
      <Text fontFamily="body" color="brand.muted">Orden no encontrada.</Text>
      <Button mt={4} variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate("/admin/ordenes")}>
        Volver
      </Button>
    </Box>
  );

  const st = ORDER_STATUS[order.status] || { label: order.status, color: "gray" };

  // Normalizar datos de cliente según estructura
  const clientName    = order.customerName    || order.shipping?.name     || "—";
  const clientEmail   = order.customerEmail   || order.shipping?.email    || "—";
  const clientPhone   = order.customerPhone   || order.shipping?.phone    || "—";
  const clientAddress = order.shippingAddress || (order.shipping
    ? `${order.shipping.address || ""}, ${order.shipping.city || ""}, ${order.shipping.province || ""}`.trim().replace(/^,\s*/, "")
    : "—");

  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const waMsg    = encodeURIComponent(`Hola! Te contacto por la orden #${order.id.slice(0, 8).toUpperCase()}`);

  return (
    <VStack align="stretch" spacing={5} maxW="960px">
      {/* Header */}
      <Flex align="center" gap={3} flexWrap="wrap">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/admin/ordenes")}
          fontFamily="body"
          fontSize="xs"
          color="brand.muted"
          _hover={{ color: "brand.dark", bg: "brand.sand" }}
        >
          Volver
        </Button>
        <Divider orientation="vertical" h="24px" borderColor="brand.sand" />
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.ocean">
            Detalle
          </Text>
          <Text fontFamily="heading" fontSize="2xl" color="brand.dark" letterSpacing="0.05em">
            ORDEN #{order.id.slice(0, 8).toUpperCase()}
          </Text>
        </VStack>
        <HStack ml="auto" spacing={2}>
          <Badge colorScheme={st.color} fontSize="sm" borderRadius="full" px={3} py={1} fontFamily="body">
            {st.label}
          </Badge>
          <Text fontFamily="body" fontSize="xs" color="brand.muted">{formatDate(order.createdAt)}</Text>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {/* Cliente */}
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" p={5}>
          <Text fontFamily="heading" fontSize="lg" color="brand.dark" letterSpacing="0.06em" mb={4}>CLIENTE</Text>
          <VStack spacing={0} align="stretch">
            <InfoRow label="Nombre"    value={clientName}    />
            <InfoRow label="Email"     value={clientEmail}   />
            <InfoRow label="Teléfono"  value={clientPhone}   />
            <InfoRow label="DNI"       value={order.shipping?.dni || "—"} />
            <InfoRow label="Dirección" value={clientAddress} />
          </VStack>
          {waNumber && (
            <Button
              mt={4}
              size="sm"
              bg="wa.green"
              color="white"
              fontFamily="body"
              fontSize="xs"
              letterSpacing="0.08em"
              leftIcon={<ExternalLink size={13} />}
              _hover={{ bg: "wa.greenDark" }}
              borderRadius="lg"
              onClick={() => window.open(`https://wa.me/${waNumber}?text=${waMsg}`, "_blank")}
            >
              Contactar por WhatsApp
            </Button>
          )}
        </Box>

        {/* Estado y resumen */}
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" p={5}>
          <Text fontFamily="heading" fontSize="lg" color="brand.dark" letterSpacing="0.06em" mb={4}>
            ESTADO Y PAGO
          </Text>
          <VStack spacing={4} align="stretch">
            <Select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              isDisabled={updating}
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

            <Divider borderColor="brand.sand" />

            <InfoRow label="Método de pago" value={order.paymentMethod === "transfer" ? "Transferencia" : "MercadoPago"} />
            {order.mpPaymentId && <InfoRow label="ID Pago MP" value={order.mpPaymentId} />}

            <Divider borderColor="brand.sand" />

            {order.subtotal != null && order.subtotal !== order.total && (
              <Flex justify="space-between">
                <Text fontFamily="body" fontSize="sm" color="brand.muted">Subtotal</Text>
                <Text fontFamily="body" fontSize="sm" color="brand.dark">{formatPrice(order.subtotal)}</Text>
              </Flex>
            )}
            {order.discount > 0 && (
              <Flex justify="space-between">
                <Text fontFamily="body" fontSize="sm" color="brand.muted">Descuento</Text>
                <Text fontFamily="body" fontSize="sm" color="brand.success" fontWeight={600}>
                  -{formatPrice(order.discount)}
                </Text>
              </Flex>
            )}
            <Flex justify="space-between">
              <Text fontFamily="heading" fontSize="xl" color="brand.dark" letterSpacing="0.04em">TOTAL</Text>
              <Text fontFamily="heading" fontSize="xl" color="brand.ocean" letterSpacing="0.04em">
                {formatPrice(order.total || order.totals?.total || 0)}
              </Text>
            </Flex>
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Productos */}
      <Box bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" p={5}>
        <Text fontFamily="heading" fontSize="lg" color="brand.dark" letterSpacing="0.06em" mb={4}>
          PRODUCTOS
        </Text>
        <Box overflowX="auto">
          <Table size="sm">
            <Thead bg="brand.sand">
              <Tr>
                <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" py={3}>Producto</Th>
                <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted">Talle</Th>
                <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted">Color</Th>
                <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" isNumeric>Cant.</Th>
                <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" isNumeric>Precio</Th>
                <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" isNumeric>Subtotal</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(order.items || []).map((item, i) => (
                <Tr key={i} _hover={{ bg: "brand.light" }}>
                  <Td>
                    <HStack spacing={3}>
                      {item.image && (
                        <Image src={item.image} alt={item.name} boxSize="40px" objectFit="cover" borderRadius="md" flexShrink={0} />
                      )}
                      <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">{item.name}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge bg="brand.sand" color="brand.dark" fontSize="xs" borderRadius="md" px={2} fontFamily="body">
                      {item.size || "—"}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge bg="brand.light" color="brand.dark" fontSize="xs" borderRadius="md" px={2} fontFamily="body">
                      {item.color || "—"}
                    </Badge>
                  </Td>
                  <Td isNumeric fontFamily="body" fontSize="sm">{item.quantity}</Td>
                  <Td isNumeric fontFamily="body" fontSize="sm">{formatPrice(item.price || 0)}</Td>
                  <Td isNumeric fontFamily="body" fontSize="sm" fontWeight={700} color="brand.ocean">
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </Td>
                </Tr>
              ))}
              {(!order.items || !order.items.length) && (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={4}>
                    <Text fontFamily="body" fontSize="sm" color="brand.muted">Sin productos en esta orden.</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </VStack>
  );
};

export { OrderDetail };
export default OrderDetail;