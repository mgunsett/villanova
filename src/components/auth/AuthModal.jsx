import { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Tabs, TabList, Tab, TabPanels, TabPanel,
} from "@chakra-ui/react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthModal = ({ isOpen, onClose }) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="rgba(0,0,0,0.6)" backdropFilter="blur(8px)" />
      <ModalContent bg="brand.white" borderRadius="lg" mx={4}>
        <ModalHeader fontFamily="heading" fontSize="2xl" letterSpacing="0.05em" color="brand.dark" textAlign="center" pt={8}>
          Mi Cuenta
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={8}>
          <Tabs index={tabIndex} onChange={setTabIndex} variant="unstyled">
            <TabList justifyContent="center" gap={4} mb={6}>
              <Tab
                fontFamily="body" fontSize="xs" fontWeight={700}
                letterSpacing="wider" textTransform="uppercase"
                color={tabIndex === 0 ? "brand.ocean" : "brand.muted"}
                borderBottom="2px solid"
                borderColor={tabIndex === 0 ? "brand.ocean" : "transparent"}
                pb={2}
                _hover={{ color: "brand.ocean" }}
              >
                Iniciar sesión
              </Tab>
              <Tab
                fontFamily="body" fontSize="xs" fontWeight={700}
                letterSpacing="wider" textTransform="uppercase"
                color={tabIndex === 1 ? "brand.ocean" : "brand.muted"}
                borderBottom="2px solid"
                borderColor={tabIndex === 1 ? "brand.ocean" : "transparent"}
                pb={2}
                _hover={{ color: "brand.ocean" }}
              >
                Registrarse
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <LoginForm onSuccess={onClose} />
              </TabPanel>
              <TabPanel px={0}>
                <RegisterForm onSuccess={() => { setTabIndex(0); }} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
