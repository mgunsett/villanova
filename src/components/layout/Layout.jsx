import { Box } from "@chakra-ui/react";
import Navbar from "./Navbar";
import TopBar from "./TopBar";
import Footer from "./Footer";
import WhatsAppFAB from "../ui/WhatsAppFAB";
import ScrollToTop from "../ui/ScrollToTop";

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" bg="brand.light">
      <TopBar />
      <Navbar />
      <Box as="main" pt="96px">
        {children}
      </Box>
      <Footer />
      <WhatsAppFAB />
      <ScrollToTop />
    </Box>
  );
};

export default Layout;
