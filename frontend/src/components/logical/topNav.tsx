import { useState } from 'react';
import { 
  Home,
  Calendar,
  TrendingUp,
  User,
  Settings,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import { Link, useRouterState } from '@tanstack/react-router';



export const TopNav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouterState();

  const navigationItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Training', icon: Calendar, path: '/training' },
    { name: 'Progress', icon: TrendingUp, path: '/progress' },
    { name: 'Log Book', icon: BookOpen, path: '/logbook' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link
              to="/"
              className="flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="text-xl font-bold text-blue-600">Rocket</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1
                    ${router.location.pathname === item.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white z-40 md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium
                  ${router.location.pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};