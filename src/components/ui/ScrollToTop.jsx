import { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!visible) return null;

  return (
    <Box
      position="fixed"
      bottom={6}
      right={6}
      w="44px"
      h="44px"
      borderRadius="full"
      bg="brand.dark"
      color="brand.white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      zIndex={999}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      _hover={{ bg: "brand.ocean", transform: "translateY(-2px)" }}
      transition="all 0.3s"
      boxShadow="lg"
    >
      <ArrowUp size={20} />
    </Box>
  );
};

export default ScrollToTop;
