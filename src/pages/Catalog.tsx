import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, LayoutGrid, List } from 'lucide-react';

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categorySlug = queryParams.get('category');
  const searchQuery = queryParams.get('search');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`/api/products${location.search}`),
          axios.get('/api/categories')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Filter size={20} /> Categorías
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => window.location.href = '/catalog'}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categorySlug ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  Todos los Productos
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => window.location.href = `/catalog?category=${cat.slug}`}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categorySlug === cat.slug ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Rango de Precios</h3>
              <div className="space-y-4">
                <input type="range" className="w-full accent-blue-600" min="0" max="5000000" step="100000" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Gs. 0</span>
                  <span>Gs. 5.000.000+</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 rounded-2xl p-6 text-white">
              <h4 className="font-bold mb-2">¿Necesitas Ayuda?</h4>
              <p className="text-xs text-blue-100 mb-4">Nuestros expertos están listos para ayudarte a encontrar el dispositivo perfecto.</p>
              <button className="w-full bg-white text-blue-600 py-2 rounded-lg text-sm font-bold">Chatea con Nosotros</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                {categorySlug ? categories.find(c => c.slug === categorySlug)?.name : 'Todos los Productos'}
              </h1>
              {searchQuery && (
                <p className="text-slate-500 mt-1">Mostrando resultados para "{searchQuery}"</p>
              )}
              <p className="text-slate-500 text-sm mt-1">{products.length} productos encontrados</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button className="p-1.5 bg-white shadow-sm rounded-md text-blue-600"><LayoutGrid size={18} /></button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600"><List size={18} /></button>
              </div>
              <button className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Ordenar por: Popularidad <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-slate-200 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-slate-400">No se encontraron productos.</h3>
              <p className="text-slate-500 mt-2">Intenta ajustar tus filtros o consulta de búsqueda.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
