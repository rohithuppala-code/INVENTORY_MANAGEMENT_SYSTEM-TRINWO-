import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  BarChart3, 
  Users, 
  Truck, 
  Activity, 
  LogOut, 
  Menu, 
  X,
  User,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3, roles: ['admin', 'staff'] },
      { name: 'Products', href: '/products', icon: Package, roles: ['admin', 'staff'] },
      { name: 'Categories', href: '/categories', icon: Activity, roles: ['admin', 'staff'] },
      { name: 'Stock Movements', href: '/stock-movements', icon: Activity, roles: ['admin', 'staff'] }
  ];

    return baseItems.filter(item => item.roles.includes(user?.role));
  };

  const navigation = getNavigationItems();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-purple-100 w-full">
      <div className="px-2 sm:px-4 w-full">
        <div className="flex justify-between items-center h-16 sm:h-20 md:h-24">
          {/* Logo and brand */}
          <div className="flex items-center min-w-0">
            <div className="flex-shrink-0 flex items-center">
              <Package className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
              <span className="ml-2 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate max-w-[120px] sm:max-w-xs md:max-w-none">
                TRINWO SOLUTIONS
              </span>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-6 lg:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-base lg:text-lg font-medium transition-colors duration-200 whitespace-nowrap ${
                      location.pathname === item.href
                        ? 'border-purple-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-purple-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User menu */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-base lg:text-lg text-gray-700 truncate max-w-[80px] sm:max-w-xs md:max-w-none">{user?.name}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs sm:text-base font-medium ${getRoleColor(user?.role)}`}>
                  {user?.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm lg:text-base leading-5 font-semibold rounded-md text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full border-t border-gray-200 bg-gray-50">
          <div className="pt-2 pb-3 space-y-1 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center pl-3 pr-4 py-2 rounded-lg border-l-4 text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                    location.pathname === item.href
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-100 hover:border-purple-300 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 px-2">
            <div className="flex items-center px-2">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3 min-w-0">
                <div className="text-base font-medium text-gray-800 truncate max-w-[100px]">{user?.name}</div>
                <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition duration-200 rounded-lg"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;