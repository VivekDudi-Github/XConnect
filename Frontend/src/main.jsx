import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer , Slide } from 'react-toastify'
import { BrowserRouter } from 'react-router-dom'
import {Provider} from 'react-redux'
import store from './redux/store/store.js'
import {ProgressProvider} from '@bprogress/react'

createRoot(document.getElementById('root')).render(
  // <StrictMode> 
    <Provider store={store}>
      <BrowserRouter>
        <ProgressProvider height='5px' color='#fff' options={{showSpinner : false , trickleSpeed : 200}} >
          <App />
        </ProgressProvider>
      </BrowserRouter>
    </Provider>
  // </StrictMode> 
)
