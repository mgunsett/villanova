import { useEffect, useState } from "react";
import {
  Box, Text, Flex, Badge, Button, Select, Spinner,
  Table, Thead, Tbody, Tr, Th, Td, Input, HStack,
} from "@chakra-ui/react";
import { Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOrders, updateOrderStatus } from "../../services/firebase/orders";
import { ORDER_STATUS } from "../../utils/constants";
import { formatPrice, formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getOrders(filterStatus ? { status: filterStatus } : {});
        setOrders(data);
      } catch (err) {
        console.error("[Admin] Error cargando órdenes:", err);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetch();
  }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error actualizando estado");
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.customerEmail || "").toLowerCase().includes(q)
    );
  });

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Text fontFamily="heading" fontSize="2xl" color="brand.dark">
          Órdenes
        </Text>
      </Flex>

      {/* Filtros */}
      <Flex gap={3} mb={6} flexWrap="wrap">
        <HStack
          bg="brand.white"
          border="2px solid"
          borderColor="brand.sand"
          borderRadius="md"
          px={3}
          flex={1}
          maxW="320px"
        >
          <Search size={16} color="var(--chakra-colors-brand-muted)" />
          <Input
            variant="unstyled"
            placeholder="Buscar por ID, nombre o email…"
            fontSize="sm"
            py={2}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </HStack>
        <Select
          maxW="200px"
          size="sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {Object.entries(ORDER_STATUS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </Select>
      </Flex>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" color="brand.ocean" />
        </Flex>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text color="brand.muted">No se encontraron órdenes.</Text>
        </Box>
      ) : (
        <Box bg="brand.white" borderRadius="lg" border="2px solid" borderColor="brand.sand" overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Cliente</Th>
                <Th>Fecha</Th>
                <Th isNumeric>Total</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((order) => {
                const statusInfo = ORDER_STATUS[order.status] || { label: order.status, color: "gray" };
                return (
                  <Tr key={order.id} _hover={{ bg: "brand.light" }}>
                    <Td fontFamily="mono" fontSize="xs">#{order.id.slice(0, 8)}</Td>
                    <Td>
                      <Text fontSize="sm" fontWeight={500}>{order.customerName || "—"}</Text>
                      <Text fontSize="2xs" color="brand.muted">{order.customerEmail || ""}</Text>
                    </Td>
                    <Td fontSize="sm">{formatDate(order.createdAt)}</Td>
                    <Td isNumeric fontWeight={600}>{formatPrice(order.total || 0)}</Td>
                    <Td>
                      <Select
                        size="xs"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        w="130px"
                      >
                        {Object.entries(ORDER_STATUS).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </Select>
                    </Td>
                    <Td>
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<Eye size={14} />}
                        onClick={() => navigate(`/admin/ordenes/${order.id}`)}
                      >
                        Ver
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default OrderList;
