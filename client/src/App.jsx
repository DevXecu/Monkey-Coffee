import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Layout } from "./components/Layout";
import { EmpleadoFormPage } from "./pages/EmpleadoFormPage";
import { EmpleadoPage } from "./pages/EmpleadoPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InventarioPage } from "./pages/InventarioPage";
import { InventarioFormPage } from "./pages/InventarioFormPage";
import { ProductosPage } from "./pages/ProductosPage";
import { AsistenciaPage } from "./pages/AsistenciaPage";
import { ReportesPage } from "./pages/ReportesPage";
import { ConfiguracionPage } from "./pages/ConfiguracionPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          {/* redirect to dashboard */}
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="empleado" element={<EmpleadoPage />} />
          <Route path="empleado/:id" element={<EmpleadoFormPage />} />
          <Route path="empleado-create" element={<EmpleadoFormPage />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="asistencia" element={<AsistenciaPage />} />
          <Route path="inventario" element={<InventarioPage />} />
          <Route path="inventario/:id" element={<InventarioFormPage />} />
          <Route path="inventario-create" element={<InventarioFormPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
