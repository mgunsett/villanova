import { useState, useEffect } from "react";
import { Box, Text, Spinner, VStack } from "@chakra-ui/react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

const MP_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

let mpInitialized = false;

const MercadoPagoButton = ({ orderData, disabled }) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mpInitialized && MP_PUBLIC_KEY) {
      initMercadoPago(MP_PUBLIC_KEY, { locale: "es-AR" });
      mpInitialized = true;
    }
  }, []);

  useEffect(() => {
    if (!orderData || disabled) return;

    const createPreference = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/create-preference`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.orderId,
            items: orderData.items.map((i) => ({
              title: i.name,
              unit_price: i.price,
              quantity: i.quantity,
              picture_url: i.image,
            })),
            payer: {
              name: orderData.payer?.name,
              surname: orderData.payer?.lastName,
              email: orderData.payer?.email,
              identification: { type: "DNI", number: orderData.payer?.dni },
            },
          }),
        });

        if (!res.ok) throw new Error("Error al crear preferencia");
        const data = await res.json();
        setPreferenceId(data.preferenceId || data.id);
      } catch (err) {
        console.error("MercadoPago preference error:", err);
        setError("No se pudo conectar con MercadoPago. Intentá de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    createPreference();
  }, [orderData, disabled]);

  if (!MP_PUBLIC_KEY) return null;

  return (
    <Box
      bg="brand.white"
      borderRadius="lg"
      border="0.5px solid rgba(160,120,90,0.15)"
      p={5}
    >
      <VStack spacing={3} align="stretch">
        <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
          💳 Pagar con MercadoPago
        </Text>
        <Text fontFamily="body" fontSize="xs" color="brand.muted">
          Tarjeta de crédito, débito o dinero en cuenta
        </Text>

        {loading && (
          <Box textAlign="center" py={4}>
            <Spinner size="sm" color="brand.ocean" />
          </Box>
        )}

        {error && (
          <Text fontFamily="body" fontSize="xs" color="brand.error">
            {error}
          </Text>
        )}

        {preferenceId && (
          <Box id="wallet_container">
            <Wallet
              initialization={{ preferenceId, redirectMode: "self" }}
              customization={{ visual: { buttonBackground: "black", borderRadius: "8px" } }}
            />
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default MercadoPagoButton;
