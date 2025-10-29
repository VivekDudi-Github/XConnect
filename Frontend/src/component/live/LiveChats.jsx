import { useCallback, useEffect, useRef, useState , useMemo} from "react";
import {ArrowDownIcon, ChevronDown, ChevronDownIcon, ChevronRightIcon, EllipsisVerticalIcon, IndianRupeeIcon,} from 'lucide-react' ;
import { useSocket } from "../specific/socket";
import { toast } from "react-toastify";
import Loader from "../shared/Loader";
import { useCreateSuperchatIntentMutation, useLazyGetLiveChatsQuery } from "../../redux/api/api";
import { useSelector } from "react-redux";
import RenderPostContent from "../specific/RenderPostContent";
import lastRefFunc from "../specific/LastRefFunc";
import moment from 'moment';
import { Elements, useElements, useStripe , CardElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const appearance = {
  theme: 'stripe', // Start with a base theme
  variables: {
    colorPrimary: '#0570de',
    colorBackground: '#ffffff',
    fontFamily: 'Roboto, sans-serif',
  },
  rules: {
    // Target specific components with custom CSS properties
    '.Tab': {
      border: '1px solid #E0E6EB',
      boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03)',
    },
    '.Input': {
      padding: '12px 16px',
    }
  }
};


export default function LiveChat({closeFunc , streamData , isProducer }) {
  const socket = useSocket();
  const auth = useSelector((state) => state.auth.user);

  const stripPromiseRef = useRef(null) ;

  useMemo(() => {
    console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    
    if(!stripPromiseRef.current) stripPromiseRef.current = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  } , [])

  const [sendSuperchat , setSendSuperchat] = useState(false) ;

  let observer = useRef(null);
  const containerRef = useRef(null);
  const [earliestMessage_id , setEarliestMessage_id ] = useState(null) ;
  const lastFetched_id  = useRef(null) ;

  const [messages, setMessages] = useState([]);
  const [liveMessages, setLiveMessages] = useState([]);
  const [input, setInput] = useState("");

  const [collapseTopBar , setCollapseTopBar ] = useState(false)
  const [openOptions , setOpenOptions] = useState('') ;
  const [BlockList , setBlockList] = useState(new Set('')) ;
  

  const [refetch , {data , error , isError , isLoading , isFetching}] = useLazyGetLiveChatsQuery() ;


  const sendMessage = () => {
    if (!input.trim()) return;
    if(!socket) return toast.error('Socket not connected'); 
    socket.emit("SEND_LIVE_MESSAGE", {
      message: input.trim(),
      roomId: streamData._id,
    } , () => setInput(''));
  };

  useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const { scrollTop, scrollHeight, clientHeight } = container;

  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

  if (distanceFromBottom <= 100) {
    requestAnimationFrame(() => {
      container.scrollTo({
        top: scrollHeight,
        behavior: 'smooth',
      });
    });
  }
}, [liveMessages]);

  useEffect(() => {if(streamData) refetch({id :streamData._id , lastId : earliestMessage_id  , limit : 15 })} , []) ;

  useEffect(() => {
    if(!socket) return;
    socket.on('RECEIVE_LIVE_MESSAGE' , async(obj) => {
      console.log(obj , 'message recived');
      
      setLiveMessages(prev => [...prev , obj])
    })
    return () => {
      socket.off('RECEIVE_LIVE_MESSAGE')
    }
  } , [socket])

  useEffect(() => {
    if(data?.data?.messages && data.data.messages.length > 0){
      const prevScrollHeight = containerRef.current.scrollHeight;
      const prevScrollTop = containerRef.current.scrollTop;
      console.log(data.data?.messages);
      
      setEarliestMessage_id(data.data.messages[0]?._id) ;
      setMessages(prev => [...data.data.messages , ...prev ]) ;

      requestAnimationFrame(() => {
        const newScrollHeight = containerRef.current.scrollHeight;
        containerRef.current.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
      })
    }
  } , [data])

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  };
  const toggleSetOptions = (i) => {
    openOptions === i ? setOpenOptions('') :setOpenOptions(i); 
  };

  const refetchFunc = () => {
    if(lastFetched_id.current === earliestMessage_id) return ;
    console.log('fecthing chats');
    console.log(earliestMessage_id , lastFetched_id.current);
    
    lastFetched_id.current = (earliestMessage_id) ;
    refetch({id : streamData._id , lastId : earliestMessage_id  , limit : 5 } , )
  }

  const topMessageRef = useCallback((node) => {
      lastRefFunc({
        observer , 
        node , 
        page : 2 ,
        fetchFunc : refetchFunc ,
      })
  } , [messages] )

  const superChatToggle = () => {
    setSendSuperchat(prev => !prev)
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
    {/* Messages area */}
    <div ref={containerRef} className="absolute top-0 left-0 right-0 bottom-[50px] overflow-y-auto p-1 space-y-1 z-10">
      {!streamData ? (<Loader/>) : 
      messages.map((msg, i) => {
        if(msg?.superChat || i === messages.length-1) return <SuperChatUi msg={msg}  BlockList={BlockList}  openOptions={openOptions}  toggleSetOptions={toggleSetOptions}  topMessageRef={topMessageRef} /> 
        
        return (
          <div key={i} ref={i === 0 ? topMessageRef : null} className={`w-full border-b border-gray-500 flex items-start justify-between gap-0.5 text-wrap break-words p-1 text-sm fade-in duration-200 relative ${openOptions == i ? 'z-50' : 'z-0'} 
            ${(msg.sender._id === streamData?.host) ? 'dark:bg-white dark:text-black text-white bg-black rounded-lg' : 'dark:text-white rounded-sm'}`}>
            <div className="w-fit flex items-center h-full">
              <img className="rounded-full size-8 mr-1 dark:border " src={msg?.sender?.avatar?.url || './avatar-default.svg'} alt="" />
            </div>
            <div className="w-full text-left ">
              <strong>{msg?.sender?.username}</strong> {' : '} 
              {/* {moment(msg.createdAt).fromNow()} */}
              {BlockList.has(msg.user) ? (<i>Blocked</i>) :   <RenderPostContent text={msg.message} />}
            </div>
            <div className="relative h-full" onClick={() => toggleSetOptions(i)}>
              <EllipsisVerticalIcon className="text-gray-500 hover:text-gray-700 cursor-pointer size-4 z-0" />
              {openOptions === i && (
                <div className="absolute top-6 right-0 bg-white rounded-lg shadow-lg hover:cursor-pointer space-y-0.5 border border-gray-200 z-50 overflow-hidden text-sm text-black">
                  <div className="hover:bg-slate-200 duration-200 px-2">{BlockList.has(msg.user) ? 'Unblock' : 'Block'}</div>
                  <div className="hover:bg-slate-200 duration-200 px-2">Report</div>
                </div>
              )}
            </div>
          </div>
        )
      })}
      {liveMessages.length > 0 ?  
      liveMessages.map((msg, i) => {
        if(msg?.superChat || i === liveMessages.length-1) return <SuperChatUi msg={msg}  BlockList={BlockList}  openOptions={openOptions}  toggleSetOptions={toggleSetOptions}  topMessageRef={topMessageRef} />
        return (
          <div key={i} ref={i === 0 ? topMessageRef : null} className={`w-full border-b border-gray-500 flex items-start justify-between gap-0.5 text-wrap break-words p-1 text-sm fade-in duration-200 relative ${openOptions == i ? 'z-50' : 'z-0'} 
            ${(msg.sender._id === streamData?.host) ? 'dark:bg-white dark:text-black text-white bg-black rounded-lg' : 'dark:text-white rounded-sm'}`}>
            <div className="w-fit">
              <img className="rounded-full size-8 mr-1 dark:border " src={msg?.sender?.avatar?.url || './avatar-default.svg'} alt="" />
            </div>
            <div className="w-full text-left">
              <strong>{msg?.sender?.username}</strong> {' : '} 
              {/* {moment(msg.createdAt).fromNow()} */}
              {BlockList.has(msg.user) ? (<i>Blocked</i>) :   <RenderPostContent text={msg.message} />}
            </div>
            <div className="relative" onClick={() => toggleSetOptions(i)}>
              <EllipsisVerticalIcon className="text-gray-500 hover:text-gray-700 cursor-pointer size-4 z-0" />
              {openOptions === i && (
                <div className="absolute top-6 right-0 bg-white rounded-lg shadow-lg hover:cursor-pointer space-y-0.5 border border-gray-200 z-50 overflow-hidden text-sm text-black">
                  <div className="hover:bg-slate-200 duration-200 px-2">{BlockList.has(msg.user) ? 'Unblock' : 'Block'}</div>
                  <div className="hover:bg-slate-200 duration-200 px-2">Report</div>
                </div>
              )}
            </div>
          </div>
        )
      }) : null }
    </div>

    {/* Top bar */}
    <div className={`p-1 dark:bg-black bg-white rounded-t-lg duration-200 absolute top-0 left-0 right-0 z-10 shadow-lg shadow-blue-500/40 ${collapseTopBar ? 'size-0' : ''} `}>
      <span className={`gap-1 mb-2 text-black flex`}>
        <button
        onClick={() => setCollapseTopBar(prev => !prev)}
        className="bg-white rounded-full shadow-lg active:scale-95 hover:bg-gray-300 duration-200 z-50"  >
          <ChevronRightIcon />
        </button>
        <span hidden={collapseTopBar} className="p-1 px-1.5 bg-white rounded-xl text-xs font-semibold ">Pins- 0</span>
        <span hidden={collapseTopBar} className="p-1 px-1.5 bg-white rounded-xl text-xs font-semibold ">SuperChats : ₹0.00</span>
      </span>
      <div className={` flex gap-1 text-white overflow-x-scroll pb-3 text-[14px] duration-200 ${collapseTopBar ? 'size-0' : 'max-w-full'}`}>
        <button className="p-1 flex max-w-40  h-6 flex-nowrap gap-1 px-1.5 shadowLight bg-gradient-to-r border-r from-[#25617a] dark:to-black to-white rounded-xl text-xs font-semibold "  >
          <img src="/avatar-default.svg" alt="" className="w-4 h-4 rounded-full" />
          <span className="text-nowrap truncate">Name what you want to play?</span>
        </button>
        <button className="p-1 flex max-w-40  h-6 flex-nowrap gap-1 px-1.5 shadowLight bg-gradient-to-r border-r from-[#25617a] dark:to-black to-white rounded-xl text-xs font-semibold "  >
          <img src="/avatar-default.svg" alt="" className="w-4 h-4 rounded-full" />
          <span className="text-nowrap truncate">Name what you want to play?</span>
        </button>
      </div>
      <div className={` flex gap-1 text-white overflow-x-scroll pb-3 text-[14px] duration-200 ${collapseTopBar ? 'size-0' : 'max-w-full'}`}>
        <button className="p-1 flex max-w-40  h-6 flex-nowrap gap-1 px-1.5 bg-gradient-to-r border-r from-[#872963] dark:to-black shadowLight rounded-xl text-xs font-semibold "  >
          <img src="/avatar-default.svg" alt="" className="w-4 h-4 rounded-full" />
          <span className="text-nowrap truncate">$100</span>
        </button>
        <button className="p-1 flex max-w-40 h-6 flex-nowrap gap-1 px-1.5 bg-gradient-to-r border-r from-[#872963] dark:to-black shadowLight rounded-xl text-xs font-semibold "  >
          <img src="/avatar-default.svg" alt="" className="w-4 h-4 rounded-full" />
          <span className="truncate text-nowrap">$20</span>
        </button>
      </div>
      <div hidden={collapseTopBar} className="w-full z-50 mt-4 rounded-b-lg overflow-hidden duration-200">
        {messages.length > 0 ? <SuperChatUi msg={messages[messages.length - 3]} i={messages.length-1} BlockList={BlockList} openOptions={openOptions} toggleSetOptions={toggleSetOptions} topMessageRef={topMessageRef} /> : null}
      </div>      
    </div>


    {/* Scroll to bottom button & superchat button */}
    <div>
      <button className="absolute bottom-14 right-2 bg-white p-1 rounded-full shadow-lg active:scale-95 duration-200 z-50" onClick={scrollToBottom}>
        <ArrowDownIcon  />
      </button>
      <button className="absolute bottom-14  right-12  bg-cyan-300 p-1 rounded-full shadow-lg active:scale-95 duration-200 z-50" onClick={superChatToggle}>
        <IndianRupeeIcon /> 
      </button>
    </div>

    {/* Input bar fixed at bottom */}
    <div className="p-1  flex absolute bottom-0 left-0 right-0 mb-1 ">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Send a message..."
        className="custom_Input shadowLight"
      />
      <button
        disabled={!streamData}
        onClick={sendMessage}
        className="ml-2 bg-blue-500 text-white px-4 rounded-lg"
      >
        Send
      </button>  
    </div>


    <div className={`absolute bottom-0 left-0 z-50 flex items-center justify-center duration-200 ${sendSuperchat ? 'translate-y-0' : 'translate-y-full'}`}>
      <Elements stripe={stripPromiseRef.current} options={appearance}>
        <CheckoutForm auth={auth}  onClose={superChatToggle} streamData={streamData} input={input} />
      </Elements>
    </div>
  </div>
  );
}

