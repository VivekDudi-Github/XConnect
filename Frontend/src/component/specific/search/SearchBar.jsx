import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // onSearch(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center w-full  max-w-xl mx-auto bg-white shadow-lg border rounded-xl px-4 py-2 mb-6"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search @users, #hashtags, posts ,communities..."
        className="flex-grow outline-none text-sm text-gray-700"
      />
      <button type="submit" className="text-blue-600 font-medium px-3">
        Search
      </button>
    </form>
  );
}
