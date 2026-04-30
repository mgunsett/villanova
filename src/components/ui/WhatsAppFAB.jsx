import { Box, Tooltip, useBreakpointValue } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { MessageCircle } from "lucide-react";

const fabEntrance = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const WhatsAppFAB = () => {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER || "";
  const tooltipPlacement = useBreakpointValue({ base: "top", md: "right" }) || "right";

  return (
    <Tooltip
      label="Chateá con nosotros"
      hasArrow
      placement={tooltipPlacement}
      bg="gray.800"
      color="white"
      openDelay={150}
    >
      <Box
        as="a"
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chateá con nosotros"
        position="fixed"
        bottom={{ base: 4, md: 6 }}
        left={{ base: 4, md: 6 }}
        zIndex={999}
        display="flex"
        alignItems="center"
        gap={2}
        bg="wa.green"
        color="white"
        px={3}
        py={3}
        borderRadius="full"
        boxShadow="lg"
        _hover={{ bg: "wa.greenDark", transform: "translateY(-2px)" }}
        _active={{ transform: "translateY(0)" }}
        transition="all 0.3s"
        animation={`${fabEntrance} 0.35s ease-out`}
        willChange="transform, opacity"
      >
        <MessageCircle size={22} fill="white" strokeWidth={0} />
      </Box>
    </Tooltip>
  );
};

export default WhatsAppFAB;
