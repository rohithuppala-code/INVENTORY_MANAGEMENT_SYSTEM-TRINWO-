import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  Activity, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Edit3,
  X,
  Package
} from 'lucide-react';

const StockMovements = () => {
  const { 
    products,
    stockMovements, 
    fetchProducts,
    fetchStockMovements, 
    adjustStock,
    loading 
  } = useInventory();

  const [showModal, setShowModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    type: 'stock_in',
    quantity: 0,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchStockMovements();
  }, []);

  // Add polling to keep data in sync with database changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts();
      fetchStockMovements();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [fetchProducts, fetchStockMovements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if stock_out would result in negative stock
    if (formData.type === 'stock_out') {
      const selectedProduct = products.find(p => p._id === formData.productId);
      if (selectedProduct && selectedProduct.quantity < formData.quantity) {
        setWarningMessage(`Stock adjustment not possible. Current stock: ${selectedProduct.quantity}, but trying to remove: ${formData.quantity}. Insufficient stock available.`);
        return;
      }
    }
    
    // Clear any previous warning
    setWarningMessage('');
    
    const result = await adjustStock(formData);

    if (result.success) {
      setShowModal(false);
      resetForm();
    } else {
      alert(result.message);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      type: 'stock_in',
      quantity: 0,
      reason: '',
      notes: ''
    });
  };

  const openCreateModal = () => {
    const validProducts = products.filter(product => product && product.name);
    if (validProducts.length === 0) {
      alert('No products available for stock adjustment. Please add products first.');
      return;
    }
    resetForm();
    setWarningMessage(''); // Clear any previous warnings
    setShowModal(true);
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'stock_in':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'stock_out':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'adjustment':
        return <Edit3 className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'stock_in':
        return 'bg-green-100 text-green-800';
      case 'stock_out':
        return 'bg-red-100 text-red-800';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen min-w-screen w-screen h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col space-y-6 p-0 w-full h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white relative overflow-hidden w-full">
          <div className="absolute inset-0 bg-warehouse bg-cover bg-center opacity-10"></div>
          <div className="relative z-10 flex items-center justify-between w-full">
            <div>
              <h1 className="text-4xl font-bold">Stock Movements</h1>
              <p className="text-indigo-100 mt-2">Track all inventory changes and adjustments</p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Adjust Stock</span>
            </button>
          </div>
        </div>
        {/* Stock Movements Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto w-full max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performed By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockMovements.filter(movement => movement.product && movement.product.name).map((movement) => (
                    <tr key={movement._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {movement.product?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {movement.product?.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getMovementIcon(movement.type)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementColor(movement.type)}`}>
                            {movement.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.type === 'stock_out' ? '-' : '+'}{movement.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.previousQuantity} → {movement.newQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={movement.reason}>
                          {movement.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(movement.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.performedBy?.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Stock Adjustment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Stock Adjustment</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setWarningMessage(''); // Clear warning when closing
                  }}
                  className="bg-gray-100 rounded-lg p-2 text-gray-400 hover:bg-red-100 transition duration-200"
                >
                  <X className="h-6 w-6 text-red-600" />
                </button>
              </div>
              {warningMessage && (
                <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4" role="alert">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Insufficient Stock</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        {warningMessage}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product *
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-black"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  >
                    <option value="">Select Product</option>
                    {products.filter(product => product && product.name).map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} (Current: {product.quantity || 0})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Movement Type *
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-black"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="stock_in">Stock In</option>
                    <option value="stock_out">Stock Out</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-black"
                    value={formData.quantity === 0 ? '' : formData.quantity}
                    onChange={e => {
                      let val = e.target.value;
                      // Remove leading zeros
                      val = val.replace(/^0+(?=\d)/, '');
                      setFormData({ ...formData, quantity: val === '' ? 0 : parseInt(val) || 0 });
                    }}
                  />
                  {formData.type === 'adjustment' && (
                    <p className="text-xs text-gray-500 mt-1">
                      For adjustments, enter the new total quantity
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., New shipment, Sale, Damaged goods, etc."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-black"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Additional notes (optional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-black"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-100 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-200 border border-gray-300 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Adjust Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMovements;