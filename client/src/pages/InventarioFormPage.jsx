import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { inventarioAPI } from "../api/inventario.api";
import { toast } from "react-hot-toast";
import { ActivityLogger } from "../utils/activityLogger";

export function InventarioFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const [productoActual, setProductoActual] = useState(null);

  const categorias = [
    { value: "cafe", label: "Café" },
    { value: "insumos", label: "Insumos" },
    { value: "equipamiento", label: "Equipamiento" },
    { value: "desechables", label: "Desechables" },
    { value: "alimentos", label: "Alimentos" },
    { value: "bebidas", label: "Bebidas" },
    { value: "limpieza", label: "Limpieza" },
    { value: "otros", label: "Otros" }
  ];

  const unidadesMedida = [
    { value: "unidad", label: "Unidad" },
    { value: "kilogramo", label: "Kilogramo" },
    { value: "litro", label: "Litro" },
    { value: "gramo", label: "Gramo" },
    { value: "mililitro", label: "Mililitro" },
    { value: "paquete", label: "Paquete" },
    { value: "caja", label: "Caja" },
    { value: "bolsa", label: "Bolsa" }
  ];

  const estados = [
    { value: "disponible", label: "Disponible" },
    { value: "agotado", label: "Agotado" },
    { value: "por_vencer", label: "Por vencer" },
    { value: "vencido", label: "Vencido" },
    { value: "en_pedido", label: "En pedido" },
    { value: "descontinuado", label: "Descontinuado" }
  ];

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Convertir campos numéricos
      const formData = {
        ...data,
        cantidad_actual: parseFloat(data.cantidad_actual) || 0,
        cantidad_minima: parseFloat(data.cantidad_minima),
        cantidad_maxima: data.cantidad_maxima ? parseFloat(data.cantidad_maxima) : null,
        precio_unitario: data.precio_unitario ? parseFloat(data.precio_unitario) : null,
        precio_venta: data.precio_venta ? parseFloat(data.precio_venta) : null,
        requiere_alerta: data.requiere_alerta || false,
        activo: data.activo !== false,
        fecha_vencimiento: data.fecha_vencimiento || null,
        fecha_ultimo_ingreso: data.fecha_ultimo_ingreso || null,
      };

      if (params.id) {
        await inventarioAPI.update(params.id, formData);
        ActivityLogger.productoUpdated(data.nombre_producto);
        toast.success("Producto actualizado correctamente", {
          position: "bottom-right",
        });
      } else {
        await inventarioAPI.create(formData);
        ActivityLogger.productoCreated(data.nombre_producto);
        toast.success("Producto creado correctamente", {
          position: "bottom-right",
        });
      }
      navigate("/inventario");
    } catch (error) {
      console.error("Error saving inventario:", error);
      toast.error("Error al guardar producto", {
        position: "bottom-right",
      });
    }
  });

  useEffect(() => {
    async function loadInventario() {
      if (params.id) {
        try {
          const data = await inventarioAPI.getById(params.id);
          setProductoActual(data);
          setValue("codigo_producto", data.codigo_producto);
          setValue("nombre_producto", data.nombre_producto);
          setValue("descripcion", data.descripcion || "");
          setValue("categoria", data.categoria);
          setValue("unidad_medida", data.unidad_medida);
          setValue("cantidad_actual", data.cantidad_actual);
          setValue("cantidad_minima", data.cantidad_minima);
          setValue("cantidad_maxima", data.cantidad_maxima || "");
          setValue("precio_unitario", data.precio_unitario || "");
          setValue("precio_venta", data.precio_venta || "");
          setValue("codigo_qr", data.codigo_qr || "");
          setValue("codigo_barra", data.codigo_barra || "");
          setValue("ubicacion", data.ubicacion || "");
          setValue("proveedor", data.proveedor || "");
          setValue("contacto_proveedor", data.contacto_proveedor || "");
          setValue("fecha_ultimo_ingreso", data.fecha_ultimo_ingreso ? data.fecha_ultimo_ingreso.split('T')[0] : "");
          setValue("fecha_vencimiento", data.fecha_vencimiento || "");
          setValue("lote", data.lote || "");
          setValue("estado", data.estado);
          setValue("requiere_alerta", data.requiere_alerta);
          setValue("imagen_producto", data.imagen_producto || "");
          setValue("notas", data.notas || "");
          setValue("activo", data.activo);
        } catch (error) {
          console.error("Error loading inventario:", error);
          toast.error("Error al cargar producto", {
            position: "bottom-right",
          });
        }
      }
    }
    loadInventario();
  }, [params.id, setValue]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {params.id ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
        <p className="text-gray-600">
          {params.id ? 'Modifica la información del producto' : 'Agrega un nuevo producto al inventario'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
          </div>

          {/* Código Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código Producto *
            </label>
            <input
              type="text"
              placeholder="PROD-001"
              {...register("codigo_producto", { required: "El código del producto es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.codigo_producto ? 'border-red-300' : 'border-gray-300'
              }`}
              autoFocus
            />
            {errors.codigo_producto && (
              <p className="mt-1 text-sm text-red-600">{errors.codigo_producto.message}</p>
            )}
          </div>

          {/* Nombre Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Producto *
            </label>
            <input
              type="text"
              placeholder="Café Americano"
              {...register("nombre_producto", { required: "El nombre del producto es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.nombre_producto ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.nombre_producto && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre_producto.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              {...register("categoria", { required: "La categoría es requerida" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.categoria ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.value} value={categoria.value}>
                  {categoria.label}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              {...register("estado", { required: "El estado es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.estado ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un estado</option>
              {estados.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
            {errors.estado && (
              <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              rows={3}
              placeholder="Descripción del producto..."
              {...register("descripcion")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Stock y Medidas */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Stock y Medidas</h3>
          </div>

          {/* Cantidad Actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad Actual *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("cantidad_actual", { 
                required: "La cantidad actual es requerida",
                min: { value: 0, message: "La cantidad debe ser mayor o igual a 0" }
              })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.cantidad_actual ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.cantidad_actual && (
              <p className="mt-1 text-sm text-red-600">{errors.cantidad_actual.message}</p>
            )}
          </div>

          {/* Unidad de Medida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad de Medida *
            </label>
            <select
              {...register("unidad_medida", { required: "La unidad de medida es requerida" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.unidad_medida ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione una unidad</option>
              {unidadesMedida.map((unidad) => (
                <option key={unidad.value} value={unidad.value}>
                  {unidad.label}
                </option>
              ))}
            </select>
            {errors.unidad_medida && (
              <p className="mt-1 text-sm text-red-600">{errors.unidad_medida.message}</p>
            )}
          </div>

          {/* Cantidad Mínima */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad Mínima *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="5.00"
              {...register("cantidad_minima", { 
                required: "La cantidad mínima es requerida",
                min: { value: 0, message: "La cantidad debe ser mayor o igual a 0" }
              })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.cantidad_minima ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.cantidad_minima && (
              <p className="mt-1 text-sm text-red-600">{errors.cantidad_minima.message}</p>
            )}
          </div>

          {/* Cantidad Máxima */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad Máxima
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="100.00"
              {...register("cantidad_maxima", {
                min: { value: 0, message: "La cantidad debe ser mayor o igual a 0" }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.cantidad_maxima && (
              <p className="mt-1 text-sm text-red-600">{errors.cantidad_maxima.message}</p>
            )}
          </div>

          {/* Precios */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Precios</h3>
          </div>

          {/* Precio Unitario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Unitario (€)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("precio_unitario", {
                min: { value: 0, message: "El precio debe ser mayor o igual a 0" }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.precio_unitario && (
              <p className="mt-1 text-sm text-red-600">{errors.precio_unitario.message}</p>
            )}
          </div>

          {/* Precio Venta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Venta (€)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("precio_venta", {
                min: { value: 0, message: "El precio debe ser mayor o igual a 0" }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.precio_venta && (
              <p className="mt-1 text-sm text-red-600">{errors.precio_venta.message}</p>
            )}
          </div>

          {/* Códigos y Ubicación */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Códigos y Ubicación</h3>
          </div>

          {/* Código QR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código QR
            </label>
            <input
              type="text"
              placeholder="QR-123456"
              {...register("codigo_qr")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Código de Barras */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Barras
            </label>
            <input
              type="text"
              placeholder="1234567890123"
              {...register("codigo_barra")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              placeholder="Estante A-1"
              {...register("ubicacion")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Imagen Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Imagen
            </label>
            <input
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              {...register("imagen_producto")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Proveedor */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Proveedor</h3>
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor
            </label>
            <input
              type="text"
              placeholder="Café del Sur S.A."
              {...register("proveedor")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Contacto Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contacto Proveedor
            </label>
            <input
              type="text"
              placeholder="+56 9 1234 5678"
              {...register("contacto_proveedor")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Fechas */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fechas</h3>
          </div>

          {/* Fecha Último Ingreso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Último Ingreso
            </label>
            <input
              type="datetime-local"
              {...register("fecha_ultimo_ingreso")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Fecha Vencimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Vencimiento
            </label>
            <input
              type="date"
              {...register("fecha_vencimiento")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Lote */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lote
            </label>
            <input
              type="text"
              placeholder="LOTE-2024-001"
              {...register("lote")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Notas */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              rows={3}
              placeholder="Notas adicionales sobre el producto..."
              {...register("notas")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Opciones */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Opciones</h3>
          </div>

          {/* Requiere Alerta */}
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("requiere_alerta")}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Requiere alerta de stock bajo
              </label>
            </div>
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
                Producto activo
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/inventario")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancelar
          </button>
          
          <div className="flex space-x-3">
            {params.id && (
              <button
                type="button"
                onClick={async () => {
                  const accepted = window.confirm("¿Estás seguro de que quieres eliminar este producto?");
                  if (accepted) {
                    try {
                      await inventarioAPI.delete(params.id);
                      if (productoActual) {
                        ActivityLogger.productoDeleted(productoActual.nombre_producto);
                      }
                      toast.success("Producto eliminado correctamente", {
                        position: "bottom-right",
                      });
                      navigate("/inventario");
                    } catch (error) {
                      toast.error("Error al eliminar producto", {
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
              {params.id ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
