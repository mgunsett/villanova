import { Routes, Route, Navigate } from "react-router-dom";
import { Box, Spinner, Flex } from "@chakra-ui/react";
import AdminLayout  from "../components/admin/AdminLayout";
import AdminStats   from "../components/admin/AdminStats";
import ProductList  from "../components/admin/ProductList";
import ProductForm  from "../components/admin/ProductForm";
import { OrderDetail } from "../components/admin/OrderDetail";
import OrderList    from "../components/admin/OrderList";
import StockManager from "../components/admin/StockManager";
import MovementList from "../components/admin/MovementList";
import { useAuth }  from "../context/AuthContext";

// Guard de rol admin
const AdminGuard = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return (
    <Flex h="100vh" align="center" justify="center" bg="brand.light">
      <Spinner size="lg" color="brand.ocean" thickness="2px" speed="0.7s" />
    </Flex>
  );
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AdminPage = () => (
  <AdminGuard>
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index                  element={<AdminStats />}   />
        <Route path="productos"       element={<ProductList />}  />
        <Route path="productos/nuevo" element={<ProductForm />}  />
        <Route path="productos/:productId" element={<ProductForm />} />
        <Route path="ordenes"         element={<OrderList />}    />
        <Route path="ordenes/:orderId"element={<OrderDetail />}  />
        <Route path="stock"           element={<StockManager />} />
        <Route path="movimientos"     element={<MovementList />} />
        <Route path="*"               element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  </AdminGuard>
);

export default AdminPage;