import { Text, Box } from "@chakra-ui/react";

const AdminPage = () => {
  return (
    <Box py={16} px={4} textAlign="center">
      <Text fontFamily="heading" fontSize="5xl" color="brand.dark">
        Panel Admin
      </Text>
      <Text fontFamily="body" color="brand.muted" mt={4}>
        Próximamente: gestión de productos, órdenes y stock.
      </Text>
    </Box>
  );
};

export default AdminPage;
