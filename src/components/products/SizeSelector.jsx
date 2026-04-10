import { HStack, Box, Text } from "@chakra-ui/react";
import { SIZES } from "../../utils/constants";

const SizeSelector = ({ sizes = {}, selected, onChange }) => {
  return (
    <Box>
      <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={3}>
        Talle
      </Text>
      <HStack spacing={2} wrap="wrap">
        {SIZES.map(({ key, label }) => {
          const stock = sizes[key] ?? 0;
          const isSelected = selected === key;
          const isDisabled = stock === 0;

          return (
            <Box
              key={key}
              w="48px" h="48px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="md"
              border="2px solid"
              borderColor={isSelected ? "brand.ocean" : "brand.sand"}
              bg={isSelected ? "brand.ocean" : "transparent"}
              color={isSelected ? "white" : isDisabled ? "brand.muted" : "brand.dark"}
              opacity={isDisabled ? 0.4 : 1}
              cursor={isDisabled ? "not-allowed" : "pointer"}
              fontFamily="body"
              fontSize="sm"
              fontWeight={700}
              onClick={() => !isDisabled && onChange(key)}
              _hover={!isDisabled && !isSelected ? { borderColor: "brand.ocean" } : {}}
              transition="all 0.2s"
            >
              {label}
            </Box>
          );
        })}
      </HStack>
    </Box>
  );
};

export default SizeSelector;