function SuperChatUi ({msg , i , BlockList , openOptions , toggleSetOptions , topMessageRef }){
  const [collapse , setCollapse] = useState(false);
  return (
    <div key={i} ref={i === 0 ? topMessageRef : null} className={`w-full border-b bg-gradient-to-b from-[#872963] to-black rounded-t-lg border-gray-500 flex items-start justify-between gap-0.5 text-wrap break-words p-1 text-sm fade-in duration-200 relative ${openOptions == i ? 'z-50' : 'z-0'} `}> 
      <div className="w-fit">
        <img className="rounded-full size-8 mr-1 dark:border " src={msg?.sender?.avatar?.url || './avatar-default.svg'} alt="" />
      </div>
      <div className="w-full text-left  text-white">
        <div className="flex justify-between items-center">
          <strong>{msg?.sender?.username} {' : '} 
            <span className="p-1 py-0.5 text-black font-bold bg-white rounded-lg">₹500</span>
          </strong>
          <ChevronDownIcon onClick={() => setCollapse(!collapse)} size={20} className={`${collapse ? 'transform rotate-180' : ''} duration-200 `} />
        </div>
        {/* {moment(msg.createdAt).fromNow()} */}
        {BlockList.has(msg.user) ? 
        (<i>Blocked</i>) 
        :  
        <span hidden={collapse} className="text-sm dark:text-white"
        ><RenderPostContent text={msg.message} /></span>} 
      </div>
      <div className="relative" onClick={() => toggleSetOptions(i)}>
        <EllipsisVerticalIcon className="text-gray-300 hover:text-gray-700 cursor-pointer size-4 z-0" />
        {openOptions === i && (
          <div className="absolute top-6 right-0 bg-white rounded-lg shadow-lg hover:cursor-pointer space-y-0.5 border border-gray-200 z-50 overflow-hidden text-sm text-black">
            <div className="hover:bg-slate-200 duration-200 px-2">{BlockList.has(msg.user) ? 'Unblock' : 'Block'}</div>
            <div className="hover:bg-slate-200 duration-200 px-2">Report</div>
          </div>
        )}
      </div>
    </div>
  )

}

