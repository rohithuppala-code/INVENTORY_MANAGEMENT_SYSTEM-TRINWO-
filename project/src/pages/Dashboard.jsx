import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Users, 
  Truck, 
  AlertTriangle, 
  DollarSign, 
  Activity,
  TrendingUp,
  TrendingDown,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const { 
    dashboardStats, 
    fetchDashboardStats, 
    fetchLowStockProducts, 
    fetchRecentActivities 
  } = useInventory();
  
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await fetchDashboardStats();
        const lowStock = await fetchLowStockProducts();
        const activities = await fetchRecentActivities();
        
        setLowStockProducts(lowStock || []);
        setRecentActivities(activities || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const stats = [
    {
      name: 'Total Products',
      value: dashboardStats.totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Categories',
      value: dashboardStats.totalCategories || 0,
      icon: Activity,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Low Stock Items',
      value: dashboardStats.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      name: 'Total Value',
      value: `$${(dashboardStats.totalValue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Recent Movements',
      value: dashboardStats.recentMovements || 0,
      icon: Activity,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  const getMovementIcon = (type) => {
    switch (type) {
      case 'stock_in':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'stock_out':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'adjustment':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen min-w-screen w-screen h-screen flex flex-col">
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: 'url(https://plus.unsplash.com/premium_photo-1681426710520-7c56c9f563d2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW52ZW50b3J5JTIwbWFuYWdlbWVudHxlbnwwfHwwfHx8MA%3D%3D)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>
      <div className="flex-1 flex flex-col p-0 w-full h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 text-white relative overflow-hidden w-full">
          <div className="absolute inset-0 bg-inventory bg-cover bg-center opacity-20"></div>
          <div className="relative z-10 w-full">
            <h1 className="text-4xl font-bold">Dashboard Overview</h1>
            <p className="text-blue-100 mt-2">Monitor your inventory performance and key metrics</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className={`${stat.bgColor} backdrop-blur-xl rounded-lg p-4 border border-white/10 animate-fadeIn card-hover w-full`}>
                <div className="flex items-center">
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-black">{stat.name}</p>
                    <p className={`text-xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full mt-4">
          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Low Stock Alert</h2>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <div className="p-4">
              {lowStockProducts.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs">No low stock items</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-2 bg-red-50 rounded-md border border-red-100">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-red-600">
                          {product.quantity} left
                        </p>
                        <p className="text-xs text-gray-500">
                          Min: {product.lowStockThreshold}
                        </p>
                      </div>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <div className="text-center pt-2">
                      <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                        View all {lowStockProducts.length} items
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <div className="p-4">
              {recentActivities.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs">No recent activities</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivities.filter(activity => activity.product && activity.product.name).slice(0, 5).map((activity) => (
                    <div key={activity._id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                      <div className="flex-shrink-0">
                        {getMovementIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900">
                          {activity.product?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.type.replace('_', ' ').toUpperCase()} • {activity.reason}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-900">
                          {activity.type === 'stock_out' ? '-' : '+'}{activity.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length > 5 && (
                    <div className="text-center pt-2">
                      <button 
                        onClick={() => navigate('/stock-movements')}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium flex items-center justify-center space-x-1 px-3 py-1 rounded transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View all activities</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;