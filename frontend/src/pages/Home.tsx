import { useState } from 'react';
import { useReceipt } from '../hooks/useReceipt';

export default function Home() {
  const [input, setInput] = useState('');
  const [url, setUrl] = useState('');

  const { data, isLoading, isError, error } = useReceipt(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrl(input.trim());
  };

  return (
    <div className="flex flex-col items-center w-full p-8 gap-6">
      <h1 className="text-xl font-bold">Receipt Tester</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste Amazon product URL..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 bg-black text-white rounded text-sm disabled:opacity-40"
        >
          Fetch
        </button>
      </form>

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {isError && (
        <p className="text-sm text-red-500">
          {(error as Error)?.message ?? 'Something went wrong'}
        </p>
      )}
      {data && (
        <pre className="w-full max-w-xl bg-gray-100 rounded p-4 text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
