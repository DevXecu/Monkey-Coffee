export function TurnosPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turnos Laborales</h1>
          <p className="text-gray-600">Gestiona los turnos de trabajo de los empleados</p>
        </div>
      </div>

      {/* Content placeholder */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sin turnos configurados</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza configurando los turnos laborales.</p>
        </div>
      </div>
    </div>
  );
}

