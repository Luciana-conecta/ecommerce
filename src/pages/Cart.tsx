import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price).replace('PYG', 'Gs.');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-black mb-4">Tu carrito está vacío</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Parece que aún no has agregado ningún dispositivo inteligente a tu carrito. ¡Comienza a explorar nuestra colección!</p>
        <Link to="/catalog" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-blue-700 transition-all">
          Empezar a Comprar <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full">
      <h1 className="text-4xl font-black tracking-tight mb-10">Carrito de Compras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-6 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img src={item.main_image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link to={`/product/${item.slug}`} className="font-bold text-lg hover:text-blue-600 transition-colors">{item.name}</Link>
                    <p className="text-slate-500 text-sm mt-1">{item.brand}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1 bg-slate-50">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-blue-600"><Minus size={16} /></button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-blue-600"><Plus size={16} /></button>
                  </div>
                  <p className="font-black text-lg text-blue-600">
                    {formatPrice((item.discount_price || item.price) * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-3xl p-8 text-white sticky top-24">
            <h3 className="text-2xl font-black mb-8">Resumen del Pedido</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({totalItems} artículos)</span>
                <span className="text-white font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Envío</span>
                <span className="text-emerald-400 font-medium">Calculado en el siguiente paso</span>
              </div>
              <hr className="border-white/10" />
              <div className="flex justify-between text-xl font-black">
                <span>Total</span>
                <span className="text-blue-500">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
            >
              Proceder al Pago <ArrowRight size={20} />
            </button>
            
            <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
              <p className="text-xs text-slate-500 text-center uppercase tracking-widest font-bold">Pago Seguro Impulsado por Bancard</p>
              <div className="flex justify-center gap-4 grayscale opacity-50">
                <span className="font-black text-sm italic">VISA</span>
                <span className="font-black text-sm italic">Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
