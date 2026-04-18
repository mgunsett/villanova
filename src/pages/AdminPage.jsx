// ═══════════════════════════════════════════════
// src/pages/AdminPage.jsx
// ═══════════════════════════════════════════════
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


// ═══════════════════════════════════════════════
// NOTAS DE INSTALACIÓN para Villanova Admin
// ═══════════════════════════════════════════════

/*
1. RECHARTS — necesario para el gráfico de ventas en AdminStats:
   npm install recharts

2. ImageUploader — el import de VStack en ImageUploader.jsx debe estar
   junto al resto de imports de Chakra. El archivo ProductList.jsx tiene
   ImageUploader embebido; extraelo a su propio archivo si lo preferís:
   src/components/admin/ImageUploader.jsx

3. RUTAS en AppRouter — agregar la ruta del admin:
   <Route path="/admin/*" element={<AdminPage />} />
   
   La ruta /admin/ordenes/:orderId usa el componente OrderDetail
   que está exportado desde ProductForm-OrderDetail.jsx.
   Podés separar los archivos en sus rutas definitivas:
   
   src/components/admin/
     AdminLayout.jsx       ← ya separado
     AdminStats.jsx        ← ya separado
     MovementList.jsx      ← ya separado
     OrderList.jsx         ← extraer de OrderList-StockManager.jsx
     StockManager.jsx      ← extraer de OrderList-StockManager.jsx
     ProductForm.jsx       ← extraer de ProductForm-OrderDetail.jsx
     OrderDetail.jsx       ← extraer de ProductForm-OrderDetail.jsx
     ProductList.jsx       ← ya separado
     ImageUploader.jsx     ← extraer de ProductList.jsx

4. CONSTANTS — verificar que SIZES esté definido como array de strings
   o de objetos { key, label }. El ProductForm y StockManager normalizan
   ambos formatos. Ejemplo esperado en constants.js:
   
   export const SIZES = ["XS", "S", "M", "L", "XL"];
   // o bien:
   export const SIZES = [
     { key: "XS", label: "XS" },
     { key: "S",  label: "S"  },
     ...
   ];

5. ORDER_STATUS en constants.js debe tener esta forma:
   export const ORDER_STATUS = {
     pending:          { label: "Pendiente",    color: "yellow" },
     approved:         { label: "Aprobado",     color: "green"  },
     transfer_pending: { label: "Transferencia",color: "blue"   },
     shipped:          { label: "Enviado",      color: "purple" },
     cancelled:        { label: "Cancelado",    color: "red"    },
   };

6. VITE_WHATSAPP_NUMBER — agregar al .env para el botón de contacto
   en OrderDetail:
   VITE_WHATSAPP_NUMBER=5491112345678

7. useAuth — el hook debe exponer { isAdmin, loading }:
   const isAdmin = profile?.role === "admin";
*/
