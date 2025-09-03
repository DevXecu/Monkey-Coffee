import { useEffect, useState } from "react";
import { getAllEmpleado } from "../api/empleado.api";
import { EmpleadoCard } from "./EmpleadoCard";

export function EmpleadoList() {
  const [empleado, setEmpleado] = useState([]);

  useEffect(() => {
    async function loadEmpleado() {
      const res = await getAllEmpleado();
      setEmpleado(res.data);
    }
    loadEmpleado();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-3">
      {empleado.map((empleado) => (
        <EmpleadoCard key={empleado.id} empleado={empleado} />
      ))}
    </div>
  );
}
