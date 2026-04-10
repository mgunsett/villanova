import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";
import theme from "./theme";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <CartProvider>
          <AppRouter />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                background: "#FFFFFF",
                color: "#0F0F0F",
                border: "2px solid #E8ECF0",
                borderRadius: "8px",
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
