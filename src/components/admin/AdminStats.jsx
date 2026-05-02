// src/components/admin/AdminStats.jsx
// Requiere: npm install recharts
import { useEffect, useState, useMemo } from "react";
import {
  Box, SimpleGrid, Flex, Text, VStack, HStack, Spinner,
  Select, Badge, Divider, Image, Progress,
} from "@chakra-ui/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  Package, ShoppingCart, DollarSign, Clock,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
} from "lucide-react";
import { getProducts } from "../../services/firebase/products";
import { getOrders } from "../../services/firebase/orders"; 
import { getTotalStock, getProductSizeTotals } from "../../utils/inventory";
import { formatPrice, formatDate } from "../../utils/formatters";
import { ORDER_STATUS } from "../../utils/constants";

// ── Helpers ──────────────────────────────────────────────────────────
const toDate = (ts) => {
  if (!ts) return new Date(0);
  if (ts.toDate) return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

const dayKey = (date) =>
  `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;

const weekKey = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const monthKey = (date) =>
  date.toLocaleString("es-AR", { month: "short", year: "2-digit" });

// ── Stat card ────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, trend, trendLabel, accentColor = "brand.ocean", index = 0 }) => {
  const isUp = trend > 0;
  const isDown = trend < 0;

  return (
    <Box
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="brand.sand"
      p={5}
      position="relative"
      overflow="hidden"
      style={{ animationDelay: `${index * 60}ms` }}
      _hover={{ borderColor: "brand.sky", transform: "translateY(-2px)", boxShadow: "md" }}
      transition="all 0.22s"
    >
      {/* Decoración fondo */}
      <Box
        position="absolute"
        top={-4}
        right={-4}
        w="80px"
        h="80px"
        borderRadius="full"
        bg={`${accentColor}`}
        opacity={0.06}
      />

      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box
          w="40px"
          h="40px"
          borderRadius="lg"
          bg={`${accentColor}18`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon size={18} color={`var(--chakra-colors-${accentColor.replace(".", "-")})`} strokeWidth={1.5} />
        </Box>
        {trend !== undefined && (
          <HStack spacing={1}>
            {isUp && <TrendingUp size={13} color="var(--chakra-colors-brand-success)" />}
            {isDown && <TrendingDown size={13} color="var(--chakra-colors-brand-error)" />}
            <Text
              fontFamily="body" 
              fontSize="2xs"
              fontWeight={600}
              color={isUp ? "brand.success" : isDown ? "brand.error" : "brand.muted"}
            >
              {trend > 0 ? "+" : ""}{trend}%
            </Text>
          </HStack>
        )}
      </Flex>

      <Text fontFamily="body" fontSize="2xs" letterSpacing="0.18em" textTransform="uppercase" color="brand.muted" mb={1}>
        {label}
      </Text>
      <Text fontFamily="heading" fontSize="3xl" color="brand.dark" letterSpacing="0.02em" lineHeight={1}>
        {value}
      </Text>
      {(sub || trendLabel) && (
        <Text fontFamily="body" fontSize="xs" color="brand.muted" mt={1.5}>
          {trendLabel || sub}
        </Text>
      )}
    </Box>
  );
};

// ── Tooltip custom del gráfico ────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      bg="brand.charcoal"
      border="1px solid rgba(66,165,245,0.3)"
      borderRadius="lg"
      px={3}
      py={2}
      shadow="lg"
    >
      <Text fontFamily="body" fontSize="xs" color="rgba(255,255,255,0.6)" mb={1}>{label}</Text>
      <Text fontFamily="heading" fontSize="md" color="brand.sky">
        {formatPrice(payload[0].value)}
      </Text>
    </Box>
  );
};

// ── Componente principal ─────────────────────────────────────────────
const AdminStats = () => {
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [period,   setPeriod]   = useState("30");   // días
  const [granularity, setGranularity] = useState("day"); // day | week | month

  useEffect(() => {
    Promise.all([
      getProducts({ includeInactive: true }),
      getOrders({}),
    ])
      .then(([p, o]) => { setProducts(p); setOrders(o); })
      .finally(() => setLoading(false));
  }, []);

  // ── Filtrar por período ────────────────────────────────────────────
  const { current, previous, allFiltered } = useMemo(() => {
    const now    = new Date();
    const days   = Number(period);
    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - days);
    const prev   = new Date(cutoff); prev.setDate(prev.getDate() - days);

    const current  = orders.filter((o) => toDate(o.createdAt) >= cutoff);
    const previous = orders.filter((o) => {
      const d = toDate(o.createdAt);
      return d >= prev && d < cutoff;
    });
    return { current, previous, allFiltered: current };
  }, [orders, period]);

  // ── Métricas ───────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const approved    = (arr) => arr.filter((o) => o.status === "approved");
    const revenue     = (arr) => approved(arr).reduce((s, o) => s + (o.total || 0), 0);
    const avgTicket   = (arr) => approved(arr).length ? revenue(arr) / approved(arr).length : 0;

    const revCur = revenue(current);
    const revPrv = revenue(previous);
    const revTrend = revPrv > 0 ? Math.round(((revCur - revPrv) / revPrv) * 100) : null;

    const ordCur = current.length;
    const ordPrv = previous.length;
    const ordTrend = ordPrv > 0 ? Math.round(((ordCur - ordPrv) / ordPrv) * 100) : null;

    const pending = orders.filter((o) => o.status === "pending" || o.status === "transfer_pending");

    const activeProducts = products.filter((p) => p.active);
    const lowStock = products.filter((p) =>
      Object.values(getProductSizeTotals(p) || {}).some((s) => s > 0 && s <= 3)
    );
    const noStock = products.filter((p) =>
      getTotalStock(p) === 0
    );

    return { revCur, revTrend, ordCur, ordTrend, avgTicket: avgTicket(current), pending, activeProducts, lowStock, noStock };
  }, [current, previous, products, orders]);

  // ── Datos del gráfico ──────────────────────────────────────────────
  const chartData = useMemo(() => {
    const keyFn = granularity === "day" ? dayKey : granularity === "week" ? weekKey : monthKey;
    const map   = new Map();

    const now  = new Date();
    const days = Number(period);
    // Pre-rellenar slots vacíos
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = keyFn(d);
      if (!map.has(k)) map.set(k, 0);
    }

    current
      .filter((o) => o.status === "approved")
      .forEach((o) => {
        const k = keyFn(toDate(o.createdAt));
        map.set(k, (map.get(k) || 0) + (o.total || 0));
      });

    return Array.from(map.entries()).map(([name, ventas]) => ({ name, ventas }));
  }, [current, granularity, period]);

  // ── Ranking de productos más vendidos ─────────────────────────────
  const topProducts = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.productId || item.name;
        const cur = map.get(key) || { name: item.name, image: item.image, qty: 0, revenue: 0 };
        cur.qty     += item.quantity || 1;
        cur.revenue += (item.price || 0) * (item.quantity || 1);
        map.set(key, cur);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  const maxQty = topProducts[0]?.qty || 1;

  if (loading) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner size="lg" color="brand.ocean" thickness="2px" speed="0.7s" />
      </Flex>
    );
  }

  return (
    <VStack align="stretch" spacing={7}>
      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.ocean">
            Panel de control
          </Text>
          <Text fontFamily="heading" fontSize="4xl" color="brand.dark" letterSpacing="0.05em">
            DASHBOARD
          </Text>
        </VStack>
        <HStack spacing={2}>
          <Select
            variant="outline"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            size="sm"
            w="150px"
            bg="white"
            border="1px solid"
            borderColor="brand.sand"
            borderRadius="lg"
            fontFamily="body"
            fontSize="xs"
            color="brand.dark"
            _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 3 meses</option>
            <option value="365">Este año</option>
          </Select>
        </HStack>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} gap={4}>
        <StatCard
          label="Facturación"
          value={formatPrice(metrics.revCur)}
          trend={metrics.revTrend}
          trendLabel={`vs período anterior`}
          icon={DollarSign}
          accentColor="brand.ocean"
          index={0}
        />
        <StatCard
          label="Órdenes"
          value={metrics.ordCur}
          trend={metrics.ordTrend}
          trendLabel="vs período anterior"
          icon={ShoppingCart}
          accentColor="brand.success"
          index={1}
        />
        <StatCard
          label="Ticket promedio"
          value={formatPrice(metrics.avgTicket)}
          trend={null}
          sub="Por orden aprobada"
          icon={TrendingUp}
          accentColor="brand.sky"
          index={2}
        />
        <StatCard
          label="Pendientes"
          value={metrics.pending.length}
          trend={null}
          sub="Requieren atención"
          icon={Clock}
          accentColor="brand.error"
          index={3}
        />
      </SimpleGrid>

      {/* Gráfico + Alertas */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} gap={5}>
        {/* Gráfico de ventas */}
        <Box
          gridColumn={{ xl: "span 2" }}
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="brand.sand"
          p={5}
        >
          <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={2}>
            <VStack align="flex-start" spacing={0}>
              <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
                Evolución de ventas
              </Text>
              <Text fontFamily="heading" fontSize="xl" color="brand.dark" letterSpacing="0.05em">
                INGRESOS
              </Text>
            </VStack>
            <HStack spacing={1}>
              {[
                { key: "day",   label: "Día"  },
                { key: "week",  label: "Sem"  },
                { key: "month", label: "Mes"  },
              ].map((g) => (
                <Box
                  key={g.key}
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={granularity === g.key ? "brand.ocean" : "brand.sand"}
                  color={granularity === g.key ? "white" : "brand.muted"}
                  fontSize="2xs"
                  fontFamily="body"
                  fontWeight={600}
                  letterSpacing="0.05em"
                  cursor="pointer"
                  onClick={() => setGranularity(g.key)}
                  transition="all 0.15s"
                  _hover={{ opacity: 0.85 }}
                >
                  {g.label}
                </Box>
              ))}
            </HStack>
          </Flex>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="villanovaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1565C0" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#1565C0" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontFamily: "Inter", fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontFamily: "Inter", fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#1565C0"
                  strokeWidth={2}
                  fill="url(#villanovaGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#1565C0", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Flex h="220px" align="center" justify="center">
              <Text fontFamily="body" fontSize="sm" color="brand.muted">
                Sin ventas aprobadas en este período
              </Text>
            </Flex>
          )}
        </Box>

        {/* Alertas de stock */}
        <Box
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="brand.sand"
          p={5}
        >
          <VStack align="flex-start" spacing={0} mb={4}>
            <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
              Inventario
            </Text>
            <Text fontFamily="heading" fontSize="xl" color="brand.dark" letterSpacing="0.05em">
              ALERTAS
            </Text>
          </VStack>

          <VStack spacing={3} align="stretch">
            <Flex
              bg={metrics.noStock.length > 0 ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)"}
              borderRadius="lg"
              p={3}
              align="center"
              gap={3}
              border="1px solid"
              borderColor={metrics.noStock.length > 0 ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}
            >
              {metrics.noStock.length > 0
                ? <AlertTriangle size={16} color="var(--chakra-colors-brand-error)" />
                : <CheckCircle size={16} color="var(--chakra-colors-brand-success)" />
              }
              <VStack spacing={0} align="flex-start" flex={1}>
                <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                  Sin stock
                </Text>
                <Text fontFamily="body" fontSize="xs" color="brand.muted">
                  {metrics.noStock.length} producto{metrics.noStock.length !== 1 ? "s" : ""}
                </Text>
              </VStack>
              <Badge
                bg={metrics.noStock.length > 0 ? "brand.error" : "brand.success"}
                color="white"
                borderRadius="full"
                px={2}
                fontSize="2xs"
                fontFamily="body"
              >
                {metrics.noStock.length}
              </Badge>
            </Flex>

            <Flex
              bg={metrics.lowStock.length > 0 ? "rgba(245,158,11,0.06)" : "rgba(16,185,129,0.06)"}
              borderRadius="lg"
              p={3}
              align="center"
              gap={3}
              border="1px solid"
              borderColor={metrics.lowStock.length > 0 ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.2)"}
            >
              <AlertTriangle
                size={16}
                color={metrics.lowStock.length > 0 ? "#F59E0B" : "var(--chakra-colors-brand-success)"}
              />
              <VStack spacing={0} align="flex-start" flex={1}>
                <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                  Stock bajo (≤3)
                </Text>
                <Text fontFamily="body" fontSize="xs" color="brand.muted">
                  {metrics.lowStock.length} producto{metrics.lowStock.length !== 1 ? "s" : ""}
                </Text>
              </VStack>
              <Badge
                bg={metrics.lowStock.length > 0 ? "#F59E0B" : "brand.success"}
                color="white"
                borderRadius="full"
                px={2}
                fontSize="2xs"
                fontFamily="body"
              >
                {metrics.lowStock.length}
              </Badge>
            </Flex>

            <Divider borderColor="brand.sand" />

            {/* Últimas órdenes pendientes */}
            <Text fontFamily="body" fontSize="xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted">
              Pendientes recientes
            </Text>
            {metrics.pending.length === 0 ? (
              <Text fontFamily="body" fontSize="sm" color="brand.muted">Sin pendientes 🎉</Text>
            ) : (
              metrics.pending.slice(0, 4).map((o) => (
                <Flex key={o.id} justify="space-between" align="center">
                  <VStack spacing={0} align="flex-start">
                    <Text fontFamily="body" fontSize="xs" fontWeight={600} color="brand.dark">
                      #{o.id.slice(0, 7).toUpperCase()}
                    </Text>
                    <Text fontFamily="body" fontSize="2xs" color="brand.muted">
                      {formatDate(o.createdAt)}
                    </Text>
                  </VStack>
                  <Text fontFamily="body" fontSize="xs" fontWeight={600} color="brand.ocean">
                    {formatPrice(o.total || 0)}
                  </Text>
                </Flex>
              ))
            )}
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Ranking de productos */}
      <Box
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor="brand.sand"
        p={5}
      >
        <VStack align="flex-start" spacing={0} mb={5}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
            Más vendidos
          </Text>
          <Text fontFamily="heading" fontSize="xl" color="brand.dark" letterSpacing="0.05em">
            RANKING DE PRODUCTOS
          </Text>
        </VStack>

        {topProducts.length === 0 ? (
          <Text fontFamily="body" fontSize="sm" color="brand.muted">
            Sin datos de ventas todavía.
          </Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {topProducts.map((p, i) => (
              <Flex key={i} align="center" gap={4}>
                {/* Número */}
                <Text
                  fontFamily="heading"
                  fontSize="2xl"
                  color={i === 0 ? "brand.ocean" : "brand.sand"}
                  w="28px"
                  flexShrink={0}
                  letterSpacing="0"
                >
                  {i + 1}
                </Text>
                {/* Imagen */}
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    w="40px" h="40px"
                    objectFit="cover"
                    borderRadius="md"
                    flexShrink={0}
                  />
                ) : (
                  <Box
                    w="40px" h="40px"
                    bg="brand.sand"
                    borderRadius="md"
                    flexShrink={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Package size={16} color="var(--chakra-colors-brand-muted)" strokeWidth={1.5} />
                  </Box>
                )}
                {/* Info + barra */}
                <VStack flex={1} spacing={1} align="stretch">
                  <Flex justify="space-between" align="baseline">
                    <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark" noOfLines={1}>
                      {p.name}
                    </Text>
                    <HStack spacing={3} flexShrink={0}>
                      <Text fontFamily="body" fontSize="xs" color="brand.muted">
                        {p.qty} u.
                      </Text>
                      <Text fontFamily="body" fontSize="xs" fontWeight={600} color="brand.ocean">
                        {formatPrice(p.revenue)}
                      </Text>
                    </HStack>
                  </Flex>
                  <Progress
                    value={(p.qty / maxQty) * 100}
                    size="xs"
                    borderRadius="full"
                    bg="brand.sand"
                    sx={{ "& > div": { background: i === 0 ? "var(--chakra-colors-brand-ocean)" : "var(--chakra-colors-brand-sky)" } }}
                  />
                </VStack>
              </Flex>
            ))}
          </VStack>
        )}
      </Box>

      {/* Últimas órdenes */}
      <Box
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor="brand.sand"
        p={5}
      >
        <VStack align="flex-start" spacing={0} mb={4}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
            Actividad reciente
          </Text>
          <Text fontFamily="heading" fontSize="xl" color="brand.dark" letterSpacing="0.05em">
            ÚLTIMAS ÓRDENES
          </Text>
        </VStack>
        <VStack spacing={0} align="stretch">
          {[...orders]
            .sort((a, b) => {
              const aLocal = a.shipping?.shippingMethod === "local" ? 0 : 1;
              const bLocal = b.shipping?.shippingMethod === "local" ? 0 : 1;
              return aLocal - bLocal;
            })
            .slice(0, 7)
            .map((order, i) => {
            const st = ORDER_STATUS[order.status];
            const isLocal = order.shipping?.shippingMethod === "local";
            return (
              <Flex
                key={order.id}
                align="center"
                justify="space-between"
                py={3}
                borderBottom={i < 6 ? "1px solid" : "none"}
                borderColor="brand.sand"
                gap={3}
                flexWrap="wrap"
              >
                <VStack align="flex-start" spacing={0}>
                  <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">
                    {order.customerName || order.shipping?.name || "—"} · {formatDate(order.createdAt)}
                  </Text>
                </VStack>
                <Badge
                  fontSize="2xs"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontFamily="body"
                  colorScheme={isLocal ? "purple" : "blue"}
                  variant="subtle"
                >
                  {isLocal ? "📍 Retiro" : "🚚 Envío"}
                </Badge>
                <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                  {formatPrice(order.total || order.totals?.total || 0)}
                </Text>
                <Badge
                  colorScheme={st?.color || "gray"}
                  fontSize="2xs"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontFamily="body"
                >
                  {st?.label || order.status}
                </Badge>
              </Flex>
            );
          })}
          {orders.length === 0 && (
            <Text fontFamily="body" fontSize="sm" color="brand.muted" py={4} textAlign="center">
              Sin órdenes todavía.
            </Text>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default AdminStats;
