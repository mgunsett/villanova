import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { Truck, Tag , Zap } from "lucide-react";

const ITEMS = [
  { icon: Truck,       text: "Envíos a todo el país" },
  { icon: Tag,  text: "10% off Efectivo" },
  { icon: Zap,         text: "Nueva colección disponible" },
];

const ITEMS_MOBILE = [
  { icon: Truck,       text: "Envíos a todo el país" },
  { icon: Tag,         text: "10% off Efectivo" },
];

// 6 copias para garantizar que el contenido supere el ancho del viewport
const REPEATED = [...Array(6)].flatMap(() => ITEMS);

const ticker = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const MobileIcon = ITEMS[0].icon;

const TopBar = () => (
  <Box
    position="fixed"
    top={0}
    left={0}
    right={0}
    zIndex={1001}
    bg="brand.ocean"
    color="white"
    h="34px"
    overflow="hidden"
    display="flex"
    alignItems="center"
  >
    {/* Desktop: ticker continuo de derecha a izquierda */}
    <Flex
      display={{ base: "none", md: "flex" }}
      align="center"
      fontFamily="body"
      fontSize="xs"
      fontWeight={600}
      letterSpacing="0.06em"
      textTransform="uppercase"
      whiteSpace="nowrap"
      flexShrink={0}
      animation={`${ticker} 28s linear infinite`}
      sx={{ willChange: "transform" }}
    >
      {REPEATED.map((item, i) => (
        <HStack key={i} spacing={1.5} flexShrink={0} px={8}>
          <item.icon size={12} strokeWidth={2} />
          <Text>{item.text}</Text>
          <Text opacity={0.3} pl={8}>·</Text>
        </HStack>
      ))}
    </Flex>

    {/* Mobile: estático, solo primer ítem centrado */}
    <Flex
      display={{ base: "flex", md: "none" }}
      align="center"
      justify="center"
      gap={6}
      fontFamily="body"
      fontSize="10px"
      fontWeight={600}
      letterSpacing="0.06em"
      textTransform="uppercase"
      w="100%"
    >
      {ITEMS_MOBILE.map((item, i) => (
        <HStack key={i} spacing={1.5} align="center">
          <item.icon size={12} strokeWidth={2} />
          <Text fontSize="10px">{item.text}</Text>
        </HStack>
      ))}
    </Flex>
  </Box>
);

export default TopBar;


