


// ═══════════════════════════════════════════════
// src/components/admin/StockManager.jsx
// ═══════════════════════════════════════════════
import { useEffect, useState, useRef } from "react";
import {
  Box, Text, Flex, Spinner, Input, Button, Badge, Image,
  VStack, HStack, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td,
  Select, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, Textarea, useDisclosure,
  NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper,
} from "@chakra-ui/react";
import { Save, Search, Plus, Minus, Package } from "lucide-react";
import { getProducts } from "../../services/firebase/products";
import { updateStock } from "../../services/firebase/stock";
import { createMovement } from "../../services/firebase/movements";
import { SIZES } from "../../utils/constants";
import { CATEGORIES } from "../../utils/categories";
import toast from "react-hot-toast";

// Modal para registrar movimiento manual
const MovementModal = ({ isOpen, onClose, product, type, onSuccess }) => {
  const [sizeKey, setSizeKey]   = useState("");
  const [qty,     setQty]       = useState(1);
  const [reason,  setReason]    = useState("");
  const [saving,  setSaving]    = useState(false);

  const availableSizes = Object.keys(product?.sizes || {});

  const handleSave = async () => {
    if (!sizeKey) { toast.error("Seleccioná un talle"); return; }
    if (qty <= 0)  { toast.error("La cantidad debe ser mayor a 0"); return; }

    setSaving(true);
    try {
      const currentStock = product.sizes[sizeKey] || 0;
      const newStock     = type === "in"
        ? currentStock + qty
        : Math.max(0, currentStock - qty);

      const newSizes = { ...product.sizes, [sizeKey]: newStock };

      await Promise.all([
        updateStock(product.id, newSizes),
        createMovement({
          productId:   product.id,
          productName: product.name,
          sizeKey,
          quantity:    qty,
          type,
          reason:      reason.trim() || (type === "in" ? "Ingreso manual" : "Egreso/merma"),
        }),
      ]);

      toast.success(`Stock ${type === "in" ? "agregado" : "descontado"} correctamente`);
      onSuccess(product.id, newSizes);
      onClose();
      setSizeKey(""); setQty(1); setReason("");
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent borderRadius="xl" bg="white">
        <ModalHeader fontFamily="heading" fontSize="xl" letterSpacing="0.05em" color="brand.dark">
          {type === "in" ? "INGRESO DE STOCK" : "EGRESO / MERMA"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {product && (
              <HStack spacing={3} w="100%" bg="brand.sand" borderRadius="lg" p={3}>
                {product.images?.[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    w="40px" h="50px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                )}
                <VStack align="flex-start" spacing={0}>
                  <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                    {product.name}
                  </Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted" textTransform="capitalize">
                    {product.category}
                  </Text>
                </VStack>
              </HStack>
            )}

            <Box w="100%">
              <Text fontFamily="body" fontSize="xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={2}>
                Talle
              </Text>
              <Select
                value={sizeKey}
                onChange={(e) => setSizeKey(e.target.value)}
                placeholder="Seleccioná un talle"
                bg="white"
                border="1px solid"
                borderColor="brand.sand"
                borderRadius="lg"
                fontFamily="body"
                fontSize="sm"
                _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
              >
                {availableSizes.map((s) => (
                  <option key={s} value={s}>
                    {s} — Stock actual: {product?.sizes[s] || 0}
                  </option>
                ))}
              </Select>
            </Box>

            <Box w="100%">
              <Text fontFamily="body" fontSize="xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={2}>
                Cantidad
              </Text>
              <NumberInput
                value={qty}
                min={1}
                max={999}
                onChange={(_, v) => setQty(v || 1)}
              >
                <NumberInputField
                  fontFamily="body"
                  fontSize="sm"
                  border="1px solid"
                  borderColor="brand.sand"
                  borderRadius="lg"
                  _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>

            <Box w="100%">
              <Text fontFamily="body" fontSize="xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={2}>
                Motivo (opcional)
              </Text>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={type === "in" ? "Ej: Reposición, nueva remesa…" : "Ej: Rotura, muestra, pérdida…"}
                fontFamily="body"
                fontSize="sm"
                border="1px solid"
                borderColor="brand.sand"
                borderRadius="lg"
                rows={2}
                resize="none"
                _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
              />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            variant="ghost"
            size="sm"
            fontFamily="body"
            onClick={onClose}
            isDisabled={saving}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            fontFamily="body"
            fontSize="xs"
            letterSpacing="0.1em"
            bg={type === "in" ? "brand.success" : "brand.error"}
            color="white"
            _hover={{ opacity: 0.88 }}
            leftIcon={type === "in" ? <Plus size={14} /> : <Minus size={14} />}
            isLoading={saving}
            onClick={handleSave}
          >
            {type === "in" ? "Registrar ingreso" : "Registrar egreso"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ── StockManager principal ────────────────────────────────────────────
const StockManager = () => {
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("");
  const [editedSizes,  setEditedSizes]  = useState({});
  const [saving,       setSaving]       = useState({});
  const [modalProduct, setModalProduct] = useState(null);
  const [modalType,    setModalType]    = useState("in");
  const { isOpen, onOpen, onClose }     = useDisclosure();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ includeInactive: true });
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSizeChange = (productId, sizeKey, value) => {
    setEditedSizes((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [sizeKey]: Number(value) || 0 },
    }));
  };

  const getEffectiveSizes = (product) => ({
    ...(product.sizes || {}),
    ...(editedSizes[product.id] || {}),
  });

  const hasChanges = (productId) =>
    !!editedSizes[productId] && Object.keys(editedSizes[productId]).length > 0;

  const handleSave = async (product) => {
    const newSizes = getEffectiveSizes(product);
    setSaving((prev) => ({ ...prev, [product.id]: true }));
    try {
      await updateStock(product.id, newSizes);
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, sizes: newSizes } : p)
      );
      setEditedSizes((prev) => { const n = { ...prev }; delete n[product.id]; return n; });
      toast.success(`"${product.name}" actualizado`);
    } catch { toast.error("Error actualizando stock"); }
    finally { setSaving((prev) => ({ ...prev, [product.id]: false })); }
  };

  const openModal = (product, type) => {
    setModalProduct(product);
    setModalType(type);
    onOpen();
  };

  const handleMovementSuccess = (productId, newSizes) => {
    setProducts((prev) =>
      prev.map((p) => p.id === productId ? { ...p, sizes: newSizes } : p)
    );
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalStock = (sizes) => Object.values(sizes || {}).reduce((a, b) => a + b, 0);

  const allSizes = SIZES.map((s) => (typeof s === "object" ? s.key : s));

  return (
    <Box>
      {/* Header */}
      <VStack align="flex-start" spacing={0} mb={6}>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.ocean">
          Inventario
        </Text>
        <Text fontFamily="heading" fontSize="4xl" color="brand.dark" letterSpacing="0.05em">
          STOCK
        </Text>
      </VStack>

      {/* Filtros */}
      <Flex gap={3} mb={5} flexWrap="wrap">
        <HStack
          bg="white"
          border="1px solid"
          borderColor="brand.sand"
          borderRadius="lg"
          px={3}
          flex={1}
          maxW="280px"
          _focusWithin={{ borderColor: "brand.ocean" }}
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
      </Flex>

      {/* Leyenda */}
      <HStack spacing={4} mb={4} flexWrap="wrap">
        {[
          { color: "brand.error",   label: "Sin stock (0)" },
          { color: "#F59E0B",       label: "Bajo (1-3)"    },
          { color: "brand.success", label: "OK (4+)"       },
        ].map(({ color, label }) => (
          <HStack key={label} spacing={1.5}>
            <Box w="8px" h="8px" borderRadius="full" bg={color} />
            <Text fontFamily="body" fontSize="xs" color="brand.muted">{label}</Text>
          </HStack>
        ))}
      </HStack>

      {loading ? (
        <Flex justify="center" py={12}><Spinner size="lg" color="brand.ocean" thickness="2px" /></Flex>
      ) : (
        <VStack spacing={3} align="stretch">
          {filtered.map((product) => {
            const sizes   = getEffectiveSizes(product);
            const changed = hasChanges(product.id);
            const total   = totalStock(sizes);

            return (
              <Box
                key={product.id}
                bg="white"
                borderRadius="xl"
                border="1.5px solid"
                borderColor={changed ? "brand.ocean" : "brand.sand"}
                p={4}
                transition="border-color 0.15s"
              >
                <Flex align="center" gap={3} mb={3} flexWrap="wrap">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      w="40px" h="50px"
                      objectFit="cover"
                      borderRadius="md"
                      flexShrink={0}
                    />
                  ) : (
                    <Box w="40px" h="50px" bg="brand.sand" borderRadius="md" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                      <Package size={16} color="var(--chakra-colors-brand-muted)" strokeWidth={1.5} />
                    </Box>
                  )}

                  <VStack align="flex-start" spacing={0} flex={1}>
                    <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                      {product.name}
                    </Text>
                    <Text fontFamily="body" fontSize="xs" color="brand.muted" textTransform="capitalize">
                      {product.category}
                    </Text>
                  </VStack>

                  <Badge
                    colorScheme={total === 0 ? "red" : total <= 5 ? "yellow" : "green"}
                    fontSize="xs"
                    borderRadius="full"
                    px={3}
                    fontFamily="body"
                  >
                    {total} u.
                  </Badge>

                  {/* Acciones rápidas de movimiento */}
                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      bg="rgba(16,185,129,0.1)"
                      color="brand.success"
                      border="1px solid"
                      borderColor="rgba(16,185,129,0.3)"
                      fontFamily="body"
                      fontSize="2xs"
                      letterSpacing="0.05em"
                      leftIcon={<Plus size={11} />}
                      _hover={{ bg: "rgba(16,185,129,0.2)" }}
                      onClick={() => openModal(product, "in")}
                      borderRadius="lg"
                    >
                      Ingreso
                    </Button>
                    <Button
                      size="xs"
                      bg="rgba(239,68,68,0.08)"
                      color="brand.error"
                      border="1px solid"
                      borderColor="rgba(239,68,68,0.25)"
                      fontFamily="body"
                      fontSize="2xs"
                      letterSpacing="0.05em"
                      leftIcon={<Minus size={11} />}
                      _hover={{ bg: "rgba(239,68,68,0.14)" }}
                      onClick={() => openModal(product, "out")}
                      borderRadius="lg"
                    >
                      Egreso
                    </Button>
                  </HStack>
                </Flex>

                {/* Grid de talles */}
                <SimpleGrid columns={allSizes.length} gap={2}>
                  {allSizes.map((s) => {
                    const val   = sizes[s] ?? null;
                    const color = val === null ? "brand.muted"
                      : val === 0 ? "brand.error"
                      : val <= 3 ? "#F59E0B"
                      : "brand.success";
                    const hasSize = s in (product.sizes || {}) || s in (editedSizes[product.id] || {});

                    return (
                      <VStack key={s} spacing={1}>
                        <Text fontFamily="body" fontSize="2xs" color={hasSize ? color : "brand.sand"} fontWeight={600}>
                          {s}
                        </Text>
                        {hasSize ? (
                          <Input
                            type="number"
                            size="xs"
                            textAlign="center"
                            value={val ?? ""}
                            onChange={(e) => handleSizeChange(product.id, s, e.target.value)}
                            min={0}
                            fontFamily="body"
                            border="1px solid"
                            borderColor={editedSizes[product.id]?.[s] !== undefined ? "brand.ocean" : "brand.sand"}
                            borderRadius="md"
                            bg={editedSizes[product.id]?.[s] !== undefined ? "rgba(21,101,192,0.05)" : "white"}
                            _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
                            px={1}
                          />
                        ) : (
                          <Text fontFamily="body" fontSize="xs" color="brand.sand">—</Text>
                        )}
                      </VStack>
                    );
                  })}
                </SimpleGrid>

                {/* Guardar cambios directos */}
                {changed && (
                  <Flex justify="flex-end" mt={3}>
                    <Button
                      size="xs"
                      leftIcon={<Save size={12} />}
                      fontFamily="body"
                      fontSize="xs"
                      letterSpacing="0.08em"
                      isLoading={saving[product.id]}
                      onClick={() => handleSave(product)}
                      borderRadius="lg"
                    >
                      Guardar cambios
                    </Button>
                  </Flex>
                )}
              </Box>
            );
          })}
        </VStack>
      )}

      {/* Modal movimiento */}
      {modalProduct && (
        <MovementModal
          isOpen={isOpen}
          onClose={() => { onClose(); setModalProduct(null); }}
          product={modalProduct}
          type={modalType}
          onSuccess={handleMovementSuccess}
        />
      )}
    </Box>
  );
};

export { StockManager };
export default StockManager;
