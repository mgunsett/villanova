import { useState } from "react";
import { VStack, Input, Button } from "@chakra-ui/react";
import { registerUser } from "../../services/firebase/auth";
import toast from "react-hot-toast";

const RegisterForm = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      await registerUser(email, password, name);
      toast.success("Cuenta creada exitosamente");
      onSuccess?.();
    } catch {
      toast.error("Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4}>
      <Input
        placeholder="Nombre completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        px={4}
        py={3}
      />
      <Input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        px={4}
        py={3}
      />
      <Input
        placeholder="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        px={4}
        py={3}
      />
      <Button type="submit" variant="primary" w="100%" isLoading={loading} py={6}>
        Crear cuenta
      </Button>
    </VStack>
  );
};

export default RegisterForm;
