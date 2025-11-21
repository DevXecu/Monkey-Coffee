import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública de login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas protegidas - TEMPORALMENTE DESACTIVADO PARA CREAR USUARIOS */}
          <Route
            path="/"
            element={
              // <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              // </ProtectedRoute>
            }
          >
            {/* redirect to dashboard */}
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
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
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
