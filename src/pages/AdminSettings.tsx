import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save, Store, Mail, Globe, Truck, DollarSign, Bell, Shield } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    store_name: '',
    contact_email: '',
    currency: 'PYG',
    shipping_fee: '0',
    free_shipping_threshold: '0',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put('/api/admin/settings', settings);
      setMessage({ type: 'success', text: 'Configuraciones guardadas correctamente.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar las configuraciones.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando configuraciones...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Configuración del Sistema</h1>
        <p className="text-slate-500 text-sm">Administra los parámetros generales de tu tienda.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'} flex items-center gap-3 text-sm font-bold`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Store size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-900">Información de la Tienda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nombre de la Tienda</label>
              <input 
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email de Contacto</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Truck size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-900">Envíos y Pagos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Moneda</label>
              <select 
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="PYG">Guaraníes (Gs.)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Costo de Envío Estándar</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number"
                  value={settings.shipping_fee}
                  onChange={(e) => setSettings({ ...settings, shipping_fee: e.target.value })}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button 
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <Save size={20} /> {saving ? 'Guardando...' : 'Guardar Configuraciones'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
