import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Eye, ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronRight, User, Mail, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  shipping_address: string;
  shipping_city: string;
  contact_phone: string;
  contact_email: string;
  items?: any[];
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (id: number) => {
    try {
      const response = await axios.get(`/api/admin/orders/${id}`);
      setSelectedOrder(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await axios.put(`/api/admin/orders/${id}/status`, { status });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      alert('Error al actualizar el estado del pedido');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) || 
    o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price).replace('PYG', 'Gs.');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12} /> Pendiente</span>;
      case 'processing': return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Truck size={12} /> Procesando</span>;
      case 'shipped': return <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Truck size={12} /> Enviado</span>;
      case 'delivered': return <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12} /> Entregado</span>;
      case 'cancelled': return <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={12} /> Cancelado</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold w-fit">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Gestión de Pedidos</h1>
        <p className="text-slate-500 text-sm">Realiza el seguimiento y procesa los pedidos de los clientes.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por número de pedido o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-slate-200 rounded-xl pl-12 pr-4 py-2.5 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Cargando pedidos...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No se encontraron pedidos.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <ShoppingBag size={20} />
                        </div>
                        <p className="font-bold text-slate-900 font-mono">{order.order_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{order.customer_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatPrice(order.total_amount)}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => fetchOrderDetails(order.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Detalles del Pedido</h2>
                  <p className="text-sm font-mono text-slate-500">{selectedOrder.order_number}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Información del Cliente</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-600">
                        <User size={18} className="text-slate-400" />
                        <span className="font-bold">{selectedOrder.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Mail size={18} className="text-slate-400" />
                        <span>{selectedOrder.contact_email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Phone size={18} className="text-slate-400" />
                        <span>{selectedOrder.contact_phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Envío y Pago</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-slate-600">
                        <MapPin size={18} className="text-slate-400 mt-1" />
                        <span>{selectedOrder.shipping_address}, {selectedOrder.shipping_city}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="text-xs font-bold uppercase text-slate-400">Método de Pago:</span>
                        <span className="capitalize">{selectedOrder.payment_method.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Productos</h3>
                  <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Producto</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Cant.</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Precio</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedOrder.items?.map((item: any) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 font-bold text-slate-900">{item.product_name}</td>
                            <td className="px-6 py-4 text-center">{item.quantity}</td>
                            <td className="px-6 py-4 text-right">{formatPrice(item.price)}</td>
                            <td className="px-6 py-4 text-right font-bold">{formatPrice(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100/50">
                          <td colSpan={3} className="px-6 py-4 text-right font-bold text-slate-500">Total del Pedido</td>
                          <td className="px-6 py-4 text-right font-black text-blue-600 text-lg">{formatPrice(selectedOrder.total_amount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Cambiar Estado</h3>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedOrder.status === status 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {status.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
