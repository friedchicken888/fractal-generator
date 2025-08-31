import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, toggleUserGeneration, getAllHistory, getAllGallery, deleteUser, deleteUserGallery } from '../services/admin';
import { getFractalDetails } from '../services/fractal';
import { deleteGalleryItem } from '../services/gallery';

export default function Admin() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'history', 'gallery'
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userPagination, setUserPagination] = useState({
    limit: 10,
    offset: 0,
    totalCount: 0,
  });
  const [historyPagination, setHistoryPagination] = useState({
    limit: 10, // Changed to 10 per page
    offset: 0,
    totalCount: 0,
  });
  const [galleryPagination, setGalleryPagination] = useState({
    limit: 5,
    offset: 0,
    totalCount: 0,
  });

  const [historyFilters, setHistoryFilters] = useState({}); // Empty object
  const [historySortBy, setHistorySortBy] = useState('generated_at');
  const [historySortOrder, setHistorySortOrder] = useState('DESC');

  const [galleryFilters, setGalleryFilters] = useState({
    colorScheme: '',
    power: '',
    iterations: '',
    width: '',
    height: '',
  });
  const [gallerySortBy, setGallerySortBy] = useState('added_at');
  const [gallerySortOrder, setGallerySortOrder] = useState('DESC');
  const [selectedFractal, setSelectedFractal] = useState(null); // State for modal

  const closeModal = () => {
    setSelectedFractal(null);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'users') {
        const result = await getUsers(token, { limit: userPagination.limit, offset: userPagination.offset });
        if (result.data) {
          setUsers(result.data);
          setUserPagination(prev => ({ ...prev, totalCount: result.totalCount }));
        } else {
          setError(result.message || 'Failed to fetch users.');
        }
      } else if (activeTab === 'history') {
        const params = {
          limit: historyPagination.limit,
          offset: historyPagination.offset,
          ...historyFilters,
          sortBy: historySortBy,
          sortOrder: historySortOrder,
        };
        const result = await getAllHistory(token, params);
        if (result.data) {
          setHistory(result.data);
          setHistoryPagination(prev => ({ ...prev, totalCount: result.totalCount }));
        } else {
          setError(result.message || 'Failed to fetch history.');
        }
      } else if (activeTab === 'gallery') {
        const params = {
          limit: galleryPagination.limit,
          offset: galleryPagination.offset,
          ...galleryFilters,
          sortBy: gallerySortBy,
          sortOrder: gallerySortOrder,
        };
        const result = await getAllGallery(token, params);
        if (result.data) {
          setGallery(result.data);
          setGalleryPagination(prev => ({ ...prev, totalCount: result.totalCount }));
        } else {
          setError(result.message || 'Failed to fetch gallery.');
        }
      }
    } catch (err) {
      setError('An error occurred while fetching data.');
    }
    setLoading(false);
  }, [activeTab, token, user, userPagination.limit, userPagination.offset, historyPagination.limit, historyPagination.offset, historyFilters, historySortBy, historySortOrder, galleryPagination.limit, galleryPagination.offset, galleryFilters, gallerySortBy, gallerySortOrder]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    if (token) {
      fetchData();
    }
  }, [activeTab, token, user, fetchData]);

  const handleToggleGeneration = async (userId) => {
    try {
      await toggleUserGeneration(userId, token);
      const result = await getUsers(token, { limit: userPagination.limit, offset: userPagination.offset });
      if (result.data) {
        setUsers(result.data);
      } else {
        setError(result.message || 'Failed to fetch users after toggle.');
      }
    } catch (err) {
      setError('Failed to toggle user generation status.');
    }
  };

  

  const handleDeleteUserGallery = async (userId) => {
    if (window.confirm('Are you sure you want to delete all gallery items for this user? This action cannot be undone.')) {
      try {
        await deleteUserGallery(userId, token);
        const result = await getUsers(token, { limit: userPagination.limit, offset: userPagination.offset });
        if (result.data) {
          setUsers(result.data);
        } else {
          setError(result.message || 'Failed to fetch users after gallery deletion.');
        }
      } catch (err) {
        setError('Failed to delete user gallery.');
      }
    }
  };

  const handleNextPage = (tab) => {
    if (tab === 'users') {
      setUserPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    } else if (tab === 'history') {
      setHistoryPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    } else if (tab === 'gallery') {
      setGalleryPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    }
  };

  const handlePrevPage = (tab) => {
    if (tab === 'users') {
      setUserPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
    } else if (tab === 'history') {
      setHistoryPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
    } else if (tab === 'gallery') {
      setGalleryPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
    }
  };

  

  const handleHistorySortChange = (e) => {
    setHistorySortBy(e.target.value);
    setHistoryPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleHistorySortOrderChange = (e) => {
    setHistorySortOrder(e.target.value);
    setHistoryPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleResetHistoryFilters = () => {
    setHistoryFilters({}); // Empty object
    setHistorySortBy('generated_at'); // Reset sort by to default
    setHistorySortOrder('DESC'); // Reset sort order to default
    setHistoryPagination(prev => ({ ...prev, offset: 0 })); // Reset offset
  };

  const handleGalleryFilterChange = (e) => {
    setGalleryFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setGalleryPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleGallerySortChange = (e) => {
    setGallerySortBy(e.target.value);
    setGalleryPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleGallerySortOrderChange = (e) => {
    setGallerySortOrder(e.target.value);
    setGalleryPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleViewHistoryDetails = async (fractalId, historyItemId) => {
    if (!fractalId) {
      alert('Fractal ID not available for this history item.');
      return;
    }
    try {
      const details = await getFractalDetails(fractalId, token);
      setSelectedFractal({ ...details, gallery_item_id: historyItemId }); // Use historyItemId for consistency
    } catch (err) {
      setError('Failed to fetch fractal details.');
    }
  };

  const handleOpenImage = (url) => {
    window.open(url, '_blank');
  };

  const handleDeleteGalleryItem = async (galleryItemId) => {
    if (window.confirm('Are you sure you want to delete this gallery item? This action cannot be undone.')) {
      try {
        const result = await deleteGalleryItem(galleryItemId, token);
        if (result.success) {
          alert('Gallery item deleted successfully!');
          fetchData(); // Refresh data after deletion
          closeModal(); // Close the modal
        } else {
          setError(result.message || 'Failed to delete gallery item.');
        }
      } catch (err) {
        setError('An error occurred while deleting the gallery item.');
      }
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(selectedFractal.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset "Copied!" message after 2 seconds
  };



  if (loading) return <p>Loading admin data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-gray-500 text-gray-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-gray-500 text-gray-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'gallery' ? 'border-b-2 border-gray-500 text-gray-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </button>
      </div>

      {activeTab === 'users' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">ID</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Username</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Role</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Generated Fractals</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Gallery Fractals</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2 px-4 border-b border-gray-700">{u.id}</td>
                    <td className="py-2 px-4 border-b border-gray-700">{u.username}</td>
                    <td className="py-2 px-4 border-b border-gray-700">{u.role}</td>
                    <td className="py-2 px-4 border-b border-gray-700">{u.generated_fractals_count || 0}</td>
                    <td className="py-2 px-4 border-b border-gray-700">{u.gallery_fractals_count || 0}</td>
                    <td className="py-2 px-4 border-b border-gray-700">
                      {u.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleToggleGeneration(u.id)}
                            className={`${u.can_generate_fractals ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-1 px-3 rounded text-sm mr-2`}
                          >
                            {u.can_generate_fractals ? 'Generation Enabled' : 'Generation Disabled'}
                          </button>
                          <button
                            onClick={() => handleDeleteUserGallery(u.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Delete Gallery
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => handlePrevPage('users')}
              disabled={userPagination.offset === 0}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Showing {userPagination.offset + 1} - {Math.min(userPagination.offset + userPagination.limit, userPagination.totalCount)} of {userPagination.totalCount}
            </span>
            <button
              onClick={() => handleNextPage('users')}
              disabled={userPagination.offset + userPagination.limit >= userPagination.totalCount}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <div className="flex justify-between items-center mb-4"> {/* New div for heading and controls */}
            <h2 className="text-2xl font-bold">All Fractal Generation History</h2>
            <form onSubmit={e => e.preventDefault()} className="flex items-end space-x-4"> {/* Form for controls */}
              <div className="flex-grow">
                <label className="block mb-2">Sort By</label>
                <select name="sortBy" value={historySortBy} onChange={handleHistorySortChange} className="w-full p-2 rounded bg-gray-700">
                  <option value="generated_at">Generated At</option>
                  <option value="user_id">User</option>
                </select>
              </div>
              <div className="flex-grow">
                <label className="block mb-2">Sort Order</label>
                <select name="sortOrder" value={historySortOrder} onChange={handleHistorySortOrderChange} className="w-full p-2 rounded bg-gray-700">
                  <option value="DESC">Descending</option>
                  <option value="ASC">Ascending</option>
                </select>
              </div>
              <div className="flex-grow">
                <button
                  type="button"
                  onClick={handleResetHistoryFilters}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded w-full"
                >
                  Reset Filters
                </button>
              </div>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">ID</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">User</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Hash</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Generated At</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Status</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 px-4 border-b border-gray-700">{item.id}</td>
                    <td className="py-2 px-4 border-b border-gray-700">
                      {item.user_id === 1 ? 'user' : item.user_id === 2 ? 'user2' : item.user_id === 3 ? 'admin' : 'Unknown'}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700">{typeof item.hash === 'string' && item.hash.length > 0 ? item.hash.substring(0, 8) + '...' : 'N/A (Deleted)'}</td>
                    <td className="py-2 px-4 border-b border-gray-700">{new Date(item.generated_at).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b border-gray-700">
                      {typeof item.hash === 'string' && item.hash.length > 0 ? 'Available' : 'Deleted'}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700">
                      <button
                        onClick={() => handleViewHistoryDetails(item.fractal_id, item.id)}
                        className={`bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm ${!(typeof item.hash === 'string' && item.hash.length > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!(typeof item.hash === 'string' && item.hash.length > 0)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => handlePrevPage('history')}
              disabled={historyPagination.offset === 0}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Showing {historyPagination.offset + 1} - {Math.min(historyPagination.offset + historyPagination.limit, historyPagination.totalCount)} of {historyPagination.totalCount}
            </span>
            <button
              onClick={() => handleNextPage('history')}
              disabled={historyPagination.offset + historyPagination.limit >= historyPagination.totalCount}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">All Gallery Items</h2>
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Filters & Sorting</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">Color Scheme</label>
                <select name="colorScheme" value={galleryFilters.colorScheme} onChange={handleGalleryFilterChange} className="w-full p-2 rounded bg-gray-700">
                  <option value="">All</option>
                  <option value="rainbow">Rainbow</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="fire">Fire</option>
                  <option value="hsl">HSL</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Power</label>
                <input type="number" step="0.1" name="power" value={galleryFilters.power} onChange={handleGalleryFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Iterations</label>
                <input type="number" name="iterations" value={galleryFilters.iterations} onChange={handleGalleryFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Width</label>
                <input type="number" name="width" value={galleryFilters.width} onChange={handleGalleryFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Height</label>
                <input type="number" name="height" value={galleryFilters.height} onChange={handleGalleryFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Sort By</label>
                <select name="sortBy" value={gallerySortBy} onChange={handleGallerySortChange} className="w-full p-2 rounded bg-gray-700">
                  <option value="added_at">Added At</option>
                  <option value="hash">Hash</option>
                  <option value="width">Width</option>
                  <option value="height">Height</option>
                  <option value="iterations">Iterations</option>
                  <option value="power">Power</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Sort Order</label>
                <select name="sortOrder" value={gallerySortOrder} onChange={handleGallerySortOrderChange} className="w-full p-2 rounded bg-gray-700">
                  <option value="DESC">Descending</option>
                  <option value="ASC">Ascending</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <div key={item.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <img src={item.url} alt="Fractal" className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.hash.substring(0, 8)}...</h3>
                <p>User: {item.username}</p>
                <p>Width: {item.width}, Height: {item.height}</p>
                <p>Iterations: {item.iterations}</p>
                <p>Color Scheme: {item.colorScheme}</p>
                <p>Added At: {new Date(item.added_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => handlePrevPage('gallery')}
              disabled={galleryPagination.offset === 0}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Showing {galleryPagination.offset + 1} - {Math.min(galleryPagination.offset + galleryPagination.limit, galleryPagination.totalCount)} of {galleryPagination.totalCount}
            </span>
            <button
              onClick={() => handleNextPage('gallery')}
              disabled={galleryPagination.offset + galleryPagination.limit >= galleryPagination.totalCount}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedFractal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-3xl w-full relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-white text-xl font-bold">&times;</button>
            <h2 className="text-2xl font-bold mb-4">Fractal Details</h2>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0 w-full md:w-1/2">
                <img src={selectedFractal.url} alt="Fractal" className="w-full object-contain rounded-lg" />
              </div>
              <div className="w-full md:w-1/2 grid grid-cols-2 gap-x-4 gap-y-2">
                <p className="relative">
                  <strong>Hash:</strong>
                  <span
                    className="cursor-pointer text-blue-400 hover:underline"
                    onClick={handleCopyHash}
                    title="Click to copy hash"
                  >
                    {typeof selectedFractal.hash === 'string' && selectedFractal.hash.length > 0 ? selectedFractal.hash.substring(0, 12) + '...' : 'N/A'}
                  </span>
                  {copied && <span className="absolute -top-4 left-0 text-green-400 text-xs">Copied!</span>}
                </p>
                <p><strong>Width:</strong> {selectedFractal.width}</p>
                <p><strong>Height:</strong> {selectedFractal.height}</p>
                <p><strong>Iterations:</strong> {selectedFractal.iterations}</p>
                <p><strong>Power:</strong> {selectedFractal.power}</p>
                <p><strong>Real (c):</strong> {selectedFractal.c_real}</p>
                <p><strong>Imaginary (c):</strong> {selectedFractal.c_imag}</p>
                <p><strong>Scale:</strong> {selectedFractal.scale}</p>
                <p><strong>Offset X:</strong> {selectedFractal.offsetX}</p>
                <p><strong>Offset Y:</strong> {selectedFractal.offsetY}</p>
                <p><strong>Color Scheme:</strong> {selectedFractal.colorScheme}</p>
                <p><strong>Date:</strong> {selectedFractal.generated_at_user ? new Date(selectedFractal.generated_at_user).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }) : 'N/A'}</p>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => handleOpenImage(selectedFractal.url)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex-grow mr-2"
              >
                Open
              </button>
              <button
                onClick={() => handleDeleteGalleryItem(selectedFractal.gallery_item_id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-grow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
