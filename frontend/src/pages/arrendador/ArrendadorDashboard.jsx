import { Store } from "lucide-react";

export function ArrendadorDashboard() {
  return (
    <Layout title="Mi Dashboard">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Store className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mi Dashboard</h2>
        <p className="text-gray-600">Esta página está en desarrollo</p>
      </div>
    </Layout>
  );
}