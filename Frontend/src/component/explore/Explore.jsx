import { useEffect, useState } from "react";
import Loader from '../shared/Loader'
import PostCard from "../post/PostCard";
import { dummyPosts } from "../../sampleData";
import SearchBar from "../specific/search/SearchBar";


const EXPLORE_TABS = ["Trending", "Hashtags", "People", "Communities", "Media"];

//add search bar to explore for search  with the explore filters.
//Add location filter ("Trending in India", "Nearby Creators")
//Cache trending results to reduce load
function Explore() {
  const [activeTab, setActiveTab] = useState("Trending");

  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchResults , setSearchResults] = useState(null) ;

  if (loading) return <Loader message={'Loading...'}/>;

  return (
    <div className="w-full mx-auto px-4 py-6  gap-6">

      <div className=" flex flex-col gap-4 w-full">
        <SearchBar onSearch={() => {}} />

        <h2 className="text-xl font-semibold">
          Explore {' '}
          <img src="./XConnect_icon.png" alt="" className="size-6 inline-block -translate-y-1" />Connect Now</h2>
          
          {/* Tabs */}
          <div className="flex gap-4 ml-1 border-b   overflow-x-auto overflow-y-clip w-full ">
            {EXPLORE_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border-b-2 text-sm hover:scale-110 duration-150 ${
                  activeTab === tab
                    ? "border-blue-600  font-bold dark:text-black dark:bg-white rounded-t-xl text-cyan-500"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        
        <div className="w-full mt-6 columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-6xl">
          {dummyPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>


      
    </div>
  );
}

export default Explore