import { HStack, Text } from "@chakra-ui/react";

const Logo = ({ size = "md" }) => {
  const sizes = {
    sm: { main: "20px", sub: "8px" },
    md: { main: "28px", sub: "9px" },
    lg: { main: "36px", sub: "11px" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <HStack spacing={0} align="baseline">
      <Text
        fontFamily="heading"
        fontWeight={400}
        fontSize={s.main}
        letterSpacing="0.08em"
        textTransform="uppercase"
        color="brand.dark"
        lineHeight={1}
      >
        Villaa
      </Text>
      <Text
        fontFamily="heading"
        fontWeight={400}
        fontSize={s.main}
        letterSpacing="0.08em"
        textTransform="uppercase"
        color="brand.ocean"
        lineHeight={1}
      >
        nova
      </Text>
    </HStack>
  );
};

export default Logo;
