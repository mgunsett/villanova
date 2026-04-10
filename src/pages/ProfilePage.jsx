import { VStack, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/firebase/auth";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  return (
    <VStack py={{ base: 8, md: 16 }} spacing={6} px={4} maxW="500px" mx="auto">
      <Text fontFamily="heading" fontSize={{ base: "4xl", md: "5xl" }} color="brand.dark">
        Mi cuenta
      </Text>

      <VStack spacing={3} bg="brand.white" p={6} borderRadius="lg" boxShadow="card" w="100%">
        <Text fontFamily="body" fontWeight={700} fontSize="lg" color="brand.dark">
          {profile?.displayName || user?.displayName || "Usuario"}
        </Text>
        <Text fontFamily="body" fontSize="sm" color="brand.muted">
          {user?.email}
        </Text>
      </VStack>

      <Button variant="outline" w="100%" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </VStack>
  );
};

export default ProfilePage;
