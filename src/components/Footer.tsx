import React from 'react';
import { Link } from 'react-router-dom';
import { Bolt, Twitter, Instagram, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-600 p-1 rounded text-white">
                <Bolt size={20} />
              </div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Voltix<span className="text-blue-600">Home</span>
              </h1>
            </div>
            <p className="max-w-xs mb-8 text-slate-400">
              Redefiniendo la vida moderna a través de tecnología inteligente accesible y de alto rendimiento.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                <Facebook size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Comprar</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/catalog" className="hover:text-blue-500 transition-colors">Todos los Productos</Link></li>
              <li><Link to="/catalog?category=iluminacion-inteligente" className="hover:text-blue-500 transition-colors">Iluminación Inteligente</Link></li>
              <li><Link to="/catalog?category=electrodomesticos" className="hover:text-blue-500 transition-colors">Electrodomésticos</Link></li>
              <li><Link to="/catalog?category=audio-hogar" className="hover:text-blue-500 transition-colors">Audio para el Hogar</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Soporte</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/faq" className="hover:text-blue-500 transition-colors">Guía de Instalación</Link></li>
              <li><Link to="/policy/returns" className="hover:text-blue-500 transition-colors">Política de Devoluciones</Link></li>
              <li><Link to="/policy/shipping" className="hover:text-blue-500 transition-colors">Información de Envío</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Contáctanos</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Empresa</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-blue-500 transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/careers" className="hover:text-blue-500 transition-colors">Carreras</Link></li>
              <li><Link to="/press" className="hover:text-blue-500 transition-colors">Kit de Prensa</Link></li>
              <li><Link to="/terms" className="hover:text-blue-500 transition-colors">Términos de Servicio</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} Voltix Home Technologies Inc. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white">Política de Privacidad</Link>
            <Link to="/terms" className="hover:text-white">Términos de Servicio</Link>
            <Link to="/cookies" className="hover:text-white">Configuración de Cookies</Link>
          </div>
          <div className="flex gap-4 items-center grayscale opacity-50">
            <span className="font-bold">VISA</span>
            <span className="font-bold">MASTERCARD</span>
            <span className="font-bold">BANCARD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
