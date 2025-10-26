import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createEmpleado, deleteEmpleado, getEmpleado, updateEmpleado } from "../api/empleado.api";
import { toast } from "react-hot-toast";
import { ActivityLogger } from "../utils/activityLogger";

export function EmpleadoFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const [empleadoActual, setEmpleadoActual] = useState(null);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const nombreCompleto = `${data.nombre} ${data.apellido}`;
      
      // Si es actualización y password está vacío, no enviarlo
      if (params.id && (!data.password || data.password.trim() === "")) {
        const { password, ...dataWithoutPassword } = data;
        await updateEmpleado(params.id, dataWithoutPassword);
        ActivityLogger.empleadoUpdated(nombreCompleto);
        toast.success("Empleado actualizado correctamente", {
          position: "bottom-right",
        });
      } else if (params.id) {
        await updateEmpleado(params.id, data);
        ActivityLogger.empleadoUpdated(nombreCompleto);
        toast.success("Empleado actualizado correctamente", {
          position: "bottom-right",
        });
      } else {
        await createEmpleado(data);
        ActivityLogger.empleadoCreated(nombreCompleto);
        toast.success("Empleado creado correctamente", {
          position: "bottom-right",
        });
      }
      navigate("/empleado");
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar empleado", {
        position: "bottom-right",
      });
    }
  });

  useEffect(() => {
    async function loadEmpleado() {
      if (params.id) {
        try {
          const { data } = await getEmpleado(params.id);
          setEmpleadoActual(data);
          setValue("rut", data.rut);
          setValue("nombre", data.nombre);
          setValue("apellido", data.apellido);
          setValue("cargo", data.cargo);
          setValue("correo", data.correo);
          setValue("celular", data.celular);
          setValue("password", ""); // No cargar password por seguridad
          setValue("activo", data.activo);
        } catch (error) {
          toast.error("Error al cargar empleado", {
            position: "bottom-right",
          });
        }
      }
    }
    loadEmpleado();
  }, [params.id, setValue]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {params.id ? 'Editar Empleado' : 'Nuevo Empleado'}
        </h1>
        <p className="text-gray-600">
          {params.id ? 'Modifica la información del empleado' : 'Agrega un nuevo empleado al sistema'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RUT */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RUT *
            </label>
            <input
              type="text"
              placeholder="12.345.678-9"
              {...register("rut", { required: "El RUT es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.rut ? 'border-red-300' : 'border-gray-300'
              }`}
              autoFocus
            />
            {errors.rut && (
              <p className="mt-1 text-sm text-red-600">{errors.rut.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              placeholder="Juan"
              {...register("nombre", { required: "El nombre es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.nombre ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              placeholder="Pérez"
              {...register("apellido", { required: "El apellido es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.apellido ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.apellido && (
              <p className="mt-1 text-sm text-red-600">{errors.apellido.message}</p>
            )}
          </div>

          {/* Cargo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cargo *
            </label>
            <select
              {...register("cargo", { required: "El cargo es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.cargo ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un cargo</option>
              <option value="Gerente">Gerente</option>
              <option value="Administrador">Administrador</option>
              <option value="Trabajador">Trabajador</option>
            </select>
            {errors.cargo && (
              <p className="mt-1 text-sm text-red-600">{errors.cargo.message}</p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="juan.perez@monkeycoffee.com"
              {...register("correo")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Celular */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Celular
            </label>
            <input
              type="text"
              placeholder="+56 9 1234 5678"
              {...register("celular")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Password */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña {!params.id && '*'}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", { 
                required: !params.id ? "La contraseña es requerida" : false 
              })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            {params.id && (
              <p className="mt-1 text-sm text-gray-500">
                Deja en blanco para mantener la contraseña actual
              </p>
            )}
          </div>

          {/* Activo */}
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("activo")}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Empleado activo
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/empleado")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancelar
          </button>
          
          <div className="flex space-x-3">
            {params.id && (
              <button
                type="button"
                onClick={async () => {
                  const accepted = window.confirm("¿Estás seguro de que quieres eliminar este empleado?");
                  if (accepted) {
                    try {
                      await deleteEmpleado(params.id);
                      if (empleadoActual) {
                        ActivityLogger.empleadoDeleted(`${empleadoActual.nombre} ${empleadoActual.apellido}`);
                      }
                      toast.success("Empleado eliminado correctamente", {
                        position: "bottom-right",
                      });
                      navigate("/empleado");
                    } catch (error) {
                      toast.error("Error al eliminar empleado", {
                        position: "bottom-right",
                      });
                    }
                  }
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Eliminar
              </button>
            )}
            
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {params.id ? 'Actualizar' : 'Crear'} Empleado
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}