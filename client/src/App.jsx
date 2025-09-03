import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { EmpleadoFormPage } from "./pages/EmpleadoFormPage";
import { EmpleadoPage } from "./pages/EmpleadoPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <div className="container mx-auto">
        <Navigation />
        <Routes>
          {/* redirect to empleado */}
          <Route path="/" element={<Navigate to="/empleado" />} />
          <Route path="/empleado" element={<EmpleadoPage />} />
          <Route path="/empleado/:id" element={<EmpleadoFormPage />} />
          <Route path="/empleado-create" element={<EmpleadoFormPage />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
