import { VStack, Text, Button, Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

const PaymentPendingPage = () => {
  const navigate = useNavigate();
  return (
    <VStack py={32} spacing={6} textAlign="center" px={4}>
      <Box color="brand.ocean"><Clock size={64} /></Box>
      <Text fontFamily="heading" fontSize="5xl" color="brand.dark">Pago pendiente</Text>
      <Text fontFamily="body" color="brand.muted" maxW="400px">
        Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.
      </Text>
      <Button variant="primary" onClick={() => navigate("/")}>Volver al inicio</Button>
    </VStack>
  );
};

export default PaymentPendingPage;
