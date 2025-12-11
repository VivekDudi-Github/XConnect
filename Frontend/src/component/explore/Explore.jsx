import { useEffect, useState } from "react";
import Loader from '../shared/Loader'
import PostCard from "../post/PostCard";
import { dummyPosts } from "../../sampleData";
import SearchBar from "../specific/search/SearchBar";
import { useSearchBarMutation } from "../../redux/api/api";
import { toast } from "react-toastify";
import { data } from "react-router-dom";
import {SearchUserCard , SearchUserCardSkeleton} from "../shared/SearchUserCard";
import SearchCommunityCard from "../shared/SearchCommunityCard";


const EXPLORE_TABS = ["Trending", "People", "Communities", "Media" , "Results"];
// const autoComplete = ["#technology", "#art", "#science", "#music", "#travel", "#fitness"];
const searchUsersDummy = [
  //username , avatar , isFollowing , totalFollowers , fullname
  { id: 1, username: "johndoe", avatar: {url :"https://i.pravatar.cc/150?img=1"} , isFollowing : true , totalFollowers : 100 , fullname : "John Doe" },
  { id: 2, username: "janesmith", avatar: {url : "https://i.pravatar.cc/150?img=2"} , isFollowing : true , totalFollowers : 5865 , fullname : "Jane Smith" },
  { id: 3, username: "mikejohnson", avatar: {url : "https://i.pravatar.cc/150?img=3"} , isFollowing : true , totalFollowers : 1200 , fullname : "Mike Johnson" },
  { id: 4, username: "johndoe", avatar: {url : "https://i.pravatar.cc/150?img=4"} , isFollowing : false , totalFollowers : 12 , fullname : "John Doe" },
  { id: 5, username: "janesmith", avatar: {url : "https://i.pravatar.cc/150?img=5"} , isFollowing : false , totalFollowers : 100 , fullname : "Jane Smith" },
  ]
const auto_communities = [
  // name , avatar , banner , isFollowing , totalFollowers , description  
  { id : 1 , name : 'Tech' , isFollowing : true  , avatar : {url :'https://i.pravatar.cc/150?img=5'} , banner : {url :'https://i.pravatar.cc/150?img=1'} , description : 'Technology is the lifeblood of our society.' , followers : 100 , tagline : 'Technology is the lifeblood of our society.' } ,
  { id : 2 , name : 'Art'  , isFollowing : false , avatar : {url :'https://i.pravatar.cc/150?img=9'} , banner : {url : 'https://i.prbanner.cc/150?img=2'} , description : 'Art is the expression of human creativity and imagination.' , followers : 250 ,tagline : 'Art is the expression of human creativity and imagination.' } ,  
  { id : 3 , name : 'Tech' , isFollowing : true , avatar : {url :'https://i.pravatar.cc/150?img=5'} , banner : {url :'https://i.pravatar.cc/150?img=1'} , description : 'Technology is the lifeblood of our society.' , followers : 100 , tagline : 'Technology is the lifeblood of our society.' } ,
  { id : 4 , name : 'Art'  , isFollowing : false  , avatar : {url :'https://i.pravatar.cc/150?img=9'} , banner : {url : 'https://i.prbanner.cc/150?img=2'} , description : 'Art is the expression of human creativity and imagination.' , followers : 250 ,tagline : 'Art is the expression of human creativity and imagination.' } ,  
]

//Cache trending results to reduce load

// add three jsx components for posts  ,communities and posts under "Result" tab rendering
// each one will show passed data and fetch anotherOne when required
// will keep code well documented and factored 


