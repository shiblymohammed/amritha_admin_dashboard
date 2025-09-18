// _file: admin_dashboard/src/components/MenuItemList.tsx_
import { useState, useEffect, useCallback } from 'react';
import type { DailySpecial } from '../types';
import apiClient from '../api/axiosConfig';
import MenuItemForm from './MenuItemForm';
import { FiEdit2, FiTrash2, FiPlus, FiStar, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

function MenuItemList() {
  const [dailySpecials, setDailySpecials] = useState<DailySpecial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for the modal form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<DailySpecial | null>(null);

  const fetchDailySpecials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/menu/daily-specials/');
      const items = response.data?.results || [];
      setDailySpecials(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Error fetching daily specials:', err);
      setError('Failed to fetch daily specials. Please try again later.');
      setDailySpecials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailySpecials();
  }, [fetchDailySpecials]);
  
  const handleAddNew = () => {
    setItemToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (dailySpecial: DailySpecial) => {
    setItemToEdit(dailySpecial);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this daily special?')) {
      try {
        await apiClient.delete(`/menu/daily-specials/${id}/`);
        fetchDailySpecials();
      } catch (error) {
        console.error('Error deleting daily special:', error);
        setError('Failed to delete daily special. Please try again.');
      }
    }
  };

  const handleToggleActive = async (dailySpecial: DailySpecial) => {
    const action = dailySpecial.is_active ? 'deactivate' : 'activate';
    const confirmMessage = dailySpecial.is_active 
      ? 'Are you sure you want to deactivate this daily special? It will be hidden from the dining page.'
      : 'Are you sure you want to activate this daily special? It will be shown on the dining page.';
    
    if (window.confirm(confirmMessage)) {
      try {
        await apiClient.post(`/menu/daily-specials/${dailySpecial.id}/${action}/`);
        fetchDailySpecials();
      } catch (error) {
        console.error(`Error ${action}ing daily special:`, error);
        setError(`Failed to ${action} daily special. Please try again.`);
      }
    }
  };

  const handleFormSuccess = () => {
    fetchDailySpecials();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg text-center">
      <p>{error}</p>
      <button
        onClick={fetchDailySpecials}
        className="mt-2 text-sm bg-red-800 hover:bg-red-700 px-3 py-1 rounded"
      >
        Retry
      </button>
    </div>
  );

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      {/* The Modal Form */}
      {isFormOpen && (
        <MenuItemForm
          itemToEdit={itemToEdit}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          isSpecial={true}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <FiStar className="text-amber-400 text-3xl" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Daily Specials</h1>
            </div>
            <p className="text-slate-400 mt-2">{today}</p>
          </div>
          <button
            onClick={handleAddNew}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-lg hover:shadow-amber-500/20"
          >
            <FiPlus className="text-lg" />
            Add Daily Special
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg">
            <p>{error}</p>
            <button
              onClick={fetchDailySpecials}
              className="mt-2 text-sm bg-red-800 hover:bg-red-700 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        ) : dailySpecials.length === 0 ? (
          <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiStar className="text-amber-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Daily Specials Added Yet</h3>
              <p className="text-slate-400 mb-6">Add daily special dishes to showcase them to your customers.</p>
              <button
                onClick={handleAddNew}
                className="bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <FiPlus className="text-lg" />
                Add First Daily Special
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-900/30 to-amber-800/20">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium text-amber-200">Daily Special</th>
                    <th className="p-4 text-left text-sm font-medium text-amber-200">Description</th>
                    <th className="p-4 text-right text-sm font-medium text-amber-200">Price</th>
                    <th className="p-4 text-center text-sm font-medium text-amber-200">Status</th>
                    <th className="p-4 text-right text-sm font-medium text-amber-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {dailySpecials.map((dailySpecial) => (
                    <tr key={dailySpecial.id} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="relative">
                            <img
                              src={dailySpecial.image || 'https://placehold.co/80x60/1e1e2f/94a3b8?text=No+Image'}
                              alt={dailySpecial.name}
                              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg mr-4"
                            />
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                              <FiStar className="w-3 h-3" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{dailySpecial.name}</h3>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-300 max-w-xs">
                        <p className="line-clamp-2">{dailySpecial.description || 'No description'}</p>
                      </td>
                      <td className="p-4 text-right text-white font-bold text-lg">
                        ₹{parseFloat(dailySpecial.price || '0').toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleActive(dailySpecial)}
                          className={`flex items-center justify-center w-12 h-6 rounded-full transition-colors ${
                            dailySpecial.is_active 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-gray-500 hover:bg-gray-600'
                          }`}
                          title={dailySpecial.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {dailySpecial.is_active ? (
                            <FiToggleRight className="text-white text-sm" />
                          ) : (
                            <FiToggleLeft className="text-white text-sm" />
                          )}
                        </button>
                        <span className={`text-xs mt-1 block ${dailySpecial.is_active ? 'text-green-400' : 'text-gray-400'}`}>
                          {dailySpecial.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(dailySpecial)}
                            className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
                            aria-label="Edit daily special"
                            title="Edit daily special"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dailySpecial.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            aria-label="Delete daily special"
                            title="Delete daily special"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuItemList;