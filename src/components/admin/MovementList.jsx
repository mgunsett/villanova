import { useEffect, useState } from "react";
import {
  Box, Text, Flex, Spinner, Badge, Select,
  Table, Thead, Tbody, Tr, Th, Td,
} from "@chakra-ui/react";
import { getMovements } from "../../services/firebase/movements";
import { formatDate } from "../../utils/formatters";

const TYPE_LABELS = {
  in:         { label: "Ingreso",   color: "green" },
  out:        { label: "Egreso",    color: "red" },
  adjustment: { label: "Ajuste",    color: "blue" },
};

const MovementList = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getMovements(filterType ? { type: filterType } : {});
        setMovements(data);
      } catch (err) {
        console.error("[Admin] Error cargando movimientos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filterType]);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Text fontFamily="heading" fontSize="2xl" color="brand.dark">
          Movimientos de Stock
        </Text>
        <Select
          maxW="200px"
          size="sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_LABELS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </Select>
      </Flex>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" color="brand.ocean" />
        </Flex>
      ) : movements.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text color="brand.muted">No hay movimientos registrados.</Text>
        </Box>
      ) : (
        <Box bg="brand.white" borderRadius="lg" border="2px solid" borderColor="brand.sand" overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Fecha</Th>
                <Th>Producto</Th>
                <Th>Talle</Th>
                <Th>Tipo</Th>
                <Th isNumeric>Cantidad</Th>
                <Th>Motivo</Th>
              </Tr>
            </Thead>
            <Tbody>
              {movements.map((mov) => {
                const typeInfo = TYPE_LABELS[mov.type] || { label: mov.type, color: "gray" };
                return (
                  <Tr key={mov.id} _hover={{ bg: "brand.light" }}>
                    <Td fontSize="sm">{formatDate(mov.createdAt)}</Td>
                    <Td fontSize="sm" fontWeight={500}>{mov.productName || "—"}</Td>
                    <Td fontSize="sm">{mov.sizeKey || "—"}</Td>
                    <Td>
                      <Badge colorScheme={typeInfo.color} fontSize="2xs">
                        {typeInfo.label}
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight={600} color={mov.type === "out" ? "brand.error" : "brand.success"}>
                      {mov.type === "out" ? "-" : "+"}{mov.quantity}
                    </Td>
                    <Td fontSize="sm" color="brand.muted">{mov.reason || "—"}</Td>
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

export default MovementList;
