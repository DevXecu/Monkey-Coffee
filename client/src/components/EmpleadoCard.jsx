import { useNavigate } from "react-router-dom";

export function EmpleadoCard({ empleado }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-zinc-800 p-3 hover:bg-zinc-700 hover:cursor-pointer"
      onClick={() => {
        navigate(`/empleado/${empleado.id}`);
      }}
    >
      <h1 className="text-white font-bold uppercase rounded-lg">
        {empleado.nombre} {empleado.apellido}
      </h1>
      <p className="text-slate-400">RUT: {empleado.rut}</p>
      <p className="text-slate-400">{empleado.cargo}</p>
    </div>
  );
}