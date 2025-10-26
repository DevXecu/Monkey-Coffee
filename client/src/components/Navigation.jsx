import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <div className="flex justify-between py-3 items-center">
      <Link to="/empleado">
        <h1 className="font-bold text-3xl mb-4">Empleado App</h1>
      </Link>
      <button className="bg-primary-500 p-3 rounded-lg">
        <Link to="/empleado-create">Crear Empleado</Link>
      </button>
    </div>
  );
}
