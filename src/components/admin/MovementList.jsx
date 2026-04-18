// src/components/admin/MovementList.jsx
import { useEffect, useState, useMemo } from "react";
import {
  Box, Text, Flex, Spinner, Badge, Select, Input, HStack, VStack,
  Table, Thead, Tbody, Tr, Th, Td, Image, Divider, Stat,
  StatLabel, StatNumber, StatHelpText, SimpleGrid,
} from "@chakra-ui/react";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Package } from "lucide-react";
import { getMovements } from "../../services/firebase/movements";
import { getProducts }  from "../../services/firebase/products";
import { formatDate }   from "../../utils/formatters";

const TYPE_CONFIG = {
  in:         { label: "Ingreso",    colorScheme: "green",  icon: ArrowUpCircle,   bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)",  color: "brand.success" },
  out:        { label: "Egreso",     colorScheme: "red",    icon: ArrowDownCircle, bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   color: "brand.error"   },
  adjustment: { label: "Ajuste",     colorScheme: "blue",   icon: RefreshCw,       bg: "rgba(21,101,192,0.08)",  border: "rgba(21,101,192,0.25)",  color: "brand.ocean"   },
};

// ── Resumen por producto ─────────────────────────────────────────────
const ProductMovementSummary = ({ movements, products }) => {
  const summary = useMemo(() => {
    const map = new Map();
    movements.forEach((m) => {
      const key = m.productId;
      const cur = map.get(key) || { productId: key, productName: m.productName, ins: 0, outs: 0, adjustments: 0 };
      if (m.type === "in")          cur.ins          += m.quantity || 0;
      else if (m.type === "out")    cur.outs         += m.quantity || 0;
      else if (m.type === "adjustment") cur.adjustments += m.quantity || 0;
      map.set(key, cur);
    });
    return Array.from(map.values()).sort((a, b) => (b.ins + b.outs) - (a.ins + a.outs)).slice(0, 5);
  }, [movements]);

  const productMap = useMemo(() =>
    new Map(products.map((p) => [p.id, p])),
  [products]);

  if (!summary.length) return null;

  return (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" p={5} mb={5}>
      <VStack align="flex-start" spacing={0} mb={4}>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
          Resumen
        </Text>
        <Text fontFamily="heading" fontSize="xl" color="brand.dark" letterSpacing="0.05em">
          MOVIMIENTOS POR PRODUCTO
        </Text>
      </VStack>
      <VStack spacing={3} align="stretch">
        {summary.map((s) => {
          const product = productMap.get(s.productId);
          return (
            <Flex
              key={s.productId}
              align="center"
              gap={3}
              py={2.5}
              borderBottom="1px solid"
              borderColor="brand.sand"
              _last={{ borderBottom: "none" }}
              flexWrap="wrap"
            >
              {product?.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={s.productName}
                  w="36px" h="44px"
                  objectFit="cover"
                  borderRadius="md"
                  flexShrink={0}
                  bg="brand.sand"
                />
              ) : (
                <Box w="36px" h="44px" bg="brand.sand" borderRadius="md" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                  <Package size={14} color="var(--chakra-colors-brand-muted)" />
                </Box>
              )}
              <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark" flex={1} noOfLines={1}>
                {s.productName || "Producto"}
              </Text>
              <HStack spacing={3} flexShrink={0}>
                {s.ins > 0 && (
                  <HStack spacing={1}>
                    <ArrowUpCircle size={13} color="var(--chakra-colors-brand-success)" />
                    <Text fontFamily="body" fontSize="xs" color="brand.success" fontWeight={600}>+{s.ins}</Text>
                  </HStack>
                )}
                {s.outs > 0 && (
                  <HStack spacing={1}>
                    <ArrowDownCircle size={13} color="var(--chakra-colors-brand-error)" />
                    <Text fontFamily="body" fontSize="xs" color="brand.error" fontWeight={600}>-{s.outs}</Text>
                  </HStack>
                )}
              </HStack>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};

// ── MovementList principal ────────────────────────────────────────────
const MovementList = () => {
  const [movements,   setMovements]   = useState([]);
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filterType,  setFilterType]  = useState("");
  const [filterProd,  setFilterProd]  = useState("");
  const [search,      setSearch]      = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [movs, prods] = await Promise.all([
        getMovements(filterType ? { type: filterType } : {}),
        getProducts({ includeInactive: true }),
      ]);
      setMovements(movs);
      setProducts(prods);
    } catch (err) {
      console.error("[MovementList] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterType]);

  // Métricas globales
  const metrics = useMemo(() => {
    const ins   = movements.filter((m) => m.type === "in").reduce((s, m)  => s + (m.quantity || 0), 0);
    const outs  = movements.filter((m) => m.type === "out").reduce((s, m) => s + (m.quantity || 0), 0);
    const total = movements.length;
    return { ins, outs, total };
  }, [movements]);

  // Filtrado local
  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const matchType = !filterType || m.type === filterType;
      const matchProd = !filterProd || m.productId === filterProd;
      const matchSearch = !search ||
        (m.productName || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.reason      || "").toLowerCase().includes(search.toLowerCase());
      return matchType && matchProd && matchSearch;
    });
  }, [movements, filterType, filterProd, search]);

  const productOptions = useMemo(() =>
    products.filter((p) =>
      movements.some((m) => m.productId === p.id)
    ),
  [products, movements]);

  return (
    <Box>
      {/* Header */}
      <VStack align="flex-start" spacing={0} mb={6}>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.ocean">
          Historial
        </Text>
        <Text fontFamily="heading" fontSize="4xl" color="brand.dark" letterSpacing="0.05em">
          MOVIMIENTOS
        </Text>
      </VStack>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 3 }} gap={4} mb={5}>
        {[
          { label: "Total movimientos", value: metrics.total, color: "brand.ocean" },
          { label: "Ingresos (u.)",     value: `+${metrics.ins}`, color: "brand.success" },
          { label: "Egresos (u.)",      value: `-${metrics.outs}`, color: "brand.error" },
        ].map((m) => (
          <Box key={m.label} bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" p={4}>
            <Text fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>
              {m.label}
            </Text>
            <Text fontFamily="heading" fontSize="2xl" color={m.color} letterSpacing="0.02em">
              {m.value}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Resumen por producto */}
      {!loading && (
        <ProductMovementSummary movements={movements} products={products} />
      )}

      {/* Filtros */}
      <Flex gap={3} mb={5} flexWrap="wrap">
        <HStack
          bg="white"
          border="1px solid"
          borderColor="brand.sand"
          borderRadius="lg"
          px={3}
          flex={1}
          maxW="260px"
          _focusWithin={{ borderColor: "brand.ocean" }}
        >
          <Input
            variant="unstyled"
            placeholder="Buscar por producto o motivo…"
            fontFamily="body"
            fontSize="sm"
            py={2}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </HStack>
        <Select
          maxW="150px"
          size="sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          bg="white"
          border="1px solid"
          borderColor="brand.sand"
          borderRadius="lg"
          fontFamily="body"
          _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </Select>
        <Select
          maxW="200px"
          size="sm"
          value={filterProd}
          onChange={(e) => setFilterProd(e.target.value)}
          bg="white"
          border="1px solid"
          borderColor="brand.sand"
          borderRadius="lg"
          fontFamily="body"
          _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
        >
          <option value="">Todos los productos</option>
          {productOptions.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </Flex>

      {loading ? (
        <Flex justify="center" py={12}><Spinner size="lg" color="brand.ocean" thickness="2px" /></Flex>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text fontFamily="body" color="brand.muted" fontSize="sm">No hay movimientos registrados.</Text>
        </Box>
      ) : (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" overflow="hidden">
          <Box overflowX="auto">
            <Table size="sm">
              <Thead bg="brand.sand">
                <Tr>
                  <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" py={3}>
                    Fecha
                  </Th>
                  <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted">
                    Producto
                  </Th>
                  <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted">
                    Talle
                  </Th>
                  <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted">
                    Tipo
                  </Th>
                  <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" isNumeric>
                    Cantidad
                  </Th>
                  <Th fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted">
                    Motivo
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((mov) => {
                  const cfg = TYPE_CONFIG[mov.type] || { label: mov.type, colorScheme: "gray", color: "brand.muted" };
                  const IconComp = cfg.icon || RefreshCw;
                  return (
                    <Tr key={mov.id} _hover={{ bg: "brand.light" }} transition="background 0.1s">
                      <Td fontFamily="body" fontSize="xs" color="brand.muted" whiteSpace="nowrap">
                        {formatDate(mov.createdAt)}
                      </Td>
                      <Td>
                        <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark" noOfLines={1}>
                          {mov.productName || "—"}
                        </Text>
                      </Td>
                      <Td>
                        <Badge
                          bg="brand.sand"
                          color="brand.dark"
                          fontSize="2xs"
                          borderRadius="md"
                          px={2}
                          fontFamily="body"
                        >
                          {mov.sizeKey || "—"}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack
                          spacing={1.5}
                          px={2}
                          py={1}
                          bg={cfg.bg}
                          border="1px solid"
                          borderColor={cfg.border}
                          borderRadius="full"
                          display="inline-flex"
                        >
                          <IconComp size={12} color={`var(--chakra-colors-${cfg.color.replace(".", "-")})`} strokeWidth={2} />
                          <Text fontFamily="body" fontSize="2xs" fontWeight={600} color={cfg.color} letterSpacing="0.05em">
                            {cfg.label}
                          </Text>
                        </HStack>
                      </Td>
                      <Td isNumeric>
                        <Text
                          fontFamily="body"
                          fontSize="sm"
                          fontWeight={700}
                          color={mov.type === "out" ? "brand.error" : mov.type === "in" ? "brand.success" : "brand.ocean"}
                        >
                          {mov.type === "out" ? "−" : "+"}{mov.quantity || 0}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontFamily="body" fontSize="xs" color="brand.muted" noOfLines={1}>
                          {mov.reason || "—"}
                        </Text>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MovementList;
