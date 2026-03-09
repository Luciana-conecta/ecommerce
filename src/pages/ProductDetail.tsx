import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Product, CartItem } from '../types';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Heart, Shield, Truck, RotateCcw, ChevronRight, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${slug}`);
        setProduct(response.data);
        setActiveImage(response.data.images?.[0]?.url || 'https://picsum.photos/seed/voltix/800/800');
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Cargando producto...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Producto no encontrado.</div>;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price).replace('PYG', 'Gs.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-blue-600">Inicio</Link>
        <ChevronRight size={14} />
        <Link to="/catalog" className="hover:text-blue-600">Tienda</Link>
        <ChevronRight size={14} />
        <Link to={`/catalog?category=${product.category?.slug}`} className="hover:text-blue-600">{product.category?.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images?.map((img) => (
              <button 
                key={img.id}
                onClick={() => setActiveImage(img.url)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img.url ? 'border-blue-600' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img.url} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">{product.brand}</span>
            <h1 className="text-4xl font-black tracking-tight mt-2 mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < Math.floor(product.rating) ? 'fill-current' : ''} />
                ))}
                <span className="text-slate-900 font-bold ml-1">{product.rating}</span>
              </div>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 text-sm">{product.review_count} Opiniones de Clientes</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl font-black text-blue-600">
                {formatPrice(product.discount_price || product.price)}
              </span>
              {product.discount_price && (
                <span className="text-xl text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="text-slate-600 leading-relaxed">{product.short_description}</p>
          </div>

          {/* Variants Placeholder */}
          <div className="space-y-6 mb-8">
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-3">Disponibilidad</h4>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${product.stock_quantity > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{product.stock_quantity > 0 ? `En Stock (${product.stock_quantity} unidades)` : 'Agotado'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex items-center border border-slate-200 rounded-xl px-4 py-2 bg-slate-50">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:text-blue-600 transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 hover:text-blue-600 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <button 
              onClick={() => addToCart(product, quantity)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20"
            >
              <ShoppingCart size={20} />
              Agregar al Carrito
            </button>
            <button className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Heart size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-blue-600" />
              <span className="text-xs font-medium">2 Años de Garantía</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-blue-600" />
              <span className="text-xs font-medium">Entrega Rápida</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={20} className="text-blue-600" />
              <span className="text-xs font-medium">30 Días de Devolución</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Tabs */}
      <div className="border-t border-slate-200 pt-12">
        <div className="flex gap-8 border-b border-slate-100 mb-8">
          <button className="pb-4 border-b-2 border-blue-600 font-bold text-blue-600">Descripción</button>
          <button className="pb-4 text-slate-400 font-medium hover:text-slate-600">Especificaciones</button>
          <button className="pb-4 text-slate-400 font-medium hover:text-slate-600">Opiniones ({product.review_count})</button>
        </div>
        <div className="max-w-3xl">
          <p className="text-slate-600 leading-relaxed mb-6">
            {product.long_description || product.short_description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">SKU</span>
              <span className="font-medium text-sm">{product.sku}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Marca</span>
              <span className="font-medium text-sm">{product.brand}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Categoría</span>
              <span className="font-medium text-sm">{product.category?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Voltaje</span>
              <span className="font-medium text-sm">220V</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
