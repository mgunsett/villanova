import { Box, Text } from "@chakra-ui/react";
import { MessageCircle } from "lucide-react";

const WhatsAppFAB = () => {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER || "";

  return (
    <Box
      as="a"
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      position="fixed"
      bottom={6}
      left={6}
      zIndex={999}
      display="flex"
      alignItems="center"
      gap={2}
      bg="wa.green"
      color="white"
      px={4}
      py={3}
      borderRadius="full"
      boxShadow="lg"
      _hover={{ bg: "wa.greenDark", transform: "translateY(-2px)" }}
      transition="all 0.3s"
    >
      <MessageCircle size={22} fill="white" strokeWidth={0} />
      <Text fontFamily="body" fontWeight={600} fontSize="sm" display={{ base: "none", md: "block" }}>
        Chateá con nosotros
      </Text>
    </Box>
  );
};

export default WhatsAppFAB;
