import { useEffect, useState } from "react";
import Loader from '../shared/Loader'
import PostCard from "../post/PostCard";
import { dummyPosts } from "../../sampleData";
import SearchBar from "../specific/search/SearchBar";
import { useSearchBarMutation } from "../../redux/api/api";
import { toast } from "react-toastify";


const EXPLORE_TABS = ["Trending", "People", "Communities", "Media"];
const autoComplete = ["#technology", "#art", "#science", "#music", "#travel", "#fitness"];
const users = [
  // { id: 1, name: "John Doe", username: "johndoe", avatar: "https://i.pravatar.cc/150?img=1" },
  // { id: 2, name: "Jane Smith", username: "janesmith", avatar: "https://i.pravatar.cc/150?img=2" },
  // { id: 3, name: "Mike Johnson", username: "mikejohnson", avatar: "https://i.pravatar.cc/150?img=3" },
  // { id: 1, name: "John Doe", username: "johndoe", avatar: "https://i.pravatar.cc/150?img=1" },
  // { id: 2, name: "Jane Smith", username: "janesmith", avatar: "https://i.pravatar.cc/150?img=2" },
  // { id: 3, name: "Mike Johnson", username: "mikejohnson", avatar: "https://i.pravatar.cc/150?img=3" },
  // { id: 1, name: "John Doe", username: "johndoe", avatar: "https://i.pravatar.cc/150?img=1" },
  // { id: 2, name: "Jane Smith", username: "janesmith", avatar: "https://i.pravatar.cc/150?img=2" },
  // { id: 3, name: "Mike Johnson", username: "mikejohnson", avatar: "https://i.pravatar.cc/150?img=4" },
]
const communities = [
  // {id : 1 , name : 'Tech' , avatar : 'https://i.pravatar.cc/150?img=5' , banner : 'https://i.pravatar.cc/150?img=1' , description : 'Technology is the lifeblood of our society.' , followers : 100 } ,
  // {id : 2 , name : 'Tech' , avatar : 'https://i.pravatar.cc/150?img=4' , banner : 'https://i.pravatar.cc/150?img=1' , description : 'Technology is the lifeblood of our society.' , followers : 100 } ,
  // {id : 3 , name : 'Tech' , avatar : 'https://i.pravatar.cc/150?img=9' , banner : 'https://i.pravatar.cc/150?img=1' , description : 'Technology is the lifeblood of our society.' , followers : 100 } ,
]

//Cache trending results to reduce load
function Explore() {
  const [activeTab, setActiveTab] = useState("Trending");
  const [suggestiveQuery , setSuggestiveQuery] = useState('') ;

  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchResults , setSearchResults] = useState(null) ;
  const [suggestionsBox , setSuggestionsBox] = useState(false) ;

  const [fetchSuggestions] = useSearchBarMutation() ;

  if (loading) return <Loader message={'Loading...'}/>;

  const onQueryChange = async(q) => {
    try {
      const res = await fetchSuggestions({q : q}).unwrap() ; 
      if(res.data) console.log(res.data) ;
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to fetch suggestions') ;
    }
  }

  const showSuggestions = (isActive) => {
    console.log(isActive);
      setSuggestionsBox(isActive)
  }
  console.log(suggestionsBox , suggestiveQuery);
  

  return (
    <div className="w-full mx-auto px-4 py-6  gap-6">

      <div className=" flex flex-col gap-4 w-full">
        <div className="w-full relative text-black">
          <SearchBar onSearch={() => {}} onQueryChange={onQueryChange} addQuery={suggestiveQuery} showSuggestions={showSuggestions} isActiveSuggestions={suggestionsBox}/>
          {suggestionsBox && (
          <div className="bg-white shadow-md rounded-xl max-h-96  max-w-xl mx-auto absolute top-12 left-0 right-0 z-10 shadowLight overflow-auto">
            {users.length > 0 && 'users :'}
            <div className="flex gap-1 mb-2 overflow-x-auto w-full ">  
              {users.length > 0 && users.map((user) => (
                <div title={'@'+user.username} className="h-16 w-16 text-sm text-black border-b flex-shrink-0 p-1 rounded-md border-1 border-slate-400 hover:bg-slate-300  overflow-hidden" key={user.id} > 
                  <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover mx-auto" />
                  <span className=" text-sm " >@{user.username}</span>
                </div>
              ))}
            </div>
            {communities.length > 0 && 'communities :'}
            <div className="flex gap-1 mb-1 overflow-x-auto">
              {communities.length > 0 && communities.map((c) => (
                <div title={c.name} className="h-20 w-20 text-sm text-black border-b p-1 rounded-md border-1 border-red-400 hover:bg-slate-300  overflow-hidden" key={c.id} > 
                  <img src={c.avatar} alt="" className="w-10 h-10 rounded-xl object-cover mx-auto" />
                  <div>
                    <div className=" text-xs text-center " >{c.name}</div>
                    <div className=" text-xs " >Joined:{c.followers}</div>
                  </div>
                </div>
              ))}
            </div>
            {autoComplete.map( item => (
              <div onClick={() => setSuggestiveQuery(item)} className="text-sm text-black border-b mx-2 border-slate-300 p-2 hover:bg-slate-300 duration-200" key={item} >
                {item}
              </div>  
            ))}
          </div>)}
        </div>

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

export default Explore ;

{/* <li className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Sort by:</span>
            <button className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              Trending
            </button>
            <button className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              Most Engaged
            </button>
            <button className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              Most Commented
            </button>
          </li> */}