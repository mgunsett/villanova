export const componentOverrides = {

  Button: {
    baseStyle: {
      fontFamily: "body",
      fontWeight: 600,
      letterSpacing: "wider",
      textTransform: "uppercase",
      fontSize: "sm",
      borderRadius: "md",
      transition: "all 0.25s ease",
      _focus: { boxShadow: "none" },
    },
    variants: {
      primary: {
        bg: "brand.ocean",
        color: "brand.white",
        _hover: { bg: "brand.deep", transform: "translateY(-2px)", boxShadow: "md" },
        _active: { transform: "translateY(0)" },
      },
      solid: {
        bg: "brand.dark",
        color: "brand.white",
        _hover: { bg: "brand.charcoal", transform: "translateY(-2px)" },
        _active: { transform: "translateY(0)" },
      },
      outline: {
        bg: "transparent",
        color: "brand.dark",
        border: "2px solid",
        borderColor: "brand.dark",
        _hover: { bg: "brand.dark", color: "brand.white", transform: "translateY(-2px)" },
        _active: { transform: "translateY(0)" },
      },
      ghost: {
        color: "brand.muted",
        _hover: { bg: "brand.sand", color: "brand.dark" },
      },
      mercadopago: {
        bg: "mp.blue",
        color: "white",
        borderRadius: "md",
        letterSpacing: "normal",
        textTransform: "none",
        fontWeight: 500,
        _hover: { bg: "mp.blueDark", transform: "translateY(-2px)" },
      },
      whatsapp: {
        bg: "wa.green",
        color: "white",
        borderRadius: "md",
        letterSpacing: "normal",
        textTransform: "none",
        fontWeight: 500,
        _hover: { bg: "wa.greenDark", transform: "translateY(-2px)" },
      },
    },
    defaultProps: { variant: "primary" },
  },

  Input: {
    baseStyle: {
      field: {
        fontFamily: "body",
        bg: "brand.white",
        border: "2px solid",
        borderColor: "brand.sand",
        borderRadius: "md",
        color: "brand.dark",
        fontSize: "sm",
        _placeholder: { color: "brand.muted" },
        _focus: {
          borderColor: "brand.ocean",
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-ocean)",
        },
        _hover: { borderColor: "brand.sky" },
      },
    },
    defaultProps: { variant: "unstyled" },
  },

  Select: {
    baseStyle: {
      field: {
        fontFamily: "body",
        bg: "brand.white",
        border: "2px solid",
        borderColor: "brand.sand",
        borderRadius: "md",
        color: "brand.dark",
        fontSize: "sm",
        _focus: { borderColor: "brand.ocean" },
      },
    },
    defaultProps: { variant: "unstyled" },
  },

  Heading: {
    baseStyle: {
      fontFamily: "heading",
      fontWeight: 400,
      color: "brand.dark",
      letterSpacing: "wide",
    },
  },
};
