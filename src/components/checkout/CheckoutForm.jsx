import { useEffect, useMemo } from "react";
import {
  VStack, SimpleGrid, Input, Select, FormControl, FormLabel,
  FormErrorMessage, Text, Box, HStack,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SHIPPING_COSTS, NEARBY_CITIES } from "../../utils/constants";
import { formatPrice } from "../../utils/formatters";

const schema = z.object({
  shippingMethod: z.enum(["local", "delivery"]),
  name:     z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  dni:      z.string().regex(/^\d{7,9}$/, "DNI inválido"),
  email:    z.string().email("Email inválido"),
  phone:    z.string().min(8, "Teléfono requerido"),
  address:  z.string().optional().default(""),
  city:     z.string().optional().default(""),
  province: z.string().optional().default(""),
  zip:      z.string().optional().default(""),
}).superRefine((data, ctx) => {
  if (data.shippingMethod === "delivery") {
    if (!data.address || data.address.length < 5)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "Dirección requerida" });
    if (!data.city || data.city.length < 2)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["city"], message: "Ciudad requerida" });
    if (!data.province || data.province.length < 2)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["province"], message: "Provincia requerida" });
    if (!data.zip || data.zip.length < 4)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["zip"], message: "Código postal requerido" });
  }
});

export { schema };

const fieldStyle = {
  bg: "brand.white",
  border: "0.5px solid",
  borderColor: "rgba(160,120,90,0.3)",
  borderRadius: "sm",
  fontFamily: "body",
  fontSize: "sm",
  color: "brand.dark",
  px: 4,
  h: "44px",
  _placeholder: { color: "brand.muted" },
  _focus: { borderColor: "brand.brown", boxShadow: "0 0 0 1px var(--chakra-colors-brand-brown)", outline: "none" },
};

const PROVINCES = [
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba",
  "Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja",
  "Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan",
  "San Luis","Santa Cruz","Santa Fe","Santiago del Estero","Tierra del Fuego","Tucumán",
];

const normalizeCity = (str) =>
  str.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const DELIVERY_OPTIONS = [
  { value: "local",    label: "Retiro por local",  sub: "Gratis" },
  { value: "delivery", label: "Envío a domicilio", sub: "Se calcula según ciudad" },
];

