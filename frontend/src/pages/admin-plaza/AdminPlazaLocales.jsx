import Layout from "../../components/common/Layout";
import { Store } from "lucide-react";

export default function AdminPlazaLocales() {
  return (
    <Layout title="Gestión de Locales">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Store className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Locales</h2>
        <p className="text-gray-600">Esta página está en desarrollo</p>
      </div>
    </Layout>
  );
}