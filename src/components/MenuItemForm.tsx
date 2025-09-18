// _file: admin_dashboard/src/components/MenuItemForm.tsx_
import { useState, useEffect } from 'react';
import type { MenuItem, MenuItemFormData, DailySpecial } from '../types';
import apiClient from '../api/axiosConfig';

interface MenuItemFormProps {
  itemToEdit: MenuItem | DailySpecial | null;
  onClose: () => void;
  onSuccess: () => void;
  isSpecial?: boolean;
}

function MenuItemForm({ itemToEdit, onClose, onSuccess, isSpecial = false }: MenuItemFormProps) {
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: '',
    image: null,
    is_vegetarian: false,
    is_available: true,
    category: 'main',
    is_special: isSpecial
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (itemToEdit) {
      if ('is_active' in itemToEdit) {
        // Editing a daily special
        const dailySpecial = itemToEdit as DailySpecial;
        setFormData({
          name: dailySpecial.name,
          description: dailySpecial.description,
          price: dailySpecial.price,
          image: null,
          is_vegetarian: false,
          is_available: true,
          category: 'main',
          is_special: true
        });
      } else {
        // Editing a regular menu item
        const menuItem = itemToEdit as MenuItem;
        setFormData({
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          image: null,
          is_vegetarian: menuItem.is_vegetarian || false,
          is_available: menuItem.is_available ?? true,
          category: menuItem.category || 'main',
          is_special: isSpecial
        });
      }
    } else if (isSpecial) {
      // New daily special - reset form with is_special flag
      setFormData(prev => ({
        ...prev,
        is_special: true,
        description: ''
      }));
    }
  }, [itemToEdit, isSpecial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        image: fileInput.files ? fileInput.files[0] : null
      }));
    } else if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (formData.is_special) {
        // Handle daily specials
        const today = new Date().toISOString().split('T')[0];
        const formDataToSend = new FormData();
        
        // Append all form fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && key !== 'is_special') {
            formDataToSend.append(key, value as string | Blob);
          }
        });
        
        // Add date
        formDataToSend.append('date', today);
        // Default to inactive when creating new daily special
        formDataToSend.append('is_active', 'false');

        if (itemToEdit && 'id' in itemToEdit) {
          // Update existing daily special
          await apiClient.patch(`/menu/daily-specials/${itemToEdit.id}/`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          // Create new daily special
          await apiClient.post('/menu/daily-specials/', formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      } else {
        // Handle regular menu items
        const formDataToSend = new FormData();
        
        // Append all form fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && key !== 'is_special') {
            formDataToSend.append(key, value as string | Blob);
          }
        });

        if (itemToEdit && 'id' in itemToEdit) {
          // Update existing menu item
          await apiClient.patch(`/menu/items/${itemToEdit.id}/`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          // Create new menu item
          await apiClient.post('/menu/items/', formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Error saving item:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to save ${formData.is_special ? 'special' : 'menu item'}. ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 p-6 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {formData.is_special 
              ? itemToEdit 
                ? "Edit Daily Special" 
                : "Add Daily Special"
              : itemToEdit 
                ? 'Edit Menu Item' 
                : 'Add New Menu Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {formData.is_special ? (
            // Daily specials form
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-amber-600/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-amber-600/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Describe this daily special..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 bg-slate-700 border border-amber-600/50 rounded-md text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                    disabled={isSubmitting}
                    placeholder="Enter price"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {itemToEdit ? 'Change Image' : 'Image'}
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600"
                  disabled={isSubmitting}
                />
                {itemToEdit && 'image' in itemToEdit && itemToEdit.image && !formData.image && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-400 mb-1">Current Image:</p>
                    <img 
                      src={itemToEdit.image} 
                      alt={formData.name} 
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            // Regular menu item form
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    disabled={isSubmitting}
                  >
                    <option value="main">Main Course</option>
                    <option value="appetizer">Appetizer</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_vegetarian"
                    name="is_vegetarian"
                    checked={formData.is_vegetarian || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-sky-500 rounded border-slate-600 focus:ring-sky-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="is_vegetarian" className="ml-2 text-sm text-slate-300">
                    Vegetarian
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_available"
                    name="is_available"
                    checked={formData.is_available !== false}
                    onChange={handleChange}
                    className="h-4 w-4 text-sky-500 rounded border-slate-600 focus:ring-sky-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="is_available" className="ml-2 text-sm text-slate-300">
                    Available
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {itemToEdit ? 'Change Image' : 'Image'}
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600"
                  disabled={isSubmitting}
                />
                {itemToEdit && 'image' in itemToEdit && itemToEdit.image && !formData.image && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-400 mb-1">Current Image:</p>
                    <img 
                      src={itemToEdit.image} 
                      alt={formData.name} 
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                formData.is_special
                  ? 'bg-amber-600 hover:bg-amber-500 focus:ring-amber-500'
                  : 'bg-sky-600 hover:bg-sky-500 focus:ring-sky-500'
              } ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {formData.is_special ? 'Saving Daily Special...' : 'Saving...'}
                </>
              ) : formData.is_special ? (
                itemToEdit ? 'Update Daily Special' : 'Add Daily Special'
              ) : (
                itemToEdit ? 'Update Item' : 'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MenuItemForm;