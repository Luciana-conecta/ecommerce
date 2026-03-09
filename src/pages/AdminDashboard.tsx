import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, ShoppingCart, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price).replace('PYG', 'Gs.');
  };

  if (loading) return <div>Cargando estadísticas...</div>;

  const chartData = stats?.weeklySalesHistory || [
    { name: 'Lun', sales: 4000 },
    { name: 'Mar', sales: 3000 },
    { name: 'Mié', sales: 2000 },
    { name: 'Jue', sales: 2780 },
    { name: 'Vie', sales: 1890 },
    { name: 'Sáb', sales: 2390 },
    { name: 'Dom', sales: 3490 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <DollarSign size={24} />
            </div>
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              <TrendingUp size={12} /> +12.5%
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Ingresos Mensuales</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatPrice(stats.monthlyRevenue)}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
              <ShoppingCart size={24} />
            </div>
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              <TrendingUp size={12} /> +8.2%
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Pedidos Pendientes</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingOrders}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
              <Package size={24} />
            </div>
            <span className="text-red-500 text-xs font-bold flex items-center gap-1">
              <AlertTriangle size={12} /> Poco Stock
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Artículos con Poco Stock</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.lowStock}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              En Vivo
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Ventas Diarias</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatPrice(stats.dailySales)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black mb-8">Rendimiento de Ventas</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff'}}
                  itemStyle={{color: '#fff'}}
                  formatter={(value: any) => formatPrice(value)}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black mb-8">Actividad Reciente</h3>
          <div className="space-y-6">
            {stats.recentActivity?.map((activity: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{activity.description}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-blue-600">+{formatPrice(activity.amount)}</span>
              </div>
            )) || <p className="text-slate-500 text-center py-8">No hay actividad reciente.</p>}
          </div>
          <button className="w-full mt-8 text-sm font-bold text-blue-600 hover:underline">Ver Toda la Actividad</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
