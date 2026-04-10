import { VStack, Text } from "@chakra-ui/react";

const SectionTitle = ({ eyebrow, title, light = false }) => (
  <VStack spacing={2} textAlign="center">
    {eyebrow && (
      <Text
        fontFamily="body"
        fontSize="xs"
        fontWeight={700}
        letterSpacing="0.25em"
        textTransform="uppercase"
        color={light ? "brand.sky" : "brand.ocean"}
      >
        {eyebrow}
      </Text>
    )}
    {title && (
      <Text
        fontFamily="heading"
        fontWeight={400}
        fontSize={{ base: "4xl", md: "5xl" }}
        color={light ? "brand.white" : "brand.dark"}
        letterSpacing="0.04em"
        lineHeight={1}
      >
        {title}
      </Text>
    )}
  </VStack>
);

export default SectionTitle;
