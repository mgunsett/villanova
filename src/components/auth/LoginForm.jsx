import { useState } from "react";
import { VStack, Input, Button, Text } from "@chakra-ui/react";
import { loginUser } from "../../services/firebase/auth";
import toast from "react-hot-toast";

const LoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(email, password);
      toast.success("Sesión iniciada");
      onSuccess?.();
    } catch {
      toast.error("Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4}>
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
        Iniciar sesión
      </Button>
    </VStack>
  );
};

export default LoginForm;