function Explore() {
  const [activeTab, setActiveTab] = useState("Trending");
  const [suggestiveQuery , setSuggestiveQuery] = useState('') ;

  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [autoComplete , setAutoComplete] = useState([]) ; 

  const [searchResults , setSearchResults] = useState(null) ;
  const [searchLoading , setSearchLoading] = useState(false) ;
  
  const [searchResultsPage , setSearchResultsPage] = useState(1) ;
  const [searchResultsTotalPages , setSearchResultsTotalPages] = useState(1) ;

  const [searchUsers , setSearchUsers] = useState([]) ;
  const [searchUsersPage , setSearchUsersPage] = useState(1) ;
  const [searchUsersTotalPages , setSearchUsersTotalPages] = useState(1) ;

  const [searchCommunities , setSearchCommunities] = useState([]) ;
  const [searchCommunitiesPage , setSearchCommunitiesPage] = useState(1) ;
  const [searchCommunitiesTotalPages , setSearchCommunitiesTotalPages] = useState(1) ;

  const [suggestionsBox , setSuggestionsBox] = useState(false) ;

  const [fetchSuggestions] = useSearchBarMutation() ;
  const [fetchSearchResults] = useSearchBarMutation() ;
  

  if (loading) return <Loader message={'Loading...'}/>

  const onQueryChange = async(q) => {
    try {
      const res = await fetchSuggestions({q : q}).unwrap() ; 
      if(res.data) {
        console.log(res.data);
        setAutoComplete([...res.data.autocomplete.communities , ...res.data.autocomplete.users]) ;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to fetch suggestions') ;
    }
  }

  const onSearch = async(q) => {
    setSearchLoading(true) ;
    try {
      setActiveTab('Search') ;
      resetSearch() ;
      const res = await fetchSearchResults({q : q}).unwrap() ; 
      if(res.data) {
        addSearchResults(data) ;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to fetch suggestions') ;
    } finally {
      setSearchLoading(false) ;
    }
  }

  const showSuggestions = (isActive) => {
    console.log(isActive);
      setSuggestionsBox(isActive)
  }

  const resetSearch = () => {
    setSearchResults(null) ;
    setSearchUsers(null) ;
    setSearchCommunities(null) ;

    setSearchResultsPage(1) ;
    setSearchUsersPage(1) ;
    setSearchCommunitiesPage(1) ;
    
    setSearchResultsTotalPages(1) ;
    setSearchUsersTotalPages(1) ;
    setSearchCommunitiesTotalPages(1) ;
  }

  const addSearchResults = (data) => {
    const {user , communities , post} =  data ;

    if (post?.results) setSearchResults(post.results);
    if (post?.totalPages) setSearchResultsTotalPages(post.totalPages);

    if (user?.results) setSearchUsers(user.results);
    if (user?.totalPages) setSearchUsersTotalPages(user.totalPages);

    if (communities?.results) setSearchCommunities(communities.results);
    if (communities?.totalPages) setSearchCommunitiesTotalPages(communities.totalPages);


    setSearchResultsPage(2) ;
    setSearchUsersPage(2) ;
    setSearchCommunitiesPage(2) ;
  }
  
  
  


  return (
    <div className="w-full mx-auto px-4 py-6  gap-6">

      <div className=" flex flex-col gap-4 w-full">
        <div className="w-full relative text-black">
          <SearchBar onSearch={onSearch} onQueryChange={onQueryChange} addQuery={suggestiveQuery} showSuggestions={showSuggestions} isActiveSuggestions={suggestionsBox} isLoading={searchLoading}/>
          {suggestionsBox && autoComplete.length >0  && ( 
          <div className="bg-white shadow-md rounded-xl max-h-96  max-w-xl mx-auto absolute top-12 left-0 right-0 z-10 shadowLight overflow-auto duration-200">
            {autoComplete.length > 0 && autoComplete.map( item => (
              <div onClick={() => setSuggestiveQuery(item.name)} className="text-sm text-black border-b mx-2 border-slate-300 p-2 hover:bg-slate-300 duration-200" key={item} >
                {item.name}
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
        
        {activeTab !== 'Results' ? (
          <div className="w-full mt-6 columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-6xl">
            {dummyPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div> ): (
            <div>
              {/* user */}
              <div className="w-full mb-2 rounded-md ">  
                <span>Users:</span>
                <div className="flex items-center gap-2 pb-3 mt-2 overflow-y-auto overflow-x-auto flex-shrink-0">
                  {searchUsersDummy.map(user => (
                    <SearchUserCard key={user.id} username={user.username} fullname={user.fullname} avatar={user.avatar} isFollowing={user.isFollowing} totalFollowers={user.totalFollowers} onToggleFollow={() => console.log('follow')} />
                    // <SearchUserCardSkeleton key={user.id} />
                  ))}
                </div>
              </div>
              {/* communities  */}
              <div className="w-full mb-2 h-24 rounded-md ">  
                <span>Community:</span>
                <div className="flex items-center gap-2 pb-3 mt-2 overflow-y-auto overflow-x-auto flex-shrink-0">
                  {auto_communities.map(com => (
                    <SearchCommunityCard key={com.id} name={com.name} avatar={com.avatar} banner={com.banner} isFollowing={com.isFollowing} totalFollowers={com.followers} description={com.description} onToggleFollow={() => console.log('follow')} />
                  ))}
                </div>
              </div>
              {/* posts */}
            </div>
          )
        }
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