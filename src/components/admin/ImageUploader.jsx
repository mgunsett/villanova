// ═══════════════════════════════════════════════
// src/components/admin/ImageUploader.jsx
// ═══════════════════════════════════════════════
import { useRef, useState } from "react";
import {
  Box, Flex, Text, Image, IconButton, SimpleGrid, Spinner, Progress,
} from "@chakra-ui/react";
import { Upload, X, Star } from "lucide-react";
import { uploadImage } from "../../services/firebase/storage";
import toast from "react-hot-toast";

const ImageUploader = ({ images = [], onChange, folder = "products" }) => {
  const inputRef              = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);

  const handleFiles = async (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!valid.length) return;

    setUploading(true);
    setProgress(0);
    try {
      const urls = [];
      for (let i = 0; i < valid.length; i++) {
        const file = valid[i];
        const path = `${folder}/${Date.now()}_${file.name}`;
        const url  = await uploadImage(file, path);
        urls.push(url);
        setProgress(Math.round(((i + 1) / valid.length) * 100));
      }
      onChange([...images, ...urls]);
      toast.success(`${urls.length} imagen${urls.length > 1 ? "es" : ""} subida${urls.length > 1 ? "s" : ""}`);
    } catch (err) {
      console.error("[ImageUploader] Error:", err);
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (index) => onChange(images.filter((_, i) => i !== index));

  const moveToMain = (index) => {
    if (index === 0) return;
    const arr = [...images];
    const [item] = arr.splice(index, 1);
    arr.unshift(item);
    onChange(arr);
    toast.success("Imagen principal actualizada");
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
          Imágenes
        </Text>
        <Text fontFamily="body" fontSize="xs" color="brand.muted">
          {images.length} foto{images.length !== 1 ? "s" : ""}
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={3} mb={3}>
        {images.map((url, i) => (
          <Box
            key={`${url}-${i}`}
            position="relative"
            borderRadius="lg"
            overflow="hidden"
            border="1.5px solid"
            borderColor={i === 0 ? "brand.ocean" : "brand.sand"}
            role="group"
            transition="border-color 0.2s"
            _hover={{ borderColor: "brand.sky" }}
          >
            <Image
              src={url}
              alt={`Imagen ${i + 1}`}
              w="100%"
              h="110px"
              objectFit="cover"
            />
            {/* Overlay */}
            <Box
              position="absolute"
              inset={0}
              bg="rgba(15,15,15,0.5)"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.2s"
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
            >
              {i !== 0 && (
                <IconButton
                  icon={<Star size={13} />}
                  size="xs"
                  bg="rgba(255,255,255,0.9)"
                  color="brand.ocean"
                  borderRadius="full"
                  onClick={() => moveToMain(i)}
                  aria-label="Hacer principal"
                  title="Hacer principal"
                  _hover={{ bg: "white" }}
                />
              )}
              <IconButton
                icon={<X size={13} />}
                size="xs"
                bg="rgba(239,68,68,0.9)"
                color="white"
                borderRadius="full"
                onClick={() => removeImage(i)}
                aria-label="Eliminar"
                _hover={{ bg: "brand.error" }}
              />
            </Box>
            {/* Badge principal */}
            {i === 0 && (
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bg="brand.ocean"
                py={0.5}
              >
                <Text fontFamily="body" fontSize="2xs" textAlign="center" color="white" letterSpacing="0.1em">
                  PRINCIPAL
                </Text>
              </Box>
            )}
          </Box>
        ))}

        {/* Drop zone */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="110px"
          border="1.5px dashed"
          borderColor={uploading ? "brand.ocean" : "brand.sand"}
          borderRadius="lg"
          cursor={uploading ? "not-allowed" : "pointer"}
          bg={uploading ? "rgba(21,101,192,0.04)" : "transparent"}
          _hover={!uploading ? { borderColor: "brand.ocean", bg: "rgba(21,101,192,0.03)" } : {}}
          transition="all 0.2s"
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!uploading) handleFiles(e.dataTransfer.files);
          }}
        >
          {uploading ? (
            <VStack spacing={2} px={3} w="100%">
              <Spinner size="sm" color="brand.ocean" thickness="2px" />
              <Progress
                value={progress}
                size="xs"
                w="80%"
                borderRadius="full"
                bg="brand.sand"
                sx={{ "& > div": { background: "var(--chakra-colors-brand-ocean)" } }}
              />
              <Text fontFamily="body" fontSize="2xs" color="brand.muted">{progress}%</Text>
            </VStack>
          ) : (
            <VStack spacing={1}>
              <Upload size={18} color="var(--chakra-colors-brand-muted)" strokeWidth={1.5} />
              <Text fontFamily="body" fontSize="2xs" color="brand.muted" textAlign="center" px={2}>
                Subir imagen
              </Text>
            </VStack>
          )}
        </Flex>
      </SimpleGrid>

      {images.length > 0 && (
        <Text fontFamily="body" fontSize="2xs" color="brand.muted">
          La primera imagen es la principal. Hover → ★ para cambiarla.
        </Text>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Box>
  );
};

// Necesitamos VStack en ImageUploader
import { VStack } from "@chakra-ui/react";

export default ImageUploader;