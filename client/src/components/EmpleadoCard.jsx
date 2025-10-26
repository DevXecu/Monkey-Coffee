import { useNavigate } from "react-router-dom";

export function EmpleadoCard({ empleado }) {
  const navigate = useNavigate();

  const getCargoColor = (cargo) => {
    switch (cargo) {
      case 'Gerente':
        return 'bg-purple-100 text-purple-800';
      case 'Administrador':
        return 'bg-blue-100 text-blue-800';
      case 'Trabajador':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 cursor-pointer transition-all duration-200"
      onClick={() => {
        navigate(`/empleado/${empleado.id}`);
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-500 font-semibold text-sm">
                {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {empleado.nombre} {empleado.apellido}
              </h3>
              <p className="text-sm text-gray-500">RUT: {empleado.rut}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCargoColor(empleado.cargo)}`}>
              {empleado.cargo}
            </span>
            
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${empleado.activo ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-xs text-gray-500">
                {empleado.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          
          {empleado.correo && (
            <p className="text-sm text-gray-600 mt-2">
              📧 {empleado.correo}
            </p>
          )}
          
          {empleado.celular && (
            <p className="text-sm text-gray-600">
              📱 {empleado.celular}
            </p>
          )}
        </div>
        
        <div className="ml-4">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}