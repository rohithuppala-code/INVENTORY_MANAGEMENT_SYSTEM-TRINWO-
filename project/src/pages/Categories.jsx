import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  X
} from 'lucide-react';

const Categories = () => {
  const { user } = useAuth();
  const { 
    categories, 
    fetchCategories, 
    createCategory,
    updateCategory,
    deleteCategory,
    loading 
  } = useInventory();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add polling to keep data in sync with database changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCategories();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingCategory) {
      const result = await updateCategory(editingCategory._id, formData);
      if (result.success) {
        setShowModal(false);
        setEditingCategory(null);
        resetForm();
      } else {
        alert(result.message);
      }
    } else {
      const result = await createCategory(formData);
      if (result.success) {
        setShowModal(false);
        setEditingCategory(null);
        resetForm();
      } else {
        alert(result.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingCategory(category);
    setShowModal(true);
  };
// TO DELETE WHOLE CATEGORY
  const handleDelete = async (categoryId) => {
    if (window.confirm('⚠️ WARNING: Are you sure you want to delete this category? This will also delete ALL products associated with this category. This action cannot be undone.')) {
      const result = await deleteCategory(categoryId);
      
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen min-w-screen w-screen h-screen flex flex-col space-y-6 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 text-white relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-logistics bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 flex items-center justify-between w-full">
          <div>
            <h1 className="text-4xl font-bold">Categories</h1>
            <p className="text-green-100 mt-2">Organize your products by category</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={openCreateModal}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Tag className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  {category.description && (
                    <p className="text-lg text-gray-600">{category.description}</p>
                  )}
                  <div className="mt-4 text-xs text-gray-500">
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => openEditModal(category)}
                      className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 text-blue-600 hover:text-blue-800 transition duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(category._id)}
                      className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 text-red-600 hover:text-red-800 transition duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-100 rounded-lg p-2 text-gray-400 hover:bg-red-100 transition duration-200"
              >
                <X className="h-6 w-6 text-red-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-100 text-black"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-100 text-black"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;