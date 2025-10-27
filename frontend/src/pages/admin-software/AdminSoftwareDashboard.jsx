import Layout from "../../components/common/Layout";

export default function AdminSoftwareDashboard() {
  return (
    <Layout title="Admin Software - Dashboard">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Panel de Administración de Software</h2>
        <p className="text-gray-600">Aquí puedes agregar vistas y herramientas propias del equipo de software.</p>

        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Esta es una página inicial. Añade widgets, métricas o enlaces según las necesidades.</p>
        </div>
      </div>
    </Layout>
  );
}
