const lastRefFunc = (config) => {
  const {
    observer,
    id,
    node,
    isLoading,
    isFetching ,
    page,
    activeTab,
    isComment,
    sortBy,
    totalPages,
    fetchFunc ,
    username ,
    q ,
    preferCached = false ,
  } = config;

  if(observer.current) observer.current.disconnect() ;

  observer.current = new IntersectionObserver(entries => {    
    if(entries[0].isIntersecting && !isLoading && !isFetching && ( (totalPages || totalPages === 0) ? page <= totalPages : true) && page > 1){ 
      console.log('fetcheing post' , page);
      
      fetchFunc({page : page , id , tab: activeTab , sortBy : sortBy , isComment , username , q } , preferCached ) ;
    }
  } , {
    root : null ,
    threshold : 0.5 ,
    rootMargin : '0px'
  })

  if(node) observer.current.observe(node)

}

export default lastRefFunc