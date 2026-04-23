


// ═══════════════════════════════════════════════
// src/components/admin/ProductList.jsx
// ═══════════════════════════════════════════════
import { useEffect, useState } from "react";
import {
  Box, Text, Flex, Button, Badge, Image, Spinner, Input, HStack,
  VStack, IconButton, Select, SimpleGrid, Tooltip,
} from "@chakra-ui/react";
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct, updateProduct } from "../../services/firebase/products";
import { CATEGORIES } from "../../utils/categories";
import { formatPrice } from "../../utils/formatters";
import toast from "react-hot-toast";

const ProductList = () => {
  const navigate         = useNavigate();
  const [products,  setProducts]     = useState([]);
  const [loading,   setLoading]      = useState(true);
  const [search,    setSearch]       = useState("");
  const [filterCat, setFilterCat]    = useState("");
  const [viewMode,  setViewMode]     = useState("table"); // "table" | "grid"

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ includeInactive: true });
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Desactivar "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: false } : p));
      toast.success("Producto desactivado");
    } catch { toast.error("Error al desactivar"); }
  };

  const handleToggleActive = async (id, current) => {
    try {
      await updateProduct(id, { active: !current });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: !current } : p));
      toast.success(current ? "Producto desactivado" : "Producto activado");
    } catch { toast.error("Error al cambiar estado"); }
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalStock = (sizes) => Object.values(sizes || {}).reduce((a, b) => a + b, 0);

  const stockBadge = (sizes) => {
    const t = totalStock(sizes);
    if (t === 0)  return { label: "Sin stock", scheme: "red"    };
    if (t <= 5)   return { label: "Stock bajo", scheme: "yellow" };
    return              { label: "OK",          scheme: "green"  };
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.ocean">
            Catálogo
          </Text>
          <Text fontFamily="heading" fontSize="4xl" color="brand.dark" letterSpacing="0.05em">
            PRODUCTOS
          </Text>
        </VStack>
        <Button
          leftIcon={<Plus size={16} />}
          size="sm"
          onClick={() => navigate("/admin/productos/nuevo")}
          fontFamily="body"
          fontSize="xs"
          letterSpacing="0.1em"
        >
          Nuevo producto
        </Button>
      </Flex>

      {/* Filtros */}
      <Flex gap={3} mb={5} flexWrap="wrap" align="center">
        <HStack
          bg="white"
          border="1px solid"
          borderColor="brand.sand"
          borderRadius="lg"
          px={3}
          flex={1}
          maxW="300px"
          _focusWithin={{ borderColor: "brand.ocean" }}
          transition="border-color 0.15s"
        >
          <Search size={15} color="var(--chakra-colors-brand-muted)" />
          <Input
            variant="unstyled"
            placeholder="Buscar producto…"
            fontFamily="body"
            fontSize="sm"
            py={2}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </HStack>
        <Select
          maxW="180px"
          size="sm"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          bg="white"
          border="1px solid"
          borderColor="brand.sand"
          borderRadius="lg"
          fontFamily="body"
          _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.label}</option>
          ))}
        </Select>
        <Text fontFamily="body" fontSize="xs" color="brand.muted" ml="auto">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </Text>
      </Flex>

      {loading ? (
        <Flex justify="center" py={16}>
          <Spinner size="lg" color="brand.ocean" thickness="2px" />
        </Flex>
      ) : filtered.length === 0 ? (
        <Flex direction="column" align="center" py={16} gap={3}>
          <Package size={48} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
          <Text fontFamily="body" color="brand.muted" fontSize="sm">No se encontraron productos.</Text>
        </Flex>
      ) : (
        <VStack spacing={2} align="stretch">
          {filtered.map((product) => {
            const stock = stockBadge(product.sizes);
            return (
              <Flex
                key={product.id}
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="brand.sand"
                p={4}
                align="center"
                gap={4}
                opacity={product.active ? 1 : 0.55}
                _hover={{ borderColor: "brand.sky", shadow: "sm" }}
                transition="all 0.15s"
                flexWrap="wrap"
              >
                {/* Imagen */}
                <Image
                  src={product.images?.[0]}
                  alt={product.name}
                  w="56px"
                  h="70px"
                  objectFit="cover"
                  borderRadius="lg"
                  flexShrink={0}
                  bg="brand.sand"
                  fallbackSrc="https://via.placeholder.com/56x70/E8ECF0/6B7280?text=."
                />

                {/* Info */}
                <VStack align="flex-start" spacing={0.5} flex={1} minW="140px">
                  <HStack spacing={2} flexWrap="wrap">
                    <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                      {product.name}
                    </Text>
                    {product.featured && (
                      <Badge colorScheme="blue" fontSize="2xs" fontFamily="body">Destacado</Badge>
                    )}
                    {!product.active && (
                      <Badge colorScheme="gray" fontSize="2xs" fontFamily="body">Inactivo</Badge>
                    )}
                  </HStack>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted" textTransform="capitalize">
                    {product.category}
                  </Text>
                  <HStack spacing={2} mt={1}>
                    <Text fontFamily="body" fontSize="sm" fontWeight={700} color="brand.ocean">
                      {formatPrice(product.salePrice || product.price)}
                    </Text>
                    {product.salePrice && (
                      <Text fontFamily="body" fontSize="xs" color="brand.muted" textDecoration="line-through">
                        {formatPrice(product.price)}
                      </Text>
                    )}
                  </HStack>
                </VStack>

                {/* Stock */}
                <VStack spacing={1} align="center" minW="80px">
                  <Badge colorScheme={stock.scheme} fontSize="2xs" borderRadius="full" px={2} fontFamily="body">
                    {stock.label}
                  </Badge>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">
                    {totalStock(product.sizes)} u. totales
                  </Text>
                </VStack>

                {/* Acciones */}
                <HStack spacing={1} flexShrink={0}>
                  <Tooltip label="Editar" hasArrow fontSize="xs">
                    <IconButton
                      icon={<Edit size={15} />}
                      size="sm"
                      variant="ghost"
                      color="brand.muted"
                      borderRadius="lg"
                      _hover={{ bg: "brand.sand", color: "brand.ocean" }}
                      aria-label="Editar"
                      onClick={() => navigate(`/admin/productos/${product.id}`)}
                    />
                  </Tooltip>
                  <Tooltip label={product.active ? "Ocultar" : "Activar"} hasArrow fontSize="xs">
                    <IconButton
                      icon={product.active ? <EyeOff size={15} /> : <Eye size={15} />}
                      size="sm"
                      variant="ghost"
                      color="brand.muted"
                      borderRadius="lg"
                      _hover={{ bg: "brand.sand", color: "brand.dark" }}
                      aria-label="Toggle"
                      onClick={() => handleToggleActive(product.id, product.active)}
                    />
                  </Tooltip>
                  <Tooltip label="Desactivar" hasArrow fontSize="xs">
                    <IconButton
                      icon={<Trash2 size={15} />}
                      size="sm"
                      variant="ghost"
                      color="brand.muted"
                      borderRadius="lg"
                      _hover={{ bg: "rgba(239,68,68,0.08)", color: "brand.error" }}
                      aria-label="Eliminar"
                      onClick={() => handleDelete(product.id, product.name)}
                    />
                  </Tooltip>
                </HStack>
              </Flex>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

export { ProductList };
export default ProductList;