const CheckoutForm = ({ onSubmit, defaultValues, onShippingChange }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { shippingMethod: "local", ...defaultValues },
  });

  const shippingMethod = watch("shippingMethod");
  const city = watch("city", "");

  const shippingCost = useMemo(() => {
    if (shippingMethod === "local") return 0;
    return NEARBY_CITIES.includes(normalizeCity(city || ""))
      ? SHIPPING_COSTS.nearby
      : SHIPPING_COSTS.far;
  }, [shippingMethod, city]);

  useEffect(() => {
    onShippingChange?.(shippingMethod, shippingCost);
  }, [shippingMethod, shippingCost]);

  return (
    <Box as="form" id="checkout-form" onSubmit={handleSubmit(onSubmit)} w="100%">
      <VStack align="flex-start" spacing={6}>

        {/* Datos personales */}
        <Box>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.brown" mb={1}>
            Datos personales
          </Text>
          <Text fontFamily="body" fontSize="xs" color="brand.muted">
            Necesitamos estos datos para procesar tu pedido
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} w="100%">
          <FormControl isInvalid={!!errors.name}>
            <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Nombre</FormLabel>
            <Input {...register("name")} placeholder="María" {...fieldStyle} />
            <FormErrorMessage fontSize="xs">{errors.name?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.lastName}>
            <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Apellido</FormLabel>
            <Input {...register("lastName")} placeholder="González" {...fieldStyle} />
            <FormErrorMessage fontSize="xs">{errors.lastName?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.dni}>
            <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>DNI</FormLabel>
            <Input {...register("dni")} placeholder="12345678" {...fieldStyle} />
            <FormErrorMessage fontSize="xs">{errors.dni?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.phone}>
            <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Teléfono</FormLabel>
            <Input {...register("phone")} placeholder="+54 9 11 1234-5678" {...fieldStyle} />
            <FormErrorMessage fontSize="xs">{errors.phone?.message}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        <FormControl isInvalid={!!errors.email} w="100%">
          <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Email</FormLabel>
          <Input {...register("email")} type="email" placeholder="vos@email.com" {...fieldStyle} />
          <FormErrorMessage fontSize="xs">{errors.email?.message}</FormErrorMessage>
        </FormControl>

        {/* Selector forma de entrega */}
        <Box w="100%">
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.brown" mb={3} mt={1}>
            Forma de entrega
          </Text>
          <Controller
            name="shippingMethod"
            control={control}
            render={({ field }) => (
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                {DELIVERY_OPTIONS.map(({ value, label, sub }) => {
                  const isSelected = field.value === value;
                  return (
                    <Box
                      key={value}
                      onClick={() => field.onChange(value)}
                      cursor="pointer"
                      p={4}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={isSelected ? "brand.brown" : "rgba(160,120,90,0.2)"}
                      bg={isSelected ? "rgba(139,90,60,0.05)" : "brand.white"}
                      transition="all 0.2s"
                      _hover={{ borderColor: "brand.brown" }}
                    >
                      <HStack spacing={2} mb={1}>
                        <Box
                          w="14px" h="14px" borderRadius="full"
                          border="2px solid"
                          borderColor={isSelected ? "brand.brown" : "rgba(160,120,90,0.35)"}
                          bg={isSelected ? "brand.brown" : "transparent"}
                          transition="all 0.2s"
                          flexShrink={0}
                        />
                        <Text fontFamily="body" fontSize="sm" fontWeight={isSelected ? 600 : 400} color="brand.dark">
                          {label}
                        </Text>
                      </HStack>
                      <Text fontFamily="body" fontSize="xs" color={isSelected ? "brand.brown" : "brand.muted"} pl="22px">
                        {sub}
                      </Text>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          />
        </Box>

        {/* Info retiro por local */}
        {shippingMethod === "local" && (
          <Box w="100%" p={3} borderRadius="md" bg="rgba(37,211,102,0.05)" border="0.5px solid rgba(37,211,102,0.25)">
            <Text fontFamily="body" fontSize="xs" color="brand.success">
              📍 Te contactaremos por WhatsApp para coordinar el día y horario de retiro en nuestro local.
            </Text>
          </Box>
        )}

        {/* Formulario datos de envío (solo si delivery) */}
        {shippingMethod === "delivery" && (
          <Box w="100%">
            <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.brown" mb={4} mt={1}>
              Datos de envío
            </Text>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.address}>
                <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Dirección</FormLabel>
                <Input {...register("address")} placeholder="Av. Corrientes 1234" {...fieldStyle} />
                <FormErrorMessage fontSize="xs">{errors.address?.message}</FormErrorMessage>
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4} w="100%">
                <FormControl isInvalid={!!errors.city}>
                  <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Ciudad</FormLabel>
                  <Input {...register("city")} placeholder="Santa Fe" {...fieldStyle} />
                  <FormErrorMessage fontSize="xs">{errors.city?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.province}>
                  <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Provincia</FormLabel>
                  <Select
                    {...register("province")}
                    {...fieldStyle}
                    h="44px"
                    placeholder="Seleccioná"
                  >
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </Select>
                  <FormErrorMessage fontSize="xs">{errors.province?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.zip}>
                  <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Cód. Postal</FormLabel>
                  <Input {...register("zip")} placeholder="1000" {...fieldStyle} />
                  <FormErrorMessage fontSize="xs">{errors.zip?.message}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
            </VStack>

            {/* Indicador de costo de envío en tiempo real */}
            {(city || "").trim().length >= 2 && (
              <Box mt={3} p={3} borderRadius="md" bg="brand.beige" border="0.5px solid rgba(160,120,90,0.2)">
                <HStack justify="space-between">
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">
                    {NEARBY_CITIES.includes(normalizeCity(city))
                      ? "🚚 Envío cercano (Santa Fe y alrededores)"
                      : "🚚 Envío a todo el país"
                    }
                  </Text>
                  <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.brown">
                    {formatPrice(shippingCost)}
                  </Text>
                </HStack>
              </Box>
            )}
          </Box>
        )}

        <Text fontFamily="body" fontSize="xs" color="brand.muted" lineHeight={1.7} pt={1}>
          {shippingMethod === "delivery"
            ? "📦 El tiempo de envío se coordina por WhatsApp una vez confirmado el pago. Trabajamos con correo y transporte a todo el país."
            : "📦 Los pedidos con retiro por local se procesan en 24/48 hs hábiles."
          }
        </Text>
      </VStack>
    </Box>
  );
};

export default CheckoutForm;

