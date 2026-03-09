import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Headphones, RotateCcw, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 4 }
    }
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get('/api/products?featured=true'),
          axios.get('/api/categories')
        ]);
        setFeaturedProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 aspect-[21/9] flex items-center group">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ 
              backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.4), transparent), url('https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1920')` 
            }}
          />
          <div className="relative z-10 px-8 md:px-16 max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-sm"
            >
              Centro de Nueva Generación
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6"
            >
              El Futuro de una <br/><span className="text-blue-600">Vida Sin Complicaciones.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-lg mb-8 max-w-lg"
            >
              Automatiza tu entorno con dispositivos impulsados por IA diseñados para el máximo confort y eficiencia energética.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/catalog" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:translate-y-[-2px]">
                Comprar Colección <ArrowRight size={20} />
              </Link>
              <Link to="/about" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-8 py-4 rounded-xl font-bold transition-all border border-white/20">
                Saber Más
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto w-full px-4 py-12 border-b border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <Truck size={32} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Envío Gratis</h4>
              <p className="text-xs text-slate-500">En pedidos superiores a Gs. 500.000</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Pago Seguro</h4>
              <p className="text-xs text-slate-500">Checkout 100% encriptado</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <Headphones size={32} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Soporte 24/7</h4>
              <p className="text-xs text-slate-500">Ayuda experta a tu disposición</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <RotateCcw size={32} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Devoluciones Fáciles</h4>
              <p className="text-xs text-slate-500">Garantía de devolución de 30 días</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto w-full px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Comprar por Categoría</h2>
            <p className="text-slate-500">Tecnología a medida para cada rincón de tu hogar.</p>
          </div>
          <Link to="/catalog" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
            Todas las Categorías <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/catalog?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-square bg-slate-200 cursor-pointer"
            >
              <img 
                src={cat.image_url} 
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-white font-bold text-xl">{cat.name}</h3>
                <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Explorar Colección</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black mb-4">Productos Destacados</h2>
              <p className="text-slate-500 max-w-lg">Nuestros dispositivos inteligentes más populares, seleccionados para tu estilo de vida moderno.</p>
            </div>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={scrollPrev}
                className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={scrollNext}
                className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
              >
                <ChevronRightIcon size={24} />
              </button>
            </div>
          </div>
          
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 py-12 max-w-7xl mx-auto w-full">
        <div className="bg-blue-600 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Mantente a la Vanguardia</h2>
            <p className="text-white/80 text-lg max-w-md">Suscríbete para acceso anticipado a lanzamientos, consejos tecnológicos y descuentos exclusivos.</p>
          </div>
          <div className="w-full max-w-md">
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Ingresa tu correo" 
                className="flex-1 rounded-xl px-4 py-4 border-none text-slate-900 focus:ring-0"
              />
              <button className="bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors">
                Unirse Ahora
              </button>
            </form>
            <p className="text-white/60 text-xs mt-4 text-center md:text-left">Al suscribirte, aceptas nuestra Política de Privacidad y Términos de Servicio.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
