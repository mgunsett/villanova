import { useRef, useState } from "react";
import {
  Box, Flex, Text, Image, IconButton, SimpleGrid, Input, Spinner,
} from "@chakra-ui/react";
import { Upload, X, GripVertical } from "lucide-react";
import { uploadImage } from "../../services/firebase/storage";

const ImageUploader = ({ images = [], onChange, folder = "products" }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map((file) => {
          const path = `${folder}/${Date.now()}_${file.name}`;
          return uploadImage(file, path);
        })
      );
      onChange([...images, ...urls]);
    } catch (err) {
      console.error("[Admin] Error subiendo imágenes:", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Text fontSize="sm" fontWeight={600} mb={2} color="brand.dark">
        Imágenes del producto
      </Text>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={3}>
        {images.map((url, i) => (
          <Box
            key={i}
            position="relative"
            borderRadius="md"
            overflow="hidden"
            border="2px solid"
            borderColor="brand.sand"
            _hover={{ borderColor: "brand.ocean" }}
            transition="all 0.2s"
          >
            <Image src={url} alt={`Imagen ${i + 1}`} w="100%" h="120px" objectFit="cover" />
            <IconButton
              icon={<X size={14} />}
              size="xs"
              position="absolute"
              top={1}
              right={1}
              bg="brand.error"
              color="brand.white"
              borderRadius="full"
              _hover={{ bg: "red.600" }}
              onClick={() => removeImage(i)}
              aria-label="Eliminar imagen"
            />
            {i === 0 && (
              <Text
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bg="blackAlpha.700"
                color="white"
                fontSize="2xs"
                textAlign="center"
                py={0.5}
              >
                Principal
              </Text>
            )}
          </Box>
        ))}

        {/* Upload button */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="120px"
          border="2px dashed"
          borderColor="brand.sand"
          borderRadius="md"
          cursor="pointer"
          _hover={{ borderColor: "brand.ocean", bg: "brand.light" }}
          transition="all 0.2s"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Spinner size="sm" color="brand.ocean" />
          ) : (
            <>
              <Upload size={20} color="var(--chakra-colors-brand-muted)" />
              <Text fontSize="2xs" color="brand.muted" mt={1}>
                Subir imagen
              </Text>
            </>
          )}
        </Flex>
      </SimpleGrid>

      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        display="none"
        onChange={handleFiles}
      />
    </Box>
  );
};

export default ImageUploader;
