import { ProveedorList } from "../components/ProveedorList";

export function ProveedorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProveedorList />
      </div>
    </div>
  );
}

