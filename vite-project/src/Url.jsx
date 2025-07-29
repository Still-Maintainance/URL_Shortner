// src/Url.jsx
import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3000'; // Your backend URL

function Url() {
  const [longUrl, setLongUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [allUrls, setAllUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch all URLs
  const fetchAllUrls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setAllUrls(data);
    } catch (err) {
      console.error("Error fetching all URLs:", err);
      setError("Failed to load URLs. Please ensure the backend is running and accessible.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all URLs on component mount
  useEffect(() => {
    fetchAllUrls();
  }, [fetchAllUrls]);

  const handleShortenUrl = async () => {
    setMessage('');
    setShortenedUrl(null);
    setError(null);

    if (!longUrl) {
      setMessage('Please enter a URL to shorten.');
      return;
    }

    // Basic URL validation: checks if it looks like a URL with a protocol
    try {
        const url = new URL(longUrl);
        if (!url.protocol.startsWith('http')) {
            throw new Error('Invalid protocol');
        }
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
        setMessage('Please enter a valid URL including http:// or https:// (e.g., https://www.google.com)');
        return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl: longUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Adjust error handling for potential backend 409 conflict
        if (response.status === 409) {
            throw new Error(errorData.error || "This URL has already been shortened.");
        }
        throw new Error(errorData.error || `Failed to shorten URL. Status: ${response.status}`);
      }

      const data = await response.json();
      setShortenedUrl(`${API_BASE_URL}/${data.shortUrl}`); // Construct full short URL
      setMessage(data.message || 'URL shortened successfully!'); // Use message from backend if available
      setLongUrl(''); // Clear input
      fetchAllUrls(); // Refresh the list of all URLs
    } catch (err) {
      console.error("Error shortening URL:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShortUrl = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl)
        .then(() => setMessage('Short URL copied to clipboard!'))
        .catch(err => console.error('Failed to copy:', err));
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-5 text-gray-800 font-sans">
      <div className="bg-white p-8 md:p-10 lg:p-12 rounded-xl shadow-lg w-11/12 max-w-4xl text-center">
        <h1 className="text-green-600 mb-8 text-4xl font-bold">🔗 Simple URL Shortener</h1>

        {/* Shorten Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
          <h2 className="text-gray-700 mb-5 text-2xl font-semibold">Shorten a New URL</h2>
          <input
            type="url"
            id="longUrlInput"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your long URL here (e.g., https://www.google.com)"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            required
          />
          <button
            onClick={handleShortenUrl}
            disabled={loading}
            className="bg-green-500 text-white py-3 px-6 rounded-md text-base cursor-pointer hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>

          {shortenedUrl && (
            <div className="bg-green-50 border border-green-300 p-4 rounded-md mt-5 flex flex-col md:flex-row items-center justify-center gap-3">
              <p className="font-bold text-green-700 m-0">Your short URL is:</p>
              <a
                href={shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all flex-grow min-w-0"
              >
                {shortenedUrl}
              </a>
              <button
                onClick={handleCopyShortUrl}
                className="bg-blue-600 text-white py-2 px-4 rounded-md text-sm cursor-pointer hover:bg-blue-700 transition-colors duration-300"
              >
                Copy
              </button>
            </div>
          )}
          {message && <p className="mt-4 text-sm px-4 py-2 rounded-md inline-block bg-green-100 text-green-700 border border-green-200">{message}</p>}
          {error && <p className="mt-4 text-sm px-4 py-2 rounded-md inline-block bg-red-100 text-red-700 border border-red-200">{error}</p>}
        </div>

        {/* All URLs Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-gray-700 mb-5 text-2xl font-semibold">All Shortened URLs</h2>
          <button
            onClick={fetchAllUrls}
            disabled={loading}
            className="bg-gray-600 text-white py-3 px-6 rounded-md text-base cursor-pointer hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh List'}
          </button>
          {loading && <p className="mt-4 text-gray-600">Loading URLs...</p>}
          {error && !loading && <p className="mt-4 text-red-700">{error}</p>}
          {!loading && !error && allUrls.length === 0 && <p className="mt-4 text-gray-600">No URLs shortened yet. Shorten one above!</p>}

          {!loading && !error && allUrls.length > 0 && (
            <div className="overflow-x-auto mt-5">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Original URL</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Short URL</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Clicks</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {allUrls.map((url) => (
                    <tr key={url.shortUrl} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-normal break-words">
                        <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {url.originalUrl.length > 50 ? url.originalUrl.substring(0, 47) + '...' : url.originalUrl}
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-normal break-words">
                        <a href={`${API_BASE_URL}/${url.shortUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {`${API_BASE_URL}/${url.shortUrl}`}
                        </a>
                      </td>
                      <td className="px-4 py-3">{url.noOfClicks}</td>
                      <td className="px-4 py-3">{formatDate(url.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Url;