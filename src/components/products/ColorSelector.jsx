import { Box, HStack, Text } from "@chakra-ui/react";

const ColorSelector = ({ colors = [], selected, onChange }) => {
  if (!colors.length) return null;

  return (
    <Box>
      <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={3}>
        Color
      </Text>
      <HStack spacing={2} wrap="wrap">
        {colors.map((colorOption) => {
          const color = typeof colorOption === "string" ? { value: colorOption, label: colorOption, stock: null } : colorOption;
          const isSelected = selected === color.value;
          const isDisabled = color.stock === 0;

          return (
            <Box
              key={color.value}
              minW="64px"
              h="40px"
              px={3}
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="md"
              border="2px solid"
              borderColor={isSelected ? "brand.ocean" : "brand.sand"}
              bg={isSelected ? "rgba(21,101,192,0.08)" : "transparent"}
              color={isSelected ? "brand.ocean" : isDisabled ? "brand.muted" : "brand.dark"}
              cursor={isDisabled ? "not-allowed" : "pointer"}
              opacity={isDisabled ? 0.45 : 1}
              fontFamily="body"
              fontSize="sm"
              fontWeight={700}
              onClick={() => !isDisabled && onChange(color.value)}
              _hover={!isDisabled && !isSelected ? { borderColor: "brand.ocean" } : {}}
              transition="all 0.2s"
            >
              {color.label}
            </Box>
          );
        })}
      </HStack>
    </Box>
  );
};

export default ColorSelector;