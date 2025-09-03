import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createEmpleado, deleteEmpleado, getEmpleado, updateEmpleado } from "../api/empleado.api";
import { toast } from "react-hot-toast";

export function EmpleadoFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      await updateEmpleado(params.id, data);
      toast.success("Empleado updated", {
        position: "bottom-right",
        style: {
          background: "#101010",
          color: "#fff",
        },
      });
    } else {
      await createEmpleado(data);
      toast.success("New Empleado Added", {
        position: "bottom-right",
        style: {
          background: "#101010",
          color: "#fff",
        },
      });
    }

    navigate("/empleado");
  });

  useEffect(() => {
    async function loadEmpleado() {
      if (params.id) {
        const { data } = await getEmpleado(params.id);
        setValue("rut", data.rut);
        setValue("nombre", data.nombre);
        setValue("apellido", data.apellido);
        setValue("cargo", data.cargo);
        setValue("correo", data.correo);
        setValue("celular", data.celular);
        setValue("password", ""); // No cargar password por seguridad
        setValue("activo", data.activo);
      }
    }
    loadEmpleado();
  }, [params.id, setValue]);

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={onSubmit} className="bg-zinc-800 p-10 rounded-lg mt-2">
        <input
          type="text"
          placeholder="RUT"
          {...register("rut", { required: true })}
          className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
          autoFocus
        />
        {errors.rut && <span>This field is required</span>}

        <input
          type="text"
          placeholder="Nombre"
          {...register("nombre", { required: true })}
          className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
        />
        {errors.nombre && <span>This field is required</span>}

        <input
          type="text"
          placeholder="Apellido"
          {...register("apellido", { required: true })}
          className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
        />
        {errors.apellido && <span>This field is required</span>}

        <select
          {...register("cargo", { required: true })}
          className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
        >
          <option value="">Seleccione un cargo</option>
          <option value="Gerente">Gerente</option>
          <option value="Administrador">Administrador</option>
          <option value="Trabajador">Trabajador</option>
        </select>
        {errors.cargo && <span>This field is required</span>}

        <input
          type="email"
          placeholder="Correo"
          {...register("correo")}
          className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
        />

        <input
          type="text"
          placeholder="Celular"
          {...register("celular")}
          className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: !params.id })}
          className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
        />
        {errors.password && <span>This field is required</span>}

        <label className="flex items-center mb-3">
          <input
            type="checkbox"
            {...register("activo")}
            className="mr-2"
          />
          Activo
        </label>

        <button className="bg-indigo-500 p-3 rounded-lg block w-full mt-3">
          Save
        </button>
      </form>

      {params.id && (
        <div className="flex justify-end">
          <button
            className="bg-red-500 p-3 rounded-lg w-48 mt-3"
            onClick={async () => {
              const accepted = window.confirm("Are you sure?");
              if (accepted) {
                await deleteEmpleado(params.id);
                toast.success("Empleado Removed", {
                  position: "bottom-right",
                  style: {
                    background: "#101010",
                    color: "#fff",
                  },
                });
                navigate("/empleado");
              }
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}