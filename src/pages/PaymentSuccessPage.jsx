import { VStack, Text, Button, Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  return (
    <VStack py={32} spacing={6} textAlign="center" px={4}>
      <Box color="brand.success"><CheckCircle size={64} /></Box>
      <Text fontFamily="heading" fontSize="5xl" color="brand.dark">¡Pago exitoso!</Text>
      <Text fontFamily="body" color="brand.muted" maxW="400px">
        Tu pedido fue registrado. Te contactaremos por WhatsApp para coordinar el envío.
      </Text>
      <Button variant="primary" onClick={() => navigate("/")}>Volver al inicio</Button>
    </VStack>
  );
};

export default PaymentSuccessPage;
