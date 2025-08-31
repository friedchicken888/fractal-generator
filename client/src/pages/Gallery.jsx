import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGallery, deleteGalleryItem } from '../services/gallery';
import { getFractalDetails } from '../services/fractal'; // Re-import getFractalDetails

export default function Gallery() {
  const { token } = useAuth();
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    totalCount: 0,
  });
  const [filters, setFilters] = useState({
    width: '',
    height: '',
    maxIterations: '',
    c_real: '',
    c_imag: '',
    power: '',
    scale: '',
    offsetX: '',
    offsetY: '',
    colorScheme: '',
    hash: '',
  });
  const [sortBy, setSortBy] = useState('added_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false); // New state for expand/collapse
  const [selectedFractal, setSelectedFractal] = useState(null); // State for modal

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: pagination.limit,
        offset: pagination.offset,
        ...filters,
        sortBy,
        sortOrder,
      };
      const result = await getGallery(token, params);
      
      if (result.data) {
        setGalleryItems(result.data);
        setPagination({ ...pagination, totalCount: result.totalCount });
      } else {
        setError(result.message || 'Failed to fetch gallery items.');
      }
    } catch (err) {
      setError('An error occurred while fetching gallery items.');
    }
    setLoading(false);
  }, [token, pagination.limit, pagination.offset, filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'c_real' || name === 'c_imag') {
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: parseFloat(value)
      }));
    } else if (name === 'maxIterations' || name === 'width' || name === 'height') {
      setFilters({ ...filters, [name]: parseInt(value) });
    } else if (name === 'power' || name === 'scale' || name === 'offsetX' || name === 'offsetY') {
      setFilters({ ...filters, [name]: parseFloat(value) });
    } else {
      setFilters({ ...filters, [name]: value });
    }
    setPagination({ ...pagination, offset: 0 }); // Reset offset on filter change
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPagination({ ...pagination, offset: 0 }); // Reset offset on sort change
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    setPagination({ ...pagination, offset: 0 });
  };

  const handleResetFilters = () => {
    setFilters({
      width: '',
      height: '',
      maxIterations: '',
      c_real: '',
      c_imag: '',
      power: '',
      scale: '',
      offsetX: '',
      offsetY: '',
      colorScheme: '',
      hash: '',
    });
    setSortBy('added_at');
    setSortOrder('DESC');
    setPagination({ ...pagination, offset: 0 }); // Reset offset on filter change
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fractal from your gallery?')) {
      try {
        await deleteGalleryItem(id, token);
        fetchGallery();
        closeModal(); // Close modal after deletion
      } catch (err) {
        setError('Failed to delete gallery item.');
      }
    }
  };

  const handleNextPage = () => {
    setPagination({ ...pagination, offset: pagination.offset + pagination.limit });
  };

  const handlePrevPage = () => {
    setPagination({ ...pagination, offset: Math.max(0, pagination.offset - pagination.limit) });
  };

  const handleViewDetails = async (fractalId, galleryItemId) => {
    try {
      const details = await getFractalDetails(fractalId, token);
      setSelectedFractal({ ...details, gallery_item_id: galleryItemId }); // Store gallery item ID
    } catch (err) {
      setError('Failed to fetch fractal details.');
    }
  };

  const handleOpenImage = (url) => {
    window.open(url, '_blank');
  };

  const closeModal = () => {
    setSelectedFractal(null);
  };

  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(selectedFractal.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset "Copied!" message after 2 seconds
  };

  return (
    <div className="flex flex-col flex-grow">
      <h1 className="text-3xl font-bold mb-6">My Gallery</h1>

      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Filters & Sorting</h2>
          <button
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            {isFiltersExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {isFiltersExpanded && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
              <div>
                <label className="block mb-2">Width</label>
                <input type="number" name="width" value={filters.width} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Height</label>
                <input type="number" name="height" value={filters.height} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Max Iterations</label>
                <input type="number" name="maxIterations" value={filters.maxIterations} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Real Part (c)</label>
                <input type="number" step="0.001" name="c_real" value={filters.c_real} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Imaginary Part (c)</label>
                <input type="number" step="0.001" name="c_imag" value={filters.c_imag} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>

              <div>
                <label className="block mb-2">Power</label>
                <input type="number" step="0.1" name="power" value={filters.power} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Scale</label>
                <input type="number" step="0.1" name="scale" value={filters.scale} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Offset X</label>
                <input type="number" step="0.1" name="offsetX" value={filters.offsetX} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Offset Y</label>
                <input type="number" step="0.1" name="offsetY" value={filters.offsetY} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Color Scheme</label>
                <select name="colorScheme" value={filters.colorScheme} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700">
                  <option value="">All</option>
                  <option value="rainbow">Rainbow</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="fire">Fire</option>
                  <option value="hsl">HSL</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Hash</label>
                <input type="text" name="hash" value={filters.hash} onChange={handleFilterChange} className="w-full p-2 rounded bg-gray-700" />
              </div>
              <div>
                <label className="block mb-2">Sort By</label>
                <select name="sortBy" value={sortBy} onChange={handleSortChange} className="w-full p-2 rounded bg-gray-700">
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
                <select name="sortOrder" value={sortOrder} onChange={handleSortOrderChange} className="w-full p-2 rounded bg-gray-700">
                  <option value="DESC">Descending</option>
                  <option value="ASC">Ascending</option>
                </select>
              </div>
              <div className="col-span-2 flex items-end"> {/* col-span-2 for columns 4 and 5 */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full h-10 flex-grow bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
                >
                  Reset Options
                </button>
              </div>
            </div>
            
          </>
        )}
      </div>

      <div>
        {loading && <p>Loading gallery...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && galleryItems.length === 0 && <p>No gallery items found.</p>}
      </div>

      <div className="flex flex-col flex-grow overflow-y-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <img src={item.url} alt="Fractal" className="w-full object-contain rounded-lg mb-4 max-h-48" />
              <div className="flex justify-between mt-4 w-full">
                <button
                  onClick={() => handleViewDetails(item.fractal_id, item.id)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex-grow mr-2"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-grow ml-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevPage}
            disabled={pagination.offset === 0}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.totalCount)} of {pagination.totalCount}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pagination.offset + pagination.limit >= pagination.totalCount}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

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
                    {selectedFractal.hash.substring(0, 12)}...
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
                onClick={() => handleDelete(selectedFractal.gallery_item_id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-grow ml-2"
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
