import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Truck, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Checkout: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    paymentMethod: 'bancard',
  });

  const shippingCost = subtotal > 500000 ? 0 : 25000;
  const total = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post('/api/orders', {
        items: cart,
        total_amount: total,
        subtotal: subtotal,
        shipping_cost: shippingCost,
        payment_method: formData.paymentMethod,
        shipping_address: formData.address,
        shipping_city: formData.city,
        contact_phone: formData.phone,
        contact_email: formData.email
      });
      setOrderSuccess(response.data);
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price).replace('PYG', 'Gs.');
  };

  if (orderSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600">
          <CheckCircle2 size={64} />
        </div>
        <h1 className="text-4xl font-black mb-4">¡Pedido Confirmado!</h1>
        <p className="text-slate-500 text-lg mb-2">Gracias por tu compra, {user?.name || 'Cliente'}.</p>
        <p className="text-slate-900 font-bold mb-8">Número de Pedido: {orderSuccess.order_number}</p>
        <div className="bg-slate-50 rounded-2xl p-8 mb-10 text-left">
          <h3 className="font-bold mb-4">¿Qué sigue?</h3>
          <ul className="space-y-4 text-sm text-slate-600">
            <li className="flex gap-3">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div>
              <span>Recibirás un correo de confirmación con los detalles de tu pedido en breve.</span>
            </li>
            <li className="flex gap-3">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div>
              <span>Nuestro equipo preparará tus dispositivos para el envío en un plazo de 24 horas.</span>
            </li>
            <li className="flex gap-3">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</div>
              <span>Puedes seguir el estado de tu pedido en el panel de tu cuenta.</span>
            </li>
          </ul>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-4xl font-black tracking-tight">Pago</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Truck className="text-blue-600" /> Información de Envío
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Correo Electrónico</label>
                    <input 
                      type="email" name="email" required value={formData.email} onChange={handleInputChange}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Número de Teléfono</label>
                    <input 
                      type="tel" name="phone" required value={formData.phone} onChange={handleInputChange}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">Dirección de Entrega</label>
                    <input 
                      type="text" name="address" required value={formData.address} onChange={handleInputChange}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Ciudad</label>
                    <input 
                      type="text" name="city" required value={formData.city} onChange={handleInputChange}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <CreditCard className="text-blue-600" /> Método de Pago
                </h2>
                <div className="space-y-4">
                  <label className={`flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'bancard' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="paymentMethod" value="bancard" checked={formData.paymentMethod === 'bancard'} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
                      <div>
                        <p className="font-bold">Bancard (Tarjeta de Crédito/Débito)</p>
                        <p className="text-xs text-slate-500">Pago seguro a través de la pasarela de Bancard</p>
                      </div>
                    </div>
                    <div className="flex gap-2 grayscale opacity-50">
                      <span className="font-black italic text-sm">VISA</span>
                      <span className="font-black italic text-sm">Mastercard</span>
                    </div>
                  </label>
                  <label className={`flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'transfer' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="paymentMethod" value="transfer" checked={formData.paymentMethod === 'transfer'} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
                      <div>
                        <p className="font-bold">Transferencia Bancaria</p>
                        <p className="text-xs text-slate-500">Depósito directo a nuestra cuenta bancaria</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {isProcessing ? 'Procesando...' : step === 1 ? 'Continuar al Pago' : `Pagar ${formatPrice(total)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
            <h3 className="text-xl font-black mb-6">Tu Pedido</h3>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                    <img src={item.main_image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">Cant: {item.quantity}</p>
                    <p className="text-sm font-bold text-blue-600 mt-1">{formatPrice((item.discount_price || item.price) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Envío</span>
                <span className={shippingCost === 0 ? 'text-emerald-600 font-bold' : ''}>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-3">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 text-slate-500">
              <ShieldCheck size={20} className="text-blue-600" />
              <p className="text-[10px] leading-tight uppercase tracking-widest font-bold">Tus datos están protegidos por encriptación SSL de 256 bits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
