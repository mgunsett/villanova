import { extendTheme } from "@chakra-ui/react";
import { colors } from "./colors";
import { typography } from "./typography";
import { componentOverrides } from "./components";
import { foundations } from "./foundations";

const theme = extendTheme({
  colors,
  fonts: typography.fonts,
  fontSizes: typography.fontSizes,
  letterSpacings: typography.letterSpacings,
  ...foundations,
  components: componentOverrides,
  styles: {
    global: {
      "html, body": {
        bg: "brand.light",
        color: "brand.dark",
        fontFamily: "body",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
      "::selection": {
        bg: "brand.ocean",
        color: "brand.white",
      },
      "*": {
        scrollbarWidth: "thin",
        scrollbarColor: "var(--chakra-colors-brand-ocean) transparent",
      },
    },
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

export default theme;
