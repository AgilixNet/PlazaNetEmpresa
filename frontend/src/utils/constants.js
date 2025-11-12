// Roles del sistema - EXACTAMENTE como están en la BD
export const ROLES = {
  OWNER: 'Owner',           // ✅ Con mayúscula
  ADMIN_PLAZA: 'AdminPlaza', // ❌ En BD dice "AdminPlaza" sin guión bajo
  ADMIN_SOFTWARE: 'AdminSoftware', // Nuevo rol para el administrador de software
  ADMIN_PARQUEADERO: 'ParkingAdmin', // ❌ En BD dice "ParkingAdmin"
  ARRENDADOR: 'Arrendador'  // ✅ Con mayúscula
};

export const PLAZAS = {
  PALOQUEMAO: {
    nombre: 'Paloquemao',
    ciudad: 'Bogotá',
    ubicacion: 'Centro'
  },
  SIETE_AGOSTO: {
    nombre: '7 de Agosto',
    ciudad: 'Bogotá',
    ubicacion: 'Chapinero'
  },
  RESTREPO: {
    nombre: 'Restrepo',
    ciudad: 'Bogotá',
    ubicacion: 'Restrepo'
  }
};

// Estados de locales
export const ESTADOS_LOCAL = {
  DISPONIBLE: 'disponible',
  OCUPADO: 'ocupado',
  MANTENIMIENTO: 'mantenimiento'
};

// Estados de arrendamientos
export const ESTADOS_ARRENDAMIENTO = {
  ACTIVO: 'activo',
  VENCIDO: 'vencido',
  CANCELADO: 'cancelado'
};

// Estados de pagos
export const ESTADOS_PAGO = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  VENCIDO: 'vencido'
};

// Tipos de vehículos
export const TIPOS_VEHICULO = {
  CARRO: 'carro',
  MOTO: 'moto',
  BICICLETA: 'bicicleta'
};

// Permisos por rol
export const PERMISOS = {
  [ROLES.OWNER]: {
    perfiles: { ver: true, crear: true, editar: true, eliminar: true },
    locales: { ver: true, crear: true, editar: true, eliminar: true },
    arriendos: { ver: true, crear: true, editar: true, eliminar: true },
    pagos: { ver: true, crear: true, editar: true, eliminar: true },
    vehiculos: { ver: true, crear: true, editar: true, eliminar: true },
    reportes: true
  },
  [ROLES.ADMIN_PLAZA]: {
    perfiles: { ver: true, crear: true, editar: true, eliminar: true, restriccion: 'no_owner' },
    locales: { ver: true, crear: true, editar: true, eliminar: true },
    arriendos: { ver: true, crear: true, editar: true, eliminar: true },
    pagos: { ver: true, crear: true, editar: true, eliminar: true },
    vehiculos: { ver: true, crear: true, editar: true, eliminar: true },
    reportes: true
  },
  [ROLES.ADMIN_PARQUEADERO]: {
    perfiles: { ver: false, crear: false, editar: false, eliminar: false },
    locales: { ver: true, crear: false, editar: false, eliminar: false },
    arriendos: { ver: false, crear: false, editar: false, eliminar: false },
    pagos: { ver: false, crear: false, editar: false, eliminar: false },
    vehiculos: { ver: true, crear: true, editar: true, eliminar: true },
    reportes: false
  },
  [ROLES.ADMIN_SOFTWARE]: {
    perfiles: { ver: true, crear: true, editar: true, eliminar: true },
    locales: { ver: true, crear: false, editar: false, eliminar: false },
    arriendos: { ver: true, crear: false, editar: false, eliminar: false },
    pagos: { ver: true, crear: false, editar: false, eliminar: false },
    vehiculos: { ver: true, crear: false, editar: false, eliminar: false },
    reportes: true
  },
  [ROLES.ARRENDADOR]: {
    perfiles: { ver: false, crear: false, editar: false, eliminar: false },
    locales: { ver: 'propios', crear: false, editar: false, eliminar: false },
    arriendos: { ver: 'propios', crear: false, editar: false, eliminar: false },
    pagos: { ver: 'propios', crear: false, editar: false, eliminar: false },
    vehiculos: { ver: false, crear: false, editar: false, eliminar: false },
    reportes: false
  }
};

// Rutas por rol
export const RUTAS_POR_ROL = {
  [ROLES.OWNER]: '/owner/dashboard',
  [ROLES.ADMIN_PLAZA]: '/admin-plaza/dashboard',
  [ROLES.ADMIN_SOFTWARE]: '/admin-software/dashboard',
  [ROLES.ADMIN_PARQUEADERO]: '/admin-parqueadero/dashboard',
  [ROLES.ARRENDADOR]: '/arrendador/dashboard'
};

// Navegación por rol
export const NAVEGACION = {
  [ROLES.OWNER]: [
    { nombre: 'Dashboard', ruta: '/owner/dashboard', icono: 'LayoutDashboard' },
    { nombre: 'Usuarios', ruta: '/owner/usuarios', icono: 'Users' },
    { nombre: 'Locales', ruta: '/owner/locales', icono: 'Store' },
    { nombre: 'Arriendos', ruta: '/owner/arriendos', icono: 'FileText' },
    { nombre: 'Pagos', ruta: '/owner/pagos', icono: 'DollarSign' },
    { nombre: 'Parqueadero', ruta: '/owner/vehiculos', icono: 'Car' },
    { nombre: 'Reportes', ruta: '/owner/reportes', icono: 'BarChart3' }
  ],
  [ROLES.ADMIN_PLAZA]: [
    { nombre: 'Dashboard', ruta: '/admin-plaza/dashboard', icono: 'LayoutDashboard' },
    { nombre: 'Usuarios', ruta: '/admin-plaza/usuarios', icono: 'Users' },
    { nombre: 'Locales', ruta: '/admin-plaza/locales', icono: 'Store' },
    { nombre: 'Arriendos', ruta: '/admin-plaza/arriendos', icono: 'FileText' },
    { nombre: 'Pagos', ruta: '/admin-plaza/pagos', icono: 'DollarSign' },
    { nombre: 'Parqueadero', ruta: '/admin-plaza/vehiculos', icono: 'Car' },
    { nombre: 'Reportes', ruta: '/admin-plaza/reportes', icono: 'BarChart3' }
  ],
  [ROLES.ADMIN_PARQUEADERO]: [
    { nombre: 'Dashboard', ruta: '/admin-parqueadero/dashboard', icono: 'LayoutDashboard' },
    { nombre: 'Parqueadero', ruta: '/admin-parqueadero/vehiculos', icono: 'Car' }
  ],
  [ROLES.ADMIN_SOFTWARE]: [
    { nombre: 'Dashboard', ruta: '/admin-software/dashboard', icono: 'LayoutDashboard' },
    { nombre: 'Usuarios', ruta: '/admin-software/usuarios', icono: 'Users' },
    { nombre: 'Solicitudes', ruta: '/admin-software/solicitudes', icono: 'FileText' }
  ],
  [ROLES.ARRENDADOR]: [
    { nombre: 'Dashboard', ruta: '/arrendador/dashboard', icono: 'LayoutDashboard' },
    { nombre: 'Mis Locales', ruta: '/arrendador/locales', icono: 'Store' },
    { nombre: 'Mis Pagos', ruta: '/arrendador/pagos', icono: 'DollarSign' }
  ]
};