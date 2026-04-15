import { useEffect, useState } from "react";
import {
  SimpleGrid, Box, Text, Flex, Icon, Spinner,
} from "@chakra-ui/react";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { getProducts } from "../../services/firebase/products";
import { getOrders } from "../../services/firebase/orders";
import { formatPrice } from "../../utils/formatters";

const StatCard = ({ label, value, icon, color }) => (
  <Box
    bg="brand.white"
    borderRadius="lg"
    border="2px solid"
    borderColor="brand.sand"
    p={6}
    transition="all 0.2s"
    _hover={{ borderColor: color, transform: "translateY(-2px)", boxShadow: "md" }}
  >
    <Flex justify="space-between" align="flex-start">
      <Box>
        <Text fontSize="xs" fontWeight={600} textTransform="uppercase" letterSpacing="wider" color="brand.muted">
          {label}
        </Text>
        <Text fontSize="3xl" fontWeight={700} fontFamily="heading" color="brand.dark" mt={1}>
          {value}
        </Text>
      </Box>
      <Flex
        bg={`${color}15`}
        borderRadius="lg"
        p={3}
        align="center"
        justify="center"
      >
        <Icon as={icon} boxSize={6} color={color} />
      </Flex>
    </Flex>
  </Box>
);

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders] = await Promise.all([
          getProducts({ includeInactive: true }),
          getOrders({}),
        ]);

        const activeProducts = products.filter((p) => p.active);
        const totalRevenue = orders
          .filter((o) => o.status === "approved")
          .reduce((sum, o) => sum + (o.total || 0), 0);

        const pendingOrders = orders.filter((o) => o.status === "pending").length;

        setStats({
          totalProducts: activeProducts.length,
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders,
        });
      } catch (err) {
        console.error("[Admin] Error cargando estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="lg" color="brand.ocean" />
      </Flex>
    );
  }

  if (!stats) return null;

  return (
    <Box>
      <Text fontFamily="heading" fontSize="2xl" color="brand.dark" mb={6}>
        Dashboard
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={5}>
        <StatCard
          label="Productos activos"
          value={stats.totalProducts}
          icon={Package}
          color="var(--chakra-colors-brand-ocean)"
        />
        <StatCard
          label="Órdenes totales"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="var(--chakra-colors-brand-success)"
        />
        <StatCard
          label="Ingresos aprobados"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
          color="var(--chakra-colors-brand-sky)"
        />
        <StatCard
          label="Órdenes pendientes"
          value={stats.pendingOrders}
          icon={TrendingUp}
          color="var(--chakra-colors-brand-error)"
        />
      </SimpleGrid>
    </Box>
  );
};

export default AdminStats;
