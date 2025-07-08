import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Eye,
  X
} from 'lucide-react';

const Products = () => {
  const { user } = useAuth();
  const { 
    products, 
    categories, 
    fetchProducts, 
    fetchCategories, 
    createProduct,
    updateProduct,
    deleteProduct,
    loading 
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    quantity: '',
    lowStockThreshold: '',
    unitPrice: '',
    location: '',
    barcode: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Add polling to keep data in sync when chnages done in db
  useEffect(() => {
    // Don't poll when modal is open to avoid interfering with form input
    if (showModal) return;

    const interval = setInterval(() => {
      fetchProducts();
      fetchCategories();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [fetchProducts, fetchCategories, showModal]);

  const handleSearch = () => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterCategory) params.category = filterCategory;
    if (showLowStock) params.lowStock = 'true';
    fetchProducts(params);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, filterCategory, showLowStock]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = editingProduct
      ? await updateProduct(editingProduct._id, formData)
      : await createProduct(formData);

    if (result.success) {
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } else {
      alert(result.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      category: product.category._id,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
      unitPrice: product.unitPrice,
      location: product.location || '',
      barcode: product.barcode || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(id);
      if (result.success) {
        fetchProducts();
      } else {
        alert(result.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      quantity: '',
      lowStockThreshold: '',
      unitPrice: '',
      location: '',
      barcode: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingProduct(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen min-w-screen w-screen h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col space-y-6 p-0 w-full h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-600 rounded-xl p-6 text-white relative overflow-hidden w-full">
          <div className="absolute inset-0 bg-warehouse bg-cover bg-center opacity-10"></div>
          <div className="relative z-10 flex items-center justify-between w-full">
            <div>
              <h1 className="text-4xl font-bold">Products</h1>
              <p className="text-purple-100 mt-2">Manage your product inventory</p>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={openCreateModal}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Low Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-lg font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </div>
                          </div>
                          {product.isLowStock && (
                            <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isLowStock
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setViewingProduct(product)}
                            className="bg-gray-100 rounded-lg p-2 text-purple-600 hover:text-purple-900 hover:bg-gray-200 transition duration-200"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {user?.role === 'admin' && (
                            <>
                              <button
                                onClick={() => handleEdit(product)}
                                className="bg-gray-100 rounded-lg p-2 text-indigo-600 hover:text-indigo-900 hover:bg-gray-200 transition duration-200"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="bg-gray-100 rounded-lg p-2 text-red-600 hover:text-red-900 hover:bg-gray-200 transition duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-100 rounded-lg p-2 text-gray-400 hover:bg-red-100 transition duration-200"
                >
                  <X className="h-6 w-6 text-red-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value === '' ? '' : parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 bg-gray-100 text-black"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    />
                  </div>
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
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200"
                  >
                    {editingProduct ? 'Update' : 'Create'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Product Modal */}
        {viewingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Product Details</h2>
                <button
                  onClick={() => setViewingProduct(null)}
                  className="bg-gray-100 rounded-lg p-2 text-gray-400 hover:bg-red-100 transition duration-200"
                >
                  <X className="h-6 w-6 text-red-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <div className="text-lg font-medium text-gray-900">{viewingProduct.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <div className="text-lg font-medium text-gray-900">{viewingProduct.sku}</div>
                  </div>
                </div>

                {viewingProduct.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <div className="text-lg font-medium text-gray-900">{viewingProduct.description}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <div className="text-lg font-medium text-gray-900">{viewingProduct.category?.name}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Stock</label>
                    <div className={`text-lg font-medium ${
                      viewingProduct.isLowStock ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {viewingProduct.quantity} units
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                    <div className="text-lg font-medium text-gray-900">{viewingProduct.lowStockThreshold}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                    <div className="text-lg font-medium text-gray-900">${viewingProduct.unitPrice.toFixed(2)}</div>
                  </div>
                </div>

                {(viewingProduct.location || viewingProduct.barcode) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingProduct.location && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <div className="text-lg font-medium text-gray-900">{viewingProduct.location}</div>
                      </div>
                    )}
                    {viewingProduct.barcode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Barcode</label>
                        <div className="text-lg font-medium text-gray-900">{viewingProduct.barcode}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <div className="text-lg font-medium text-gray-900">
                        {new Date(viewingProduct.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                      <div className="text-lg font-medium text-gray-900">
                        {new Date(viewingProduct.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;