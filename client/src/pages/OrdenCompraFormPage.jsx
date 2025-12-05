import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ordenesCompraAPI, proveedoresAPI } from "../api/proveedores.api";
import { inventarioAPI } from "../api/inventario.api";
import { toast } from "react-hot-toast";

export function OrdenCompraFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [ordenActual, setOrdenActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([]);

  const estados = [
    { value: "borrador", label: "Borrador" },
    { value: "pendiente", label: "Pendiente" },
    { value: "enviada", label: "Enviada" },
    { value: "confirmada", label: "Confirmada" },
    { value: "en_transito", label: "En Tránsito" },
    { value: "recibida", label: "Recibida" },
    { value: "parcialmente_recibida", label: "Parcialmente Recibida" },
    { value: "cancelada", label: "Cancelada" },
    { value: "facturada", label: "Facturada" }
  ];

  useEffect(() => {
    loadProveedores();
    loadProductos();
    if (params.id) {
      loadOrden();
    } else {
      // Generar número de orden automático para nuevas órdenes
      const numeroOrden = `OC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setValue('numero_orden', numeroOrden);
      setValue('fecha_orden', new Date().toISOString().split('T')[0]);
      setValue('estado', 'borrador');
      setValue('moneda', 'CLP');
      
      // Verificar si hay parámetros de producto en la URL (desde inventario)
      const productoParam = searchParams.get('producto');
      if (productoParam) {
        try {
          const productoData = JSON.parse(productoParam);
          prellenarDesdeInventario(productoData);
        } catch (error) {
          console.error("Error parseando datos del producto:", error);
        }
      }
    }
  }, [params.id, searchParams, setValue]);

  const prellenarDesdeInventario = async (productoData) => {
    try {
      // Establecer el proveedor si se encontró
      if (productoData.proveedorId) {
        setValue('proveedor', productoData.proveedorId);
      }

      // Calcular cantidad sugerida si no viene
      let cantidadSugerida = productoData.cantidad;
      if (!cantidadSugerida && productoData.cantidadMinima !== undefined) {
        cantidadSugerida = Math.max(
          productoData.cantidadMinima - (productoData.cantidadActual || 0),
          productoData.cantidadMinima
        );
      }
      if (!cantidadSugerida) {
        cantidadSugerida = 1;
      }

      // Agregar el producto como item de la orden
      const nuevoItem = {
        id: Date.now(),
        producto: productoData.productoId || null,
        codigo_producto: productoData.codigoProducto || '',
        nombre_producto: productoData.nombreProducto || '',
        cantidad: cantidadSugerida,
        precio_unitario: productoData.precioUnitario || 0,
        descuento: 0,
        unidad_medida: productoData.unidadMedida || 'unidad',
        precio_total: cantidadSugerida * (productoData.precioUnitario || 0)
      };

      setItems([nuevoItem]);
      
      const mensaje = productoData.proveedorNombre 
        ? `Producto "${productoData.nombreProducto}" agregado con proveedor "${productoData.proveedorNombre}"`
        : `Producto "${productoData.nombreProducto}" agregado. Por favor selecciona un proveedor.`;
      
      toast.success(mensaje, {
        duration: 4000
      });
    } catch (error) {
      console.error("Error prellenando desde inventario:", error);
      toast.error("Error al cargar los datos del producto");
    }
  };

  const loadProveedores = async () => {
    try {
      const data = await proveedoresAPI.getActivos();
      setProveedores(data);
    } catch (error) {
      console.error("Error loading proveedores:", error);
    }
  };

  const loadProductos = async () => {
    try {
      const data = await inventarioAPI.getAll();
      setProductos(data);
    } catch (error) {
      console.error("Error loading productos:", error);
    }
  };

  const loadOrden = async () => {
    try {
      const data = await ordenesCompraAPI.getById(params.id);
      setOrdenActual(data);
      setItems(data.items || []);
      
      Object.keys(data).forEach((key) => {
        if (key !== 'items' && data[key] !== null && data[key] !== undefined) {
          setValue(key, data[key]);
        }
      });
    } catch (error) {
      console.error("Error loading orden:", error);
      toast.error("Error al cargar la orden");
    }
  };

  const agregarItem = () => {
    setItems([...items, {
      id: Date.now(),
      producto: null,
      codigo_producto: '',
      nombre_producto: '',
      cantidad: 1,
      precio_unitario: 0,
      descuento: 0,
      unidad_medida: 'unidad'
    }]);
  };

  const eliminarItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const actualizarItem = (index, field, value) => {
    const nuevosItems = [...items];
    nuevosItems[index][field] = value;
    
    // Si se selecciona un producto, llenar automáticamente
    if (field === 'producto' && value) {
      const producto = productos.find(p => p.id === parseInt(value));
      if (producto) {
        nuevosItems[index].codigo_producto = producto.codigo_producto;
        nuevosItems[index].nombre_producto = producto.nombre_producto;
        nuevosItems[index].precio_unitario = producto.precio_unitario || 0;
        nuevosItems[index].unidad_medida = producto.unidad_medida || 'unidad';
      }
    }
    
    // Calcular precio total
    if (field === 'cantidad' || field === 'precio_unitario' || field === 'descuento') {
      const item = nuevosItems[index];
      nuevosItems[index].precio_total = (item.cantidad * item.precio_unitario) - item.descuento;
    }
    
    setItems(nuevosItems);
  };

  const calcularTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + ((item.cantidad || 0) * (item.precio_unitario || 0) - (item.descuento || 0)), 0);
    const descuento = parseFloat(watch('descuento') || 0);
    const impuestos = parseFloat(watch('impuestos') || 0);
    return subtotal - descuento + impuestos;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      
      if (items.length === 0) {
        toast.error("Debes agregar al menos un item a la orden");
        return;
      }

      const formData = {
        ...data,
        items: items.map(item => ({
          producto: item.producto || null,
          codigo_producto: item.codigo_producto || '',
          nombre_producto: item.nombre_producto || '',
          cantidad: parseInt(item.cantidad) || 0,
          precio_unitario: parseInt(item.precio_unitario) || 0,
          descuento: parseInt(item.descuento) || 0,
          unidad_medida: item.unidad_medida || 'unidad',
          descripcion: item.descripcion || ''
        })),
        subtotal: items.reduce((sum, item) => sum + ((item.cantidad || 0) * (item.precio_unitario || 0)), 0),
        descuento: parseInt(data.descuento) || 0,
        impuestos: parseInt(data.impuestos) || 0,
        total: calcularTotal()
      };

      if (params.id) {
        await ordenesCompraAPI.update(params.id, formData);
        toast.success("Orden de compra actualizada correctamente");
      } else {
        await ordenesCompraAPI.create(formData);
        toast.success("Orden de compra creada correctamente");
      }
      navigate("/ordenes-compra");
    } catch (error) {
      console.error("Error saving orden:", error);
      toast.error("Error al guardar la orden de compra");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {params.id ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
            </h1>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Orden <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("numero_orden", { required: "El número de orden es requerido" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("proveedor", { required: "El proveedor es requerido" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Orden <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("fecha_orden", { required: "La fecha es requerida" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Entrega Esperada
                  </label>
                  <input
                    type="date"
                    {...register("fecha_entrega_esperada")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    {...register("estado")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {estados.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moneda
                  </label>
                  <select
                    {...register("moneda")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="CLP">CLP - Peso Chileno</option>
                    <option value="USD">USD - Dólar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Items de la Orden</h2>
                <button
                  type="button"
                  onClick={agregarItem}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  Agregar Item
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay items agregados. Haz clic en "Agregar Item" para comenzar.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                          <select
                            value={item.producto || ''}
                            onChange={(e) => actualizarItem(index, 'producto', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Seleccionar producto</option>
                            {productos.map((prod) => (
                              <option key={prod.id} value={prod.id}>
                                {prod.nombre_producto} ({prod.codigo_producto})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Producto</label>
                          <input
                            type="text"
                            value={item.nombre_producto || ''}
                            onChange={(e) => actualizarItem(index, 'nombre_producto', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                          <input
                            type="number"
                            value={item.cantidad || ''}
                            onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            min="1"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unit.</label>
                          <input
                            type="number"
                            value={item.precio_unitario || ''}
                            onChange={(e) => actualizarItem(index, 'precio_unitario', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            min="0"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-2 flex items-end gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold">
                              ${((item.cantidad || 0) * (item.precio_unitario || 0) - (item.descuento || 0)).toLocaleString('es-CL')}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Totales</h2>
              <div className="max-w-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    ${items.reduce((sum, item) => sum + ((item.cantidad || 0) * (item.precio_unitario || 0)), 0).toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Descuento:</span>
                  <input
                    type="number"
                    {...register("descuento")}
                    defaultValue={0}
                    className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Impuestos:</span>
                  <input
                    type="number"
                    {...register("impuestos")}
                    defaultValue={0}
                    className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                  />
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary-600">${calcularTotal().toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Adicional</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condiciones de Pago</label>
                  <input
                    type="text"
                    {...register("condiciones_pago")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Envío</label>
                  <input
                    type="text"
                    {...register("metodo_envio")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega</label>
                  <textarea
                    {...register("direccion_entrega")}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    {...register("notas")}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/ordenes-compra")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : params.id ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

