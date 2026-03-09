import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price).replace('PYG', 'Gs.');
  };

  const discount = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4">
        {discount > 0 ? (
          <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg shadow-red-500/20">
            Oferta -{discount}%
          </div>
        ) : null}
        {product.is_new ? (
          <div className={`absolute ${discount > 0 ? 'top-12' : 'top-4'} left-4 z-10 bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg shadow-blue-600/20`}>
            Nuevo
          </div>
        ) : null}
        
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.main_image || 'https://picsum.photos/seed/voltix/400/400'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </Link>

        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
            <Heart size={18} />
          </button>
          <Link to={`/product/${product.slug}`} className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
            <Eye size={18} />
          </Link>
        </div>

        <button 
          onClick={() => addToCart(product)}
          className="absolute bottom-4 left-4 right-4 bg-blue-600 text-white py-3 rounded-xl font-bold translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all shadow-xl flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Agregar al Carrito
        </button>
      </div>

      <Link to={`/product/${product.slug}`}>
        <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors truncate">
          {product.name}
        </h3>
      </Link>
      
      <div className="flex items-center gap-2 mb-2">
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              className={i < Math.floor(product.rating) ? 'fill-current' : ''} 
            />
          ))}
        </div>
        <span className="text-xs text-slate-500">({product.review_count})</span>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-blue-600 font-black text-xl">
          {formatPrice(product.discount_price || product.price)}
        </p>
        {product.discount_price && (
          <p className="text-slate-400 line-through text-sm">
            {formatPrice(product.price)}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