function CheckoutForm({auth , streamData , input , onClose}) {
  const stripe = useStripe() ;
  const elements = useElements();

  
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState("");

  const [mutation] = useCreateSuperchatIntentMutation()

  const handleSubmit = async (e) => {
  e.preventDefault();
  if(!stripe) return;
  if(!amount) return toast.error('Please enter amount');
  if(!message) return toast.error('Please enter message');
  
  try {
    const data = await mutation({message, amount ,streamId : streamData._id}).unwrap();
    const res = await stripe.confirmCardPayment(data.data) ;
    console.log(res);
    
    if(res.error){
      return toast.error(res.error.message)
    }else {
      toast.success(`SuperChat of ₹${amount} sent successfully`) 
      onClose()
    }

  } catch (error) {
    console.log(error);
    return toast.error(error || 'Something went wrong');
  }

  }


  useEffect(() => {
  setMessage(input)
  }, [input])
   
  return (
    <div className="max-w-md mx-auto p-2 rounded-lg shadow-lg bg-white dark:bg-black custom-box">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">Send a Superchat 💬 
        <ChevronDown onClick={onClose} />
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          placeholder="Amount (INR)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="custom_Input shadowLight"
          required
        />
        <textarea
          placeholder="Your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="custom_Input shadowLight"
          required
        ></textarea>

        <div className="">
          <CardElement className="custom_Input" options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#fff',
              '::placeholder': {
                color: '#fff',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }} />
        </div>

        <button
          type="submit"
          disabled={!stripe}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Send & Pay
        </button>
      </form>

      <p className="mt-3 text-gray-700">{status}</p>
    </div>
  )
}

// next create superchat ui and add it to the chat
// integerate the payment gateway for it. 