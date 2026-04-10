import { VStack, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <VStack py={32} spacing={6} textAlign="center" px={4}>
      <Text fontFamily="heading" fontSize={{ base: "7xl", md: "100px" }} color="brand.ocean" lineHeight={1}>
        404
      </Text>
      <Text fontFamily="heading" fontSize="3xl" color="brand.dark">
        Página no encontrada
      </Text>
      <Text fontFamily="body" color="brand.muted">
        La página que buscás no existe o fue movida.
      </Text>
      <Button variant="primary" onClick={() => navigate("/")}>
        Volver al inicio
      </Button>
    </VStack>
  );
};

export default NotFoundPage;
