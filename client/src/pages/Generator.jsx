import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateFractal } from '../services/fractal';

const DEFAULT_PARAMS = {
  width: 1920,
  height: 1080,
  maxIterations: 500,
  power: 2,
  c: { real: 0.285, imag: 0.01 },
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  colorScheme: 'rainbow',
};

export default function Generator() {
  const { token } = useAuth();
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [fractal, setFractal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'real' || name === 'imag') {
      setParams(prevParams => ({
        ...prevParams,
        c: {
          ...prevParams.c,
          [name]: parseFloat(value)
        }
      }));
    } else if (name === 'maxIterations' || name === 'width' || name === 'height') {
      setParams({ ...params, [name]: parseInt(value) });
    } else if (name === 'power' || name === 'scale' || name === 'offsetX' || name === 'offsetY') {
      setParams({ ...params, [name]: parseFloat(value) });
    } else {
      setParams({ ...params, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFractal(null);
    try {
      const response = await generateFractal(params, token);
      if (response.status === 429) {
        setError('Please wait, you are already generating a fractal.');
        setLoading(false);
        return;
      }
      const result = await response.json(); // Parse JSON only if status is not 429

      if (result.url) {
        setFractal(result);
      } else {
        setError(result.message || 'Failed to generate fractal.');
      }
    } catch (err) {
      setError('An error occurred while generating the fractal.');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
    setFractal(null);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Fractal Generator</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-800 p-6 rounded-lg mb-6">
        {/* Row 1 */}
        <div>
          <label className="block mb-2">Width</label>
          <input type="number" name="width" value={params.width} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" />
        </div>
        <div>
          <label className="block mb-2">Height</label>
          <input type="number" name="height" value={params.height} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" />
        </div>
        <div>
          <label className="block mb-2">Max Iterations</label>
          <input type="number" name="maxIterations" value={params.maxIterations} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" />
        </div>
        <div>
          <label className="block mb-2">Real Part (c)</label>
          <input type="number" step="0.001" name="real" value={params.c.real} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" />
        </div>
        <div>
          <label className="block mb-2">Imaginary Part (c)</label>
          <input type="number" step="0.001" name="imag" value={params.c.imag} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" />
        </div>

        {/* Row 2 */}
        <div>
          <label className="block mb-2">Power</label>
          <input type="number" step="0.1" name="power" value={params.power} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" />
        </div>
        <div>
          <label className="block mb-2">Scale</label>
          <input type="number" step="0.1" name="scale" value={params.scale} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" />
        </div>
        <div>
          <label className="block mb-2">Offset X</label>
          <input type="number" step="0.1" name="offsetX" value={params.offsetX} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" />
        </div>
        <div>
          <label className="block mb-2">Offset Y</label>
          <input type="number" step="0.1" name="offsetY" value={params.offsetY} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" />
        </div>
        <div>
          <label className="block mb-2">Color Scheme</label>
          <select name="colorScheme" value={params.colorScheme} onChange={handleChange} className="w-full p-2 rounded bg-gray-700">
            <option value="rainbow">Rainbow</option>
            <option value="grayscale">Grayscale</option>
            <option value="fire">Fire</option>
            <option value="hsl">HSL</option>
          </select>
        </div>

        <div className="col-span-full flex justify-between space-x-4 mt-4">
          <button
            type="submit"
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Fractal'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {fractal && (
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 flex-grow">
          <div className="flex-shrink-0 w-full md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Generated Fractal</h2>
            <img src={fractal.url} alt="Generated Fractal" className="w-full rounded-lg" />
          </div>
          <div className="flex-grow w-full md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Details</h2>
            <p className="mt-2"><strong>Hash:</strong> {fractal.hash}</p>
            <p><strong>Width:</strong> {fractal.width}</p>
            <p><strong>Height:</strong> {fractal.height}</p>
            <p><strong>Iterations:</strong> {fractal.maxIterations}</p>
            <p><strong>Power:</strong> {fractal.power}</p>
            <p><strong>Real (c):</strong> {fractal.c.real}</p>
            <p><strong>Imaginary (c):</strong> {fractal.c.imag}</p>
            <p><strong>Scale:</strong> {fractal.scale}</p>
            <p><strong>Offset X:</strong> {fractal.offsetX}</p>
            <p><strong>Offset Y:</strong> {fractal.offsetY}</p>
            <p><strong>Color Scheme:</strong> {fractal.colorScheme}</p>
          </div>
        </div>
      )}
    </div>
  );
}
