import { useEffect, useState } from "react";
import {
  Box, Text, Flex, Badge, Divider, SimpleGrid, Image,
  Button, Select, Spinner, Table, Thead, Tbody, Tr, Th, Td,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase/config";
import { updateOrderStatus } from "../../services/firebase/orders";
import { ORDER_STATUS } from "../../utils/constants";
import { formatPrice, formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "orders", orderId));
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("[Admin] Error cargando orden:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
      toast.success("Estado actualizado");
    } catch (err) {
      toast.error("Error actualizando estado");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="lg" color="brand.ocean" />
      </Flex>
    );
  }

  if (!order) {
    return (
      <Box>
        <Text color="brand.muted">Orden no encontrada.</Text>
        <Button mt={4} variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate("/admin/ordenes")}>
          Volver
        </Button>
      </Box>
    );
  }

  const statusInfo = ORDER_STATUS[order.status] || { label: order.status, color: "gray" };

  return (
    <Box>
      <Flex align="center" gap={3} mb={6}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/ordenes")}>
          <ArrowLeft size={18} />
        </Button>
        <Text fontFamily="heading" fontSize="2xl" color="brand.dark">
          Orden #{order.id.slice(0, 8)}
        </Text>
        <Badge colorScheme={statusInfo.color} fontSize="xs" px={2} py={1} borderRadius="md">
          {statusInfo.label}
        </Badge>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Info del cliente */}
        <Box bg="brand.white" borderRadius="lg" border="2px solid" borderColor="brand.sand" p={6}>
          <Text fontSize="sm" fontWeight={700} textTransform="uppercase" letterSpacing="wider" color="brand.ocean" mb={4}>
            Cliente
          </Text>
          <Flex direction="column" gap={2}>
            <Text fontSize="sm"><strong>Nombre:</strong> {order.customerName || "—"}</Text>
            <Text fontSize="sm"><strong>Email:</strong> {order.customerEmail || "—"}</Text>
            <Text fontSize="sm"><strong>Teléfono:</strong> {order.customerPhone || "—"}</Text>
            <Text fontSize="sm"><strong>Dirección:</strong> {order.shippingAddress || "—"}</Text>
            <Text fontSize="sm"><strong>Fecha:</strong> {formatDate(order.createdAt)}</Text>
          </Flex>
        </Box>

        {/* Estado y acciones */}
        <Box bg="brand.white" borderRadius="lg" border="2px solid" borderColor="brand.sand" p={6}>
          <Text fontSize="sm" fontWeight={700} textTransform="uppercase" letterSpacing="wider" color="brand.ocean" mb={4}>
            Estado de la orden
          </Text>
          <Select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            isDisabled={updating}
            mb={4}
            size="sm"
          >
            {Object.entries(ORDER_STATUS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </Select>

          <Divider my={4} />

          <Text fontSize="sm" fontWeight={700} textTransform="uppercase" letterSpacing="wider" color="brand.ocean" mb={2}>
            Resumen
          </Text>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="sm" color="brand.muted">Subtotal</Text>
            <Text fontSize="sm" fontWeight={600}>{formatPrice(order.subtotal || order.total || 0)}</Text>
          </Flex>
          {order.discount > 0 && (
            <Flex justify="space-between" mb={1}>
              <Text fontSize="sm" color="brand.muted">Descuento</Text>
              <Text fontSize="sm" fontWeight={600} color="brand.success">-{formatPrice(order.discount)}</Text>
            </Flex>
          )}
          <Divider my={2} />
          <Flex justify="space-between">
            <Text fontSize="md" fontWeight={700}>Total</Text>
            <Text fontSize="md" fontWeight={700} color="brand.ocean">{formatPrice(order.total || 0)}</Text>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Items */}
      <Box bg="brand.white" borderRadius="lg" border="2px solid" borderColor="brand.sand" p={6} mt={6}>
        <Text fontSize="sm" fontWeight={700} textTransform="uppercase" letterSpacing="wider" color="brand.ocean" mb={4}>
          Productos
        </Text>
        <Box overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Producto</Th>
                <Th>Talle</Th>
                <Th isNumeric>Cantidad</Th>
                <Th isNumeric>Precio</Th>
                <Th isNumeric>Subtotal</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(order.items || []).map((item, i) => (
                <Tr key={i}>
                  <Td>
                    <Flex align="center" gap={3}>
                      {item.image && (
                        <Image src={item.image} alt={item.name} boxSize="40px" objectFit="cover" borderRadius="md" />
                      )}
                      <Text fontSize="sm" fontWeight={500}>{item.name}</Text>
                    </Flex>
                  </Td>
                  <Td>{item.size || "—"}</Td>
                  <Td isNumeric>{item.quantity}</Td>
                  <Td isNumeric>{formatPrice(item.price)}</Td>
                  <Td isNumeric fontWeight={600}>{formatPrice(item.price * item.quantity)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderDetail;
