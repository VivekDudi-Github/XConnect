import { useCallback, useEffect,  useState ,} from "react";
import {ArrowDownIcon, ChevronDown, Loader2Icon,} from 'lucide-react' ;
import { toast } from "react-toastify";
import { useCreateSuperchatIntentMutation } from "../../redux/api/api";
import { Elements, useElements, useStripe , CardElement } from "@stripe/react-stripe-js";


let amounts = [
  {price : 50 } ,
  {price : 100 } ,
  {price : 500 } ,
  {price : 1000 } ,
  {price : 5000 } ,
]

export default function CheckoutForm({auth , streamData , input , onClose}) {
  const stripe = useStripe() ;
  const elements = useElements();
  const[loading , setLoading] = useState(false) ;
  
  const [amount, setAmount] = useState(20);
  const [message, setMessage] = useState('');

  const [mutation] = useCreateSuperchatIntentMutation()

  const handleSubmit = async (e) => {
  e.preventDefault();
  if(!stripe) return;
  if(!amount) return toast.error('Please enter amount');
  if(!message) return toast.error('Please enter message');
  if(amount <= 0) return toast.error('Please enter amount greater than 0');
  if(amount > 5000) return toast.error('Amount should be less than 5000');

  try {
    setLoading(true) ;
    const data = await mutation({message, amount ,streamId : streamData._id}).unwrap();
    const res = await stripe.confirmCardPayment(data.data , {
      payment_method : {
        card : elements.getElement(CardElement),
      }
    }) ;
    console.log(res , data.data);
    
    if(res.error){
      return toast.error(res.error.message)
    }else {
      toast.success(`SuperChat of ₹${amount} sent successfully`) 
      onClose()
    }
    
  } catch (error) {
    console.log(error);
    return toast.error(error || 'Something went wrong');
  } finally{
    setLoading(false) ;
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
        <div className="flex flex-wrap gap-2">
          {amounts.map(a => 
            <button type="button" className={`p-1 flex max-w-40  h-8 flex-nowrap gap-1 px-1.5 shadowLight bg-gradient-to-br ${amount === a.price ? 'from-[#337484]' : 'from-[#473383]'} dark:to-[#050502] to-white rounded-xl text-sm font-semibold duration-200 ` }
              style={{border :  amount === a.price ? '2px solid white' : '2px solid #000' , boxShadow : amount === a.price ? '0 0 10px white' : ''}} 
              onClick={() => setAmount(a.price)}
            >
              <span className="text-nowrap truncate">₹{a.price}</span>
            </button>
          )}
        </div>
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
          disabled={!stripe|| loading}
          className="w-full bg-blue-600 text-center flex items-center justify-center text-white py-2 rounded hover:bg-blue-700"
        >
          {!loading ? 'Send & Pay' : <Loader2Icon className="animate-spin duration-200" />}
        </button>
      </form>

      <p className="mt-3 text-gray-700">{status}</p>
    </div>
  )
}