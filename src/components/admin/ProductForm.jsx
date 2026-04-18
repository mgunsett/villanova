// ═══════════════════════════════════════════════
// src/components/admin/ProductForm.jsx
// ═══════════════════════════════════════════════
import { useState, useEffect } from "react";
import {
  Box, Text, Flex, Button, Input, Textarea, Select,
  Switch, FormControl, FormLabel, SimpleGrid, VStack, HStack,
  Spinner, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, Badge, Divider,
} from "@chakra-ui/react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct, updateProduct, getProductById,
} from "../../services/firebase/products";
import { CATEGORIES, SIZES } from "../../utils/constants";
import { slugify, formatPrice } from "../../utils/formatters";
import ImageUploader from "./ImageUploader";
import toast from "react-hot-toast";

const emptyForm = {
  name:             "",
  description:      "",
  shortDescription: "",
  category:         "",
  price:            "",
  salePrice:        "",
  sizes:            {},
  images:           [],
  featured:         false,
  active:           true,
  tags:             "",
};

const fieldStyle = {
  bg: "white",
  border: "1px solid",
  borderColor: "brand.sand",
  borderRadius: "lg",
  fontFamily: "body",
  fontSize: "sm",
  color: "brand.dark",
  _placeholder: { color: "brand.muted" },
  _focus: { borderColor: "brand.ocean", boxShadow: "none" },
  _hover: { borderColor: "brand.sky" },
};

const labelStyle = {
  fontFamily: "body",
  fontSize: "xs",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "brand.muted",
  mb: 1.5,
};

// Talles estándar del sistema normalizado
const getAllSizes = () => {
  return SIZES.map((s) => (typeof s === "object" ? s.key : s));
};

