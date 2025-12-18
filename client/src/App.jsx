import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import { SmartRedirect } from "./components/SmartRedirect";
import { LoginPage } from "./pages/LoginPage";
import { Layout } from "./components/Layout";
import { EmpleadoFormPage } from "./pages/EmpleadoFormPage";
import { EmpleadoPage } from "./pages/EmpleadoPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InventarioPage } from "./pages/InventarioPage";
import { InventarioFormPage } from "./pages/InventarioFormPage";
import { TurnosPage } from "./pages/TurnosPage";
import { TurnosFormPage } from "./pages/TurnosFormPage";
import { AsistenciaPage } from "./pages/AsistenciaPage";
import { AsistenciaFormPage } from "./pages/AsistenciaFormPage";
import { SolicitudesPage } from "./pages/SolicitudesPage";
import { SolicitudesFormPage } from "./pages/SolicitudesFormPage";
import { ReportesPage } from "./pages/ReportesPage";
import { ConfiguracionPage } from "./pages/ConfiguracionPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProveedorPage } from "./pages/ProveedorPage";
import { ProveedorFormPage } from "./pages/ProveedorFormPage";
import { OrdenCompraPage } from "./pages/OrdenCompraPage";
import { OrdenCompraFormPage } from "./pages/OrdenCompraFormPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública de login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas protegidas - Requieren autenticación */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }
          >
            {/* redirect inteligente según permisos */}
            <Route index element={<SmartRedirect />} />
            <Route 
              path="dashboard" 
              element={
                <RoleProtectedRoute requiredRoute="/dashboard">
                  <DashboardPage />
                </RoleProtectedRoute>
              } 
            />
            <Route path="empleado" element={<EmpleadoPage />} />
            <Route path="empleado/:id" element={<EmpleadoFormPage />} />
            <Route path="empleado-create" element={<EmpleadoFormPage />} />
            <Route path="turnos" element={<TurnosPage />} />
            <Route path="turnos/:id" element={<TurnosFormPage />} />
            <Route path="turnos-create" element={<TurnosFormPage />} />
            <Route path="asistencia" element={<AsistenciaPage />} />
            <Route path="asistencia/:id" element={<AsistenciaFormPage />} />
            <Route path="asistencia-create" element={<AsistenciaFormPage />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="inventario/:id" element={<InventarioFormPage />} />
            <Route path="inventario-create" element={<InventarioFormPage />} />
            <Route path="solicitudes" element={<SolicitudesPage />} />
            <Route path="solicitudes/:id" element={<SolicitudesFormPage />} />
            <Route path="solicitudes-create" element={<SolicitudesFormPage />} />
            <Route path="proveedores" element={<ProveedorPage />} />
            <Route path="proveedores/:id" element={<ProveedorFormPage />} />
            <Route path="proveedores-create" element={<ProveedorFormPage />} />
            <Route path="ordenes-compra" element={<OrdenCompraPage />} />
            <Route path="ordenes-compra/:id" element={<OrdenCompraFormPage />} />
            <Route path="ordenes-compra-create" element={<OrdenCompraFormPage />} />
            <Route 
              path="reportes" 
              element={
                <RoleProtectedRoute requiredRoute="/reportes">
                  <ReportesPage />
                </RoleProtectedRoute>
              } 
            />
            <Route path="configuracion" element={<ConfiguracionPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Ruta catch-all: redirige a login si no está autenticado, o a dashboard si está autenticado */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
