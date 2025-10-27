import Layout from "../../components/common/Layout";
import { BarChart3 } from "lucide-react";

export default function OwnerReportes() {
  return (
    <Layout title="Reportes">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <BarChart3 className="h-16 w-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reportes y Estadísticas</h2>
        <p className="text-gray-600">Esta página está en desarrollo</p>
      </div>
    </Layout>
  );
}