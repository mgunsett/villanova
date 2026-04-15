import { Spinner, Flex } from "@chakra-ui/react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin";
import AdminLayout from "../components/admin/AdminLayout";
import AdminStats from "../components/admin/AdminStats";
import ProductList from "../components/admin/ProductList";
import ProductForm from "../components/admin/ProductForm";
import OrderList from "../components/admin/OrderList";
import OrderDetail from "../components/admin/OrderDetail";
import StockManager from "../components/admin/StockManager";
import MovementList from "../components/admin/MovementList";

const AdminPage = () => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="brand.light">
        <Spinner size="lg" color="brand.ocean" thickness="3px" />
      </Flex>
    );
  }

  if (!isAdmin) return null;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminStats />} />
        <Route path="productos" element={<ProductList />} />
        <Route path="productos/nuevo" element={<ProductForm />} />
        <Route path="productos/:productId" element={<ProductForm />} />
        <Route path="ordenes" element={<OrderList />} />
        <Route path="ordenes/:orderId" element={<OrderDetail />} />
        <Route path="stock" element={<StockManager />} />
        <Route path="movimientos" element={<MovementList />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminPage;
