import { useEffect, useState } from "react";
import {
  Box, Text, Flex, Button, Badge, Image, Spinner, Input, HStack,
  Table, Thead, Tbody, Tr, Th, Td, IconButton, Select,
} from "@chakra-ui/react";
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct, updateProduct } from "../../services/firebase/products";
import { CATEGORIES } from "../../utils/constants";
import { formatPrice } from "../../utils/formatters";
import toast from "react-hot-toast";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ includeInactive: true });
      setProducts(data);
    } catch (err) {
      console.error("[Admin] Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Desactivar "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: false } : p)));
      toast.success("Producto desactivado");
    } catch {
      toast.error("Error al desactivar");
    }
  };

  const handleToggleActive = async (id, current) => {
    try {
      await updateProduct(id, { active: !current });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: !current } : p))
      );
      toast.success(current ? "Producto desactivado" : "Producto activado");
    } catch {
      toast.error("Error al cambiar estado");
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
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Text fontFamily="heading" fontSize="2xl" color="brand.dark">
          Productos
        </Text>
        <Button leftIcon={<Plus size={16} />} size="sm" onClick={() => navigate("/admin/productos/nuevo")}>
          Nuevo producto
        </Button>
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
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text color="brand.muted">No se encontraron productos.</Text>
        </Box>
      ) : (
        <Box bg="brand.white" borderRadius="lg" border="2px solid" borderColor="brand.sand" overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Producto</Th>
                <Th>Categoría</Th>
                <Th isNumeric>Precio</Th>
                <Th isNumeric>Stock</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((product) => (
                <Tr key={product.id} opacity={product.active ? 1 : 0.5} _hover={{ bg: "brand.light" }}>
                  <Td>
                    <Flex align="center" gap={3}>
                      <Image
                        src={product.images?.[0]}
                        alt={product.name}
                        boxSize="40px"
                        objectFit="cover"
                        borderRadius="md"
                        fallbackSrc="https://via.placeholder.com/40"
                      />
                      <Box>
                        <Text fontSize="sm" fontWeight={500}>{product.name}</Text>
                        {product.featured && (
                          <Badge colorScheme="blue" fontSize="2xs">Destacado</Badge>
                        )}
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    <Text fontSize="sm" textTransform="capitalize">{product.category}</Text>
                  </Td>
                  <Td isNumeric>
                    <Text fontSize="sm" fontWeight={600}>{formatPrice(product.price)}</Text>
                    {product.salePrice && (
                      <Text fontSize="2xs" color="brand.success">{formatPrice(product.salePrice)}</Text>
                    )}
                  </Td>
                  <Td isNumeric>
                    <Text fontSize="sm" fontWeight={600} color={totalStock(product.sizes) > 0 ? "brand.dark" : "brand.error"}>
                      {totalStock(product.sizes)}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={product.active ? "green" : "red"} fontSize="2xs">
                      {product.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton
                        icon={<Edit size={14} />}
                        size="xs"
                        variant="ghost"
                        aria-label="Editar"
                        onClick={() => navigate(`/admin/productos/${product.id}`)}
                      />
                      <IconButton
                        icon={product.active ? <EyeOff size={14} /> : <Eye size={14} />}
                        size="xs"
                        variant="ghost"
                        aria-label="Toggle activo"
                        onClick={() => handleToggleActive(product.id, product.active)}
                      />
                      <IconButton
                        icon={<Trash2 size={14} />}
                        size="xs"
                        variant="ghost"
                        color="brand.error"
                        aria-label="Eliminar"
                        onClick={() => handleDelete(product.id, product.name)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default ProductList;
