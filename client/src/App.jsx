import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { EmpleadoFormPage } from "./pages/EmpleadoFormPage";
import { EmpleadoPage } from "./pages/EmpleadoPage";
import { DashboardPage } from "./pages/DashboardPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/empleado" element={<EmpleadoPage />} />
          <Route path="/empleado/:id" element={<EmpleadoFormPage />} />
          <Route path="/empleado-create" element={<EmpleadoFormPage />} />
        </Routes>
        <Toaster />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
