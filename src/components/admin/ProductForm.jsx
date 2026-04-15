import { useState, useEffect } from "react";
import {
  Box, Text, Flex, Button, Input, Textarea, Select,
  Switch, FormControl, FormLabel, SimpleGrid, Spinner,
} from "@chakra-ui/react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct, updateProduct, getProductById,
} from "../../services/firebase/products";
import { CATEGORIES, SIZES } from "../../utils/constants";
import { slugify } from "../../utils/formatters";
import ImageUploader from "./ImageUploader";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  salePrice: "",
  sizes: {},
  images: [],
  featured: false,
  active: true,
};

const ProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!productId;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    const fetch = async () => {
      try {
        const p = await getProductById(productId);
        if (p) {
          setForm({
            name: p.name,
            description: p.description,
            category: p.category,
            price: String(p.price),
            salePrice: p.salePrice != null ? String(p.salePrice) : "",
            sizes: p.sizes || {},
            images: p.images || [],
            featured: p.featured,
            active: p.active,
          });
        }
      } catch (err) {
        console.error("[Admin] Error cargando producto:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [productId, isEditing]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSizeStock = (sizeKey, stock) => {
    setForm((prev) => ({
      ...prev,
      sizes: { ...prev.sizes, [sizeKey]: Number(stock) || 0 },
    }));
  };

  const toggleSize = (sizeKey) => {
    setForm((prev) => {
      const sizes = { ...prev.sizes };
      if (sizeKey in sizes) {
        delete sizes[sizeKey];
      } else {
        sizes[sizeKey] = 0;
      }
      return { ...prev, sizes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      toast.error("Completá nombre, categoría y precio");
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        slug: slugify(form.name),
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        sizes: form.sizes,
        images: form.images,
        featured: form.featured,
        active: form.active,
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
      console.error("[Admin] Error guardando producto:", err);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="lg" color="brand.ocean" />
      </Flex>
    );
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Flex align="center" gap={3} mb={6}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/productos")}>
          <ArrowLeft size={18} />
        </Button>
        <Text fontFamily="heading" fontSize="2xl" color="brand.dark">
          {isEditing ? "Editar producto" : "Nuevo producto"}
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Datos principales */}
        <Box bg="brand.white" borderRadius="lg" border="2px solid" borderColor="brand.sand" p={6}>
          <Text fontSize="sm" fontWeight={700} textTransform="uppercase" letterSpacing="wider" color="brand.ocean" mb={4}>
            Información
          </Text>

          <FormControl mb={4}>
            <FormLabel fontSize="sm" fontWeight={600}>Nombre</FormLabel>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nombre del producto"
              size="sm"
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel fontSize="sm" fontWeight={600}>Descripción</FormLabel>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descripción del producto"
              size="sm"
              rows={3}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel fontSize="sm" fontWeight={600}>Categoría</FormLabel>
            <Select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="Seleccionar categoría"
              size="sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.emoji} {cat.label}</option>
              ))}
            </Select>
          </FormControl>

          <SimpleGrid columns={2} spacing={4} mb={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight={600}>Precio</FormLabel>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="0"
                size="sm"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight={600}>Precio oferta</FormLabel>
              <Input
                type="number"
                value={form.salePrice}
                onChange={(e) => handleChange("salePrice", e.target.value)}
                placeholder="Opcional"
                size="sm"
              />
            </FormControl>
          </SimpleGrid>

          <Flex gap={6}>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0} fontSize="sm" fontWeight={600}>Destacado</FormLabel>
              <Switch
                isChecked={form.featured}
                onChange={(e) => handleChange("featured", e.target.checked)}
                colorScheme="blue"
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0} fontSize="sm" fontWeight={600}>Activo</FormLabel>
              <Switch
                isChecked={form.active}
                onChange={(e) => handleChange("active", e.target.checked)}
                colorScheme="green"
              />
            </FormControl>
          </Flex>
        </Box>

        {/* Talles e imágenes */}
        <Box>
          <Box bg="brand.white" borderRadius="lg" border="2px solid" borderColor="brand.sand" p={6} mb={6}>
            <Text fontSize="sm" fontWeight={700} textTransform="uppercase" letterSpacing="wider" color="brand.ocean" mb={4}>
              Talles y Stock
            </Text>
            <Flex flexWrap="wrap" gap={3}>
              {SIZES.map((s) => {
                const isActive = s.key in form.sizes;
                return (
                  <Box key={s.key} textAlign="center">
                    <Button
                      size="sm"
                      variant={isActive ? "primary" : "outline"}
                      onClick={() => toggleSize(s.key)}
                      mb={2}
                      minW="50px"
                    >
                      {s.label}
                    </Button>
                    {isActive && (
                      <Input
                        type="number"
                        size="xs"
                        w="60px"
                        textAlign="center"
                        value={form.sizes[s.key]}
                        onChange={(e) => handleSizeStock(s.key, e.target.value)}
                        min={0}
                      />
                    )}
                  </Box>
                );
              })}
            </Flex>
          </Box>

          <Box bg="brand.white" borderRadius="lg" border="2px solid" borderColor="brand.sand" p={6}>
            <ImageUploader
              images={form.images}
              onChange={(imgs) => handleChange("images", imgs)}
            />
          </Box>
        </Box>
      </SimpleGrid>

      <Flex justify="flex-end" mt={6} gap={3}>
        <Button variant="ghost" onClick={() => navigate("/admin/productos")} isDisabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" leftIcon={<Save size={16} />} isLoading={saving} loadingText="Guardando…">
          {isEditing ? "Guardar cambios" : "Crear producto"}
        </Button>
      </Flex>
    </Box>
  );
};

export default ProductForm;
