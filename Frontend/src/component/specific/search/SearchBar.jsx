import { useEffect } from "react";
import { useState } from "react";

export default function SearchBar({ onSearch , onQueryChange , addResults , addQuery , showSuggestions , isActiveSuggestions}) {
  const [query, setQuery] = useState("");
  const [results , setResults] = useState() ;
  const [isActive , setIsActive] = useState(false) ;

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  useEffect(() => {
    if(query.trim() && onQueryChange){
      // onQueryChange(query.trim()) ;
      showSuggestions(true)
    }
  } , [query])

  useEffect(() => {
    if(addQuery){
      setQuery(addQuery) ;
      // setIsActive(true) ;
    }
  } , [addQuery])

  useEffect(() => {
    if(showSuggestions) showSuggestions(isActive) ;
  } , [isActive])

  useEffect(() => {
    setIsActive(isActiveSuggestions)
  } , [isActiveSuggestions])

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center w-full p-2 max-w-xl mx-auto bg-white shadow-lg border rounded-xl px-4 py-2 mb-6 duration-200 shadowLight "
    >
      <input
        type="text"
        onFocus={() => setIsActive(true)}
        onBlur={() => setTimeout(() => setIsActive(false) , 500)}
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search anything..."
        className="flex-grow outline-none text-sm text-gray-700  "
      />
      <button type="submit" className="text-blue-600 font-medium px-3 hover:text-black">
        Search
      </button>
    </form>
  );
}
