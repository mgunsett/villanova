import { useEffect, useState } from "react";
import {
  Box, Text, Flex, Spinner, Input, Button, Badge, Image,
  Table, Thead, Tbody, Tr, Th, Td, HStack, Select,
} from "@chakra-ui/react";
import { Save, Search } from "lucide-react";
import { getProducts } from "../../services/firebase/products";
import { updateStock } from "../../services/firebase/stock";
import { CATEGORIES, SIZES } from "../../utils/constants";
import toast from "react-hot-toast";

const StockManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [editedSizes, setEditedSizes] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProducts({ includeInactive: true });
        setProducts(data);
      } catch (err) {
        console.error("[Admin] Error cargando productos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSizeChange = (productId, sizeKey, value) => {
    setEditedSizes((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [sizeKey]: Number(value) || 0,
      },
    }));
  };

  const getEffectiveSizes = (product) => {
    return { ...(product.sizes || {}), ...(editedSizes[product.id] || {}) };
  };

  const hasChanges = (productId) => {
    return !!editedSizes[productId] && Object.keys(editedSizes[productId]).length > 0;
  };

  const handleSave = async (product) => {
    const newSizes = getEffectiveSizes(product);
    setSaving((prev) => ({ ...prev, [product.id]: true }));
    try {
      await updateStock(product.id, newSizes);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, sizes: newSizes } : p))
      );
      setEditedSizes((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      toast.success(`Stock de "${product.name}" actualizado`);
    } catch {
      toast.error("Error actualizando stock");
    } finally {
      setSaving((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const totalStock = (sizes) => Object.values(sizes || {}).reduce((a, b) => a + b, 0);

  return (
    <Box>
      <Text fontFamily="heading" fontSize="2xl" color="brand.dark" mb={6}>
        Gestión de Stock
      </Text>

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
            placeholder="Buscar producto…"
            fontSize="sm"
            py={2}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </HStack>
        <Select
          maxW="200px"
          size="sm"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.label}</option>
          ))}
        </Select>
      </Flex>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" color="brand.ocean" />
        </Flex>
      ) : (
        <Box bg="brand.white" borderRadius="lg" border="2px solid" borderColor="brand.sand" overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Producto</Th>
                {SIZES.map((s) => (
                  <Th key={s.key} textAlign="center">{s.label}</Th>
                ))}
                <Th isNumeric>Total</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((product) => {
                const sizes = getEffectiveSizes(product);
                const changed = hasChanges(product.id);
                return (
                  <Tr key={product.id} _hover={{ bg: "brand.light" }}>
                    <Td>
                      <Flex align="center" gap={3}>
                        <Image
                          src={product.images?.[0]}
                          alt={product.name}
                          boxSize="36px"
                          objectFit="cover"
                          borderRadius="md"
                          fallbackSrc="https://via.placeholder.com/36"
                        />
                        <Text fontSize="sm" fontWeight={500} noOfLines={1}>
                          {product.name}
                        </Text>
                      </Flex>
                    </Td>
                    {SIZES.map((s) => (
                      <Td key={s.key} textAlign="center">
                        {s.key in (product.sizes || {}) || s.key in (editedSizes[product.id] || {}) ? (
                          <Input
                            type="number"
                            size="xs"
                            w="55px"
                            textAlign="center"
                            value={sizes[s.key] ?? ""}
                            onChange={(e) => handleSizeChange(product.id, s.key, e.target.value)}
                            min={0}
                          />
                        ) : (
                          <Text fontSize="xs" color="brand.muted">—</Text>
                        )}
                      </Td>
                    ))}
                    <Td isNumeric>
                      <Badge
                        colorScheme={totalStock(sizes) > 0 ? "green" : "red"}
                        fontSize="xs"
                      >
                        {totalStock(sizes)}
                      </Badge>
                    </Td>
                    <Td>
                      {changed && (
                        <Button
                          size="xs"
                          leftIcon={<Save size={12} />}
                          isLoading={saving[product.id]}
                          onClick={() => handleSave(product)}
                        >
                          Guardar
                        </Button>
                      )}
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

export default StockManager;
