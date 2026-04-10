import { VStack, Text, Button, Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

const PaymentFailurePage = () => {
  const navigate = useNavigate();
  return (
    <VStack py={32} spacing={6} textAlign="center" px={4}>
      <Box color="brand.error"><XCircle size={64} /></Box>
      <Text fontFamily="heading" fontSize="5xl" color="brand.dark">Pago fallido</Text>
      <Text fontFamily="body" color="brand.muted" maxW="400px">
        Hubo un problema con tu pago. Podés intentar nuevamente o contactarnos por WhatsApp.
      </Text>
      <Button variant="primary" onClick={() => navigate("/carrito")}>Volver al carrito</Button>
    </VStack>
  );
};

export default PaymentFailurePage;