const ProductForm = () => {
  const { productId } = useParams();
  const navigate      = useNavigate();
  const isEditing     = !!productId;

  const [form,    setForm]    = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving,  setSaving]  = useState(false);

  // Cargar producto en edición
  useEffect(() => {
    if (!isEditing) return;
    getProductById(productId)
      .then((p) => {
        if (!p) { navigate("/admin/productos"); return; }
        setForm({
          name:             p.name             || "",
          description:      p.description      || "",
          shortDescription: p.shortDescription || "",
          category:         p.category         || "",
          price:            p.price != null    ? String(p.price) : "",
          salePrice:        p.salePrice != null ? String(p.salePrice) : "",
          sizes:            p.sizes            || {},
          images:           p.images           || [],
          featured:         p.featured         === true,
          active:           p.active           !== false,
          tags:             Array.isArray(p.tags) ? p.tags.join(", ") : "",
        });
      })
      .catch((err) => {
        console.error("[ProductForm] Error:", err);
        toast.error("Error cargando producto");
      })
      .finally(() => setLoading(false));
  }, [productId, isEditing, navigate]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSizeStock = (sizeKey, stock) =>
    setForm((prev) => ({
      ...prev,
      sizes: { ...prev.sizes, [sizeKey]: Number(stock) || 0 },
    }));

  const toggleSize = (sizeKey) =>
    setForm((prev) => {
      const sizes = { ...prev.sizes };
      if (sizeKey in sizes) {
        delete sizes[sizeKey];
      } else {
        sizes[sizeKey] = 0;
      }
      return { ...prev, sizes };
    });

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!form.name.trim())    { toast.error("El nombre es obligatorio"); return; }
    if (!form.category)       { toast.error("Seleccioná una categoría"); return; }
    if (!form.price)          { toast.error("El precio es obligatorio"); return; }
    if (!form.images.length)  { toast.error("Agregá al menos una imagen"); return; }

    setSaving(true);
    try {
      const data = {
        name:             form.name.trim(),
        slug:             slugify(form.name),
        description:      form.description.trim(),
        shortDescription: form.shortDescription.trim(),
        category:         form.category,
        price:            Number(form.price),
        salePrice:        form.salePrice ? Number(form.salePrice) : null,
        sizes:            form.sizes,
        images:           form.images,
        featured:         form.featured,
        active:           form.active,
        tags:             form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      if (isEditing) {
        await updateProduct(productId, data);
        toast.success("Producto actualizado");
      } else {
        await createProduct(data);
        toast.success("Producto creado");
      }
      navigate("/admin/productos");
    } catch (err) {
      console.error("[ProductForm] Error guardando:", err);
      toast.error("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner size="lg" color="brand.ocean" thickness="2px" />
      </Flex>
    );
  }

  const allSizes    = getAllSizes();
  const totalStock  = Object.values(form.sizes).reduce((a, b) => a + b, 0);
  const displayPrice = form.salePrice
    ? formatPrice(Number(form.salePrice))
    : form.price
    ? formatPrice(Number(form.price))
    : "—";

  return (
    <Box>
      {/* Header */}
      <Flex align="center" gap={3} mb={6} flexWrap="wrap">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/admin/productos")}
          fontFamily="body"
          fontSize="xs"
          color="brand.muted"
          _hover={{ color: "brand.dark", bg: "brand.sand" }}
        >
          Volver
        </Button>
        <Divider orientation="vertical" h="24px" borderColor="brand.sand" />
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.ocean">
            {isEditing ? "Editar" : "Nuevo"} producto
          </Text>
          <Text fontFamily="heading" fontSize="2xl" color="brand.dark" letterSpacing="0.05em">
            {form.name || "SIN NOMBRE"}
          </Text>
        </VStack>
        {/* Preview precio */}
        {(form.price || form.salePrice) && (
          <Badge
            ml="auto"
            bg="rgba(21,101,192,0.1)"
            color="brand.ocean"
            fontSize="md"
            borderRadius="lg"
            px={3}
            py={1}
            fontFamily="heading"
            letterSpacing="0.05em"
          >
            {displayPrice}
          </Badge>
        )}
      </Flex>

      <Box as="form" onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>

          {/* ── Columna izquierda ── */}
          <VStack spacing={4} align="stretch">

            {/* Información básica */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" p={5}>
              <Text fontFamily="heading" fontSize="lg" color="brand.dark" letterSpacing="0.06em" mb={4}>
                INFORMACIÓN
              </Text>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel {...labelStyle}>Nombre del producto *</FormLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Ej: Remera Surf Dye"
                    {...fieldStyle}
                  />
                  {form.name && (
                    <Text fontFamily="body" fontSize="2xs" color="brand.muted" mt={1}>
                      Slug: {slugify(form.name)}
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Categoría *</FormLabel>
                  <Select
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    placeholder="Seleccioná una categoría"
                    {...fieldStyle}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.emoji ? `${cat.emoji} ` : ""}{cat.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Descripción completa</FormLabel>
                  <Textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Descripción detallada del producto, materiales, características…"
                    {...fieldStyle}
                    h="100px"
                    resize="vertical"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Descripción corta (para cards)</FormLabel>
                  <Input
                    value={form.shortDescription}
                    onChange={(e) => handleChange("shortDescription", e.target.value)}
                    placeholder="Una línea resumida del producto"
                    {...fieldStyle}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Tags (separados por coma)</FormLabel>
                  <Input
                    value={form.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    placeholder="surf, verano, algodón, unisex"
                    {...fieldStyle}
                  />
                </FormControl>
              </VStack>
            </Box>

            {/* Precios */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" p={5}>
              <Text fontFamily="heading" fontSize="lg" color="brand.dark" letterSpacing="0.06em" mb={4}>
                PRECIOS
              </Text>
              <SimpleGrid columns={2} gap={4}>
                <FormControl>
                  <FormLabel {...labelStyle}>Precio normal (ARS) *</FormLabel>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="0"
                    {...fieldStyle}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel {...labelStyle}>Precio oferta (ARS)</FormLabel>
                  <Input
                    type="number"
                    value={form.salePrice}
                    onChange={(e) => handleChange("salePrice", e.target.value)}
                    placeholder="Vacío = sin oferta"
                    {...fieldStyle}
                  />
                </FormControl>
              </SimpleGrid>
              {form.salePrice && form.price && Number(form.salePrice) < Number(form.price) && (
                <HStack mt={3} spacing={2}>
                  <Badge colorScheme="green" fontSize="xs" fontFamily="body">
                    {Math.round((1 - Number(form.salePrice) / Number(form.price)) * 100)}% OFF
                  </Badge>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">descuento aplicado</Text>
                </HStack>
              )}
            </Box>

            {/* Opciones */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" p={5}>
              <Text fontFamily="heading" fontSize="lg" color="brand.dark" letterSpacing="0.06em" mb={4}>
                OPCIONES
              </Text>
              <VStack spacing={3} align="stretch">
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <VStack align="flex-start" spacing={0}>
                    <FormLabel mb={0} fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                      Producto activo
                    </FormLabel>
                    <Text fontFamily="body" fontSize="xs" color="brand.muted">Visible en la tienda</Text>
                  </VStack>
                  <Switch
                    isChecked={form.active}
                    onChange={(e) => handleChange("active", e.target.checked)}
                    colorScheme="green"
                  />
                </FormControl>
                <Divider borderColor="brand.sand" />
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <VStack align="flex-start" spacing={0}>
                    <FormLabel mb={0} fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                      Producto destacado
                    </FormLabel>
                    <Text fontFamily="body" fontSize="xs" color="brand.muted">Aparece en el home</Text>
                  </VStack>
                  <Switch
                    isChecked={form.featured}
                    onChange={(e) => handleChange("featured", e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>
              </VStack>
            </Box>
          </VStack>

          {/* ── Columna derecha ── */}
          <VStack spacing={4} align="stretch">

            {/* Talles y stock */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" p={5}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontFamily="heading" fontSize="lg" color="brand.dark" letterSpacing="0.06em">
                  TALLES Y STOCK
                </Text>
                <Badge
                  bg={totalStock > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"}
                  color={totalStock > 0 ? "brand.success" : "brand.error"}
                  fontSize="xs"
                  borderRadius="full"
                  px={3}
                  fontFamily="body"
                >
                  Total: {totalStock} u.
                </Badge>
              </Flex>
              <SimpleGrid columns={3} gap={3}>
                {allSizes.map((s) => {
                  const isActive = s in form.sizes;
                  return (
                    <VStack key={s} spacing={1.5}>
                      <Box
                        px={3}
                        py={1.5}
                        borderRadius="lg"
                        border="1.5px solid"
                        borderColor={isActive ? "brand.ocean" : "brand.sand"}
                        bg={isActive ? "rgba(21,101,192,0.06)" : "transparent"}
                        cursor="pointer"
                        onClick={() => toggleSize(s)}
                        textAlign="center"
                        w="100%"
                        _hover={{ borderColor: "brand.sky" }}
                        transition="all 0.15s"
                      >
                        <Text
                          fontFamily="body"
                          fontSize="sm"
                          fontWeight={isActive ? 700 : 400}
                          color={isActive ? "brand.ocean" : "brand.muted"}
                        >
                          {s}
                        </Text>
                      </Box>
                      {isActive && (
                        <NumberInput
                          value={form.sizes[s]}
                          min={0}
                          max={999}
                          onChange={(_, v) => handleSizeStock(s, v)}
                          size="sm"
                        >
                          <NumberInputField
                            textAlign="center"
                            fontFamily="body"
                            fontSize="sm"
                            border="1px solid"
                            borderColor="brand.sand"
                            borderRadius="lg"
                            px={2}
                            _focus={{ borderColor: "brand.ocean", boxShadow: "none" }}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    </VStack>
                  );
                })}
              </SimpleGrid>
              <Text fontFamily="body" fontSize="2xs" color="brand.muted" mt={3}>
                Hacé click en un talle para activarlo/desactivarlo. Luego ingresá el stock.
              </Text>
            </Box>

            {/* Imágenes */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="brand.sand" p={5}>
              <Text fontFamily="heading" fontSize="lg" color="brand.dark" letterSpacing="0.06em" mb={4}>
                IMÁGENES
              </Text>
              <ImageUploader
                images={form.images}
                onChange={(imgs) => handleChange("images", imgs)}
                folder="products"
              />
            </Box>
          </VStack>
        </SimpleGrid>

        {/* Footer acciones */}
        <Flex justify="flex-end" mt={5} gap={3}>
          <Button
            variant="ghost"
            fontFamily="body"
            fontSize="xs"
            letterSpacing="0.1em"
            onClick={() => navigate("/admin/productos")}
            isDisabled={saving}
            color="brand.muted"
            _hover={{ color: "brand.dark", bg: "brand.sand" }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            leftIcon={<Save size={15} />}
            fontFamily="body"
            fontSize="xs"
            letterSpacing="0.15em"
            isLoading={saving}
            loadingText="Guardando…"
            px={8}
            py={6}
            onClick={handleSubmit}
          >
            {isEditing ? "Guardar cambios" : "Crear producto"}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default ProductForm;