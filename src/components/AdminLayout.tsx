import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, ShoppingBag, Users, Settings, LogOut, Bolt, ChevronRight, Store, Tags } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Resumen', path: '/admin' },
    { icon: <Box size={20} />, label: 'Productos', path: '/admin/products' },
    { icon: <Tags size={20} />, label: 'Categorías', path: '/admin/categories' },
    { icon: <ShoppingBag size={20} />, label: 'Pedidos', path: '/admin/orders' },
    { icon: <Users size={20} />, label: 'Clientes', path: '/admin/customers' },
    { icon: <Settings size={20} />, label: 'Configuración', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2 text-white">
          <Bolt className="text-blue-500" size={24} />
          <span className="font-black text-xl tracking-tight">Voltix<span className="text-blue-500">Admin</span></span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                ? 'bg-blue-600 text-white font-bold' 
                : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link 
            to="/"
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-white/5 hover:text-white transition-all"
          >
            <Store size={20} />
            <span>Ver Tienda</span>
          </Link>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 font-bold capitalize">{location.pathname.split('/').pop() || 'Resumen'}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">Usuario Admin</p>
              <p className="text-xs text-slate-500">Súper Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              AV
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
