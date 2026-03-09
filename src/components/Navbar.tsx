import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Bolt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Bolt size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Voltix<span className="text-blue-600">Home</span>
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/catalog" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Tienda</Link>
            <Link to="/catalog?category=iluminacion-inteligente" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Iluminación</Link>
            <Link to="/catalog?category=electrodomesticos" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Cocina</Link>
            <Link to="/about" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Nosotros</Link>
          </nav>

          {/* Search & Actions */}
          <div className="flex flex-1 items-center justify-end gap-4 max-w-md">
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Buscar dispositivos..."
                className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="flex items-center gap-2">
              <Link to="/cart" className="p-2 hover:bg-slate-100 rounded-lg relative transition-colors">
                <ShoppingCart size={20} className="text-slate-600" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="relative group">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
                    <User size={20} className="text-slate-600" />
                    <span className="hidden lg:block text-sm font-medium text-slate-700">{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Panel de Administración</Link>
                    )}
                    <Link to="/account" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Mi Cuenta</Link>
                    <Link to="/account/orders" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Historial de Pedidos</Link>
                    <hr className="my-2 border-slate-100" />
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Cerrar Sesión</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <User size={20} className="text-slate-600" />
                </Link>
              )}

              <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 space-y-4">
          <nav className="flex flex-col gap-4">
            <Link to="/catalog" className="text-sm font-semibold text-slate-600" onClick={() => setIsMenuOpen(false)}>Comprar Todo</Link>
            <Link to="/catalog?category=iluminacion-inteligente" className="text-sm font-semibold text-slate-600" onClick={() => setIsMenuOpen(false)}>Iluminación Inteligente</Link>
            <Link to="/catalog?category=electrodomesticos" className="text-sm font-semibold text-slate-600" onClick={() => setIsMenuOpen(false)}>Electrodomésticos</Link>
            <Link to="/about" className="text-sm font-semibold text-slate-600" onClick={() => setIsMenuOpen(false)}>Sobre Nosotros</Link>
          </nav>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar dispositivos..."
              className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      )}
    </header>
  );
};

export default Navbar;
