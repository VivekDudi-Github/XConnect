const lastRefFunc = ({observer , node , isLoading , page ,activeTab , toatalPages , fetchFunc}) => {
  if(observer.current) observer.current.disconnect() ;

  observer.current = new IntersectionObserver(entries => {
    if(entries[0].isIntersecting && !isLoading && ( toatalPages ? page <= toatalPages : true) && page > 1){ 
      console.log('fetcheing post');
      fetchFunc({page : page , tab: activeTab}) ;
    }
  } , {
    root : null ,
    threshold : 0.5 ,
    rootMargin : '0px'
  })

  if(node) observer.current.observe(node)

}

export default lastRefFunc