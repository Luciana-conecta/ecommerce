import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Package, Image as ImageIcon, X, Save, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category_id: number;
  category_name: string;
  price: number;
  stock_quantity: number;
  short_description: string;
  long_description: string;
  is_featured: boolean;
  is_new: boolean;
  tags?: string;
  images?: any[];
  main_image_url?: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/admin/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id: number) => {
    console.log('handleDelete called with ID:', id);
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    try {
      const response = await axios.delete(`/api/admin/products/${id}`);
      console.log('Delete response:', response.data);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto. Puede que esté vinculado a pedidos existentes.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct?.id) {
        await axios.put(`/api/admin/products/${editingProduct.id}`, editingProduct);
      } else {
        await axios.post('/api/admin/products', editingProduct);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      alert('Error al guardar el producto');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price).replace('PYG', 'Gs.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Gestión de Productos</h1>
          <p className="text-slate-500 text-sm">Administra tu inventario, precios y detalles.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct({ name: '', sku: '', brand: 'Voltix', price: 0, stock_quantity: 0, category_id: categories[0]?.id }); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nombre o SKU..."
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Cargando productos...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No se encontraron productos.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {product.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${product.stock_quantity < 10 ? 'text-red-500' : 'text-slate-900'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={async () => { 
                            const resp = await axios.get(`/api/products/${product.slug}`);
                            setEditingProduct(resp.data); 
                            setIsModalOpen(true); 
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">
                  {editingProduct?.id ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nombre del Producto</label>
                    <input 
                      type="text" required
                      value={editingProduct?.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">SKU</label>
                    <input 
                      type="text" required
                      value={editingProduct?.sku || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Marca</label>
                    <input 
                      type="text" required
                      value={editingProduct?.brand || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Categoría</label>
                    <select 
                      required
                      value={editingProduct?.category_id || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category_id: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Precio (Gs.)</label>
                    <input 
                      type="number" required
                      value={editingProduct?.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Stock</label>
                    <input 
                      type="number" required
                      value={editingProduct?.stock_quantity || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Descripción Corta</label>
                  <textarea 
                    rows={2}
                    value={editingProduct?.short_description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                    className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Descripción Larga</label>
                  <textarea 
                    rows={4}
                    value={editingProduct?.long_description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, long_description: e.target.value })}
                    className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Etiquetas (separadas por comas)</label>
                  <input 
                    type="text"
                    placeholder="ej: oferta, nuevo, inteligente"
                    value={editingProduct?.tags || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tags: e.target.value })}
                    className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Imágenes del Producto</h3>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <input 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload-input"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            try {
                              const base64Data = (reader.result as string).split(',')[1];
                              const form = new FormData();
                              form.append('key', import.meta.env.VITE_IMGBB_API_KEY || process.env.VITE_IMGBB_API_KEY || '');
                              form.append('image', base64Data);

                              const res = await fetch('https://api.imgbb.com/1/upload', {
                                method: 'POST',
                                body: form,
                              });

                              if (!res.ok) throw new Error('Error al subir imagen a imgbb');
                              const json = await res.json();
                              const url = json.data.url;
                              
                              if (editingProduct?.id) {
                                await axios.post(`/api/admin/products/${editingProduct.id}/images`, { url, is_main: false });
                                const resp = await axios.get(`/api/products/${editingProduct.slug}`);
                                setEditingProduct({ ...editingProduct, images: resp.data.images });
                              } else {
                                const newImg = { id: Date.now(), url, is_main: (editingProduct?.images?.length || 0) === 0 ? 1 : 0 };
                                setEditingProduct({
                                  ...editingProduct,
                                  main_image_url: newImg.is_main ? url : editingProduct?.main_image_url,
                                  images: [...(editingProduct?.images || []), newImg]
                                });
                              }
                            } catch (error) {
                              alert('Error al subir imagen al servidor');
                              console.error(error);
                            }
                            if (e.target) e.target.value = '';
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('image-upload-input')?.click()}
                        className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"
                      >
                        <ImageIcon size={16} /> Subir
                      </button>
                      
                      <div className="h-6 border-l border-slate-200 mx-1"></div>
                      
                      <input 
                        type="text"
                        placeholder="URL de imagen..."
                        id="new-image-url"
                        className="bg-slate-50 border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600/20"
                      />
                      <button 
                        type="button"
                        onClick={async () => {
                          const urlInput = document.getElementById('new-image-url') as HTMLInputElement;
                          if (!urlInput.value) return;
                          
                          if (editingProduct?.id) {
                            await axios.post(`/api/admin/products/${editingProduct.id}/images`, { url: urlInput.value, is_main: false });
                            const resp = await axios.get(`/api/products/${editingProduct.slug}`);
                            setEditingProduct({ ...editingProduct, images: resp.data.images });
                          } else {
                            const newImg = { id: Date.now(), url: urlInput.value, is_main: (editingProduct?.images?.length || 0) === 0 ? 1 : 0 };
                            setEditingProduct({
                              ...editingProduct,
                              main_image_url: newImg.is_main ? urlInput.value : editingProduct?.main_image_url,
                              images: [...(editingProduct?.images || []), newImg]
                            });
                          }
                          urlInput.value = '';
                        }}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold"
                      >
                        Añadir
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {(editingProduct as any)?.images?.map((img: any) => (
                      <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                        <img src={img.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={async () => {
                              if (editingProduct?.id) {
                                await axios.delete(`/api/admin/products/images/${img.id}`);
                                const resp = await axios.get(`/api/products/${editingProduct?.slug}`);
                                setEditingProduct({ ...editingProduct, images: resp.data.images });
                              } else {
                                const newImages = editingProduct?.images?.filter((i: any) => i.id !== img.id) || [];
                                const newMainUrl = newImages.find((i: any) => i.is_main === 1)?.url || (newImages.length > 0 ? newImages[0].url : undefined);
                                setEditingProduct({ 
                                  ...editingProduct, 
                                  images: newImages,
                                  main_image_url: newMainUrl
                                });
                              }
                            }}
                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                            title="Eliminar imagen"
                          >
                            <Trash2 size={14} />
                          </button>
                          {img.is_main === 0 && (
                             <button 
                             type="button"
                             onClick={async () => {
                               if (editingProduct?.id) {
                                 await axios.put(`/api/admin/products/images/${img.id}/main`, { product_id: editingProduct?.id });
                                 const resp = await axios.get(`/api/products/${editingProduct?.slug}`);
                                 setEditingProduct({ ...editingProduct, images: resp.data.images });
                               } else {
                                 const newImages = editingProduct?.images?.map((i: any) => ({ ...i, is_main: i.id === img.id ? 1 : 0 }));
                                 setEditingProduct({
                                   ...editingProduct,
                                   images: newImages,
                                   main_image_url: img.url
                                 });
                               }
                             }}
                             className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                             title="Establecer como principal"
                           >
                             <Star size={14} />
                           </button>
                          )}
                        </div>
                        {img.is_main === 1 && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full">
                            PRINCIPAL
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editingProduct?.is_featured || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                    />
                    <span className="text-sm font-bold text-slate-700">Destacado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editingProduct?.is_new || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_new: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                    />
                    <span className="text-sm font-bold text-slate-700">Nuevo</span>
                  </label>
                </div>
              </form>

              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Save size={20} /> Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
