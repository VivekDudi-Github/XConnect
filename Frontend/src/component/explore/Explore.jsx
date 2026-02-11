import { useCallback, useEffect, useRef, useState } from "react";
import Loader from '../ui/Loader'
import PostCard from "../post/PostCard";
import { dummyPosts } from "../../sampleData";
import SearchBar from "../specific/search/SearchBar";
import { useLazyGetTrendingQuery, useNormalSearchMutation, useSearchBarMutation } from "../../redux/api/api";
import { toast } from "react-toastify";
import { ShowResultCommunities , ShowResultPosts , ShowResultUsers } from "./SearchResultTab";
import lastRefFunc from "../specific/LastRefFunc";
import { SearchUserCard, SearchUserCardSkeleton } from "../shared/SearchUserCard";
import PostCardSkeleton  from "../shared/PostCardSkeleton";
import CommunityPostCard from "../community/CommunityPostCard";


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
function Explore() {
  const observer = useRef() ;

  const [activeTab, setActiveTab] = useState("Trending");
  const [suggestiveQuery , setSuggestiveQuery] = useState('') ;

  const [tabContent, setTabContent] = useState([]);
  const [pageEnd , setPageEnd] = useState(false) ;
  
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryUsed , setQueryUsed] = useState('') ;

  const [autoComplete , setAutoComplete] = useState([]) ; 
  const [currPage , setCurrPage] = useState(1) ;

  const [searchResults , setSearchResults] = useState({}) ;
  const [searchLoading , setSearchLoading] = useState(false) ;
  

  const [suggestionsBox , setSuggestionsBox] = useState(false) ;

  const [fetchSuggestions] = useSearchBarMutation() ;
  const [fetchSearchResults] = useNormalSearchMutation() ;
  const [fetchTrending , {data , isError , error ,isLoading, isFetching}] = useLazyGetTrendingQuery() ;


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
      setActiveTab('Results') ;
      
      const res = await fetchSearchResults({q : q}).unwrap() ; 
      
      if(res.data) {
        setQueryUsed(q) ;
        setSearchResults(res.data) ; // {results , total} for each tab
        console.log(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || 'Failed to fetch searches') ;  
    } finally {
      setSearchLoading(false) ;
    }
  }

  const showSuggestions = (isActive) => {
    console.log(isActive);
      setSuggestionsBox(isActive)
  }

  const fetchMoreFunc = useCallback((node) => {
    lastRefFunc({
      page : currPage ,
      node ,
      fetchFunc : fetchTrending ,
      isLoading , 
      isFetching,
      activeTab ,
      observer ,
      preferCached : true ,
    })
  } , [data ,activeTab , currPage , isLoading , isFetching]) ;

  useEffect(() => {
    setCurrPage(1) ;
    setTabContent([]) ;
    setPageEnd(false) ;
    if(activeTab !== 'Results') fetchTrending({page : 1 , tab : activeTab} , true) ;
  }  , [activeTab])

  useEffect(() => {
    if(data?.data && !isFetching){
      setTabContent(prev => [...prev , ...data.data])
      setCurrPage(prev => prev+1) ; 
      if(data.data.length === 0 ) setPageEnd(true) ;
    }
  } , [data , isFetching])
console.log(isLoading , isFetching);

  useEffect(() => {
    if(isError ) toast.error(error?.message || 'something went wrong') ;
  } , [isError ,error]) ;
  
  useEffect(() => {
    return () => {
      setCurrPage(1) ;
      setTabContent([]) ;
      setPageEnd(false) ;
      setSearchResults({}) ;
    }
  }, [])
console.log('totalpost pages' , searchResults)
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
            <img src="./XConnect_icon.png" alt="" className="size-6 inline-block -translate-y-1" />
            Connect Now
          </h2>
          
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
          <div className=" mx-2 columns-1 sm:columns-1 lg:columns-3 gap-4 ">
            {activeTab !== 'People' && tabContent.map(({postDetails} , i) => {
              if(!postDetails ) return Array(4).map( (_, idx) => ( <PostCardSkeleton key={idx} /> )) ;
              return(
              <div key={postDetails._id} ref={(i === tabContent.length - 1 && !pageEnd)? fetchMoreFunc : null} className="break-inside-avoid"> 
                {postDetails.community ? (
                  <CommunityPostCard post={postDetails} heading={false}/>
                ) : (
                  <PostCard post={postDetails} />
                )}
              </div>
            )})}
            {activeTab === 'People' &&!isLoading && !isFetching && tabContent.map(({userDetails} , i) => {
              if(!userDetails ) return Array(4).map( (_, idx) => ( <SearchUserCardSkeleton key={idx} /> )) ;
              return (
              <div key={userDetails._id} ref={(i === tabContent.length - 1 && !pageEnd)? fetchMoreFunc : null} className="break-inside-avoid"> 
                <SearchUserCard username={userDetails?.username} bio={userDetails?.bio} avatar={userDetails?.avatar} fullname={userDetails?.fullname} isFollowing={userDetails?.isFollowing} totalFollowers={userDetails?.followers}  />  
              </div>
            )})}
          </div> 
          ) : (
          <div>
            <ShowResultUsers data={searchResults?.user?.results || []} totalPages={searchResults?.user?.total || 1} q={queryUsed} />   
            <ShowResultCommunities data={searchResults?.community?.results || []} totalPages={searchResults?.community?.total || 1} q={queryUsed} />
            <ShowResultPosts data={searchResults?.post?.results || []} totalPages={searchResults?.post?.total || 1} q={queryUsed} />
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