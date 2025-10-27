import Layout from "../../components/common/Layout";
import { DollarSign } from "lucide-react";

export default function AdminPlazaPagos() {
  return (
    <Layout title="Gestión de Pagos">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <DollarSign className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Pagos</h2>
        <p className="text-gray-600">Esta página está en desarrollo</p>
      </div>
    </Layout>
  );
}