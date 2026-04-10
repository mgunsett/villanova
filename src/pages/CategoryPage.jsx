import { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Text, VStack, useDisclosure } from "@chakra-ui/react";
import ProductGrid from "../components/products/ProductGrid";
import ProductModal from "../components/products/ProductModal";
import { useProducts } from "../hooks/useProducts";
import { CATEGORIES } from "../utils/constants";

const CategoryPage = () => {
  const { slug } = useParams();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const { products, loading } = useProducts({ category: slug });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

  return (
    <>
      <Box bg="brand.dark" py={{ base: 16, md: 24 }} px={4} textAlign="center">
        <VStack spacing={2}>
          <Text fontFamily="body" fontSize="xs" fontWeight={700} letterSpacing="0.3em" textTransform="uppercase" color="brand.sky">
            Categoría
          </Text>
          <Text fontFamily="heading" fontSize={{ base: "5xl", md: "6xl" }} color="brand.white" letterSpacing="0.03em">
            {cat?.label || slug}
          </Text>
        </VStack>
      </Box>

      <ProductGrid
        products={products}
        loading={loading}
        onProductClick={handleProductClick}
      />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isOpen}
          onClose={() => { onClose(); setSelectedProduct(null); }}
        />
      )}
    </>
  );
};

export default CategoryPage;
