import { ArrowRightLeftIcon, BlocksIcon, ChartNetworkIcon, ChevronRightIcon, ClipboardPenLine, CloudUploadIcon, CogIcon, CookieIcon, DatabaseZapIcon, DownloadIcon, FileVideoIcon, GitCompareArrowsIcon, GithubIcon, Grid2X2Icon, GridIcon, Hand, HandIcon, icons, ImageDownIcon, ImagePlayIcon, ImageUpIcon, LayoutDashboardIcon, LoaderIcon, LucideDatabaseZap, LucideFileOutput, LucideLoader, LucideNewspaper, LucideVideotape, LucideView, MonitorSmartphoneIcon, NavigationIcon, NetworkIcon, PackageIcon, PanelBottomCloseIcon, PanelsLeftRightIcon, PickaxeIcon, Plug2Icon, SendToBack, ServerCogIcon, SquareSplitVerticalIcon, TextSelectionIcon, TrendingUpDown, TruckElectricIcon, UnplugIcon, UploadIcon, User2Icon, UserCheck } from 'lucide-react'
import React, { useState } from 'react'
import DownArrow from '../ui/DownArrow';

const flows = [
  {
    name : 'Request Flow' ,
    description : 'How an api travels through the system and returns a response' ,
    flowDiagram:[
      {color : 'bg-purple-800', mainText: 'Client Request' ,secText: 'React Redux Query' ,icon :MonitorSmartphoneIcon},
      {color : 'bg-yellow-600', mainText: 'Backend Server' ,secText: 'Express via router' ,icon :ServerCogIcon},
      {color : 'bg-sky-600', mainText: 'Auth Check' ,secText: 'Uses Jwt' ,icon :UserCheck},
      {color : 'bg-red-600', mainText: 'Controller' ,secText: 'Uses Zod for validation' ,icon :CogIcon},
      {color : 'bg-green-600', mainText: 'Service Layer' ,secText: '' ,icon :SquareSplitVerticalIcon},
      {color : 'bg-blue-600', mainText: 'DB Layer' ,secText: 'MongoDB' ,icon :DatabaseZapIcon},
      {color : 'bg-cyan-600', mainText: 'Response' ,secText: 'Response to client' ,icon :MonitorSmartphoneIcon},
    ] ,
    responsiblities:[
      {name : 'Frontend-Rtk Query :' , content :'Sends API requests and manages caching & responses.'},
      {name : 'Express-Node :' , content :'Act as environment in which server runs.'},
      {name : 'JWT :' , content :'Verifies token and protects private routes'},
      {name : 'Controller :' , content :'Vaidates request and forwards to service layer'},
      {name : 'Service layer :' , content :'Business logic.'},
      {name : 'DB Layer :' , content :'Responsible for all db related operations.'},
      {name : 'Controller :' , content :'Sends the response back to the client.'},
    ] ,
    process:[
      'User performs an action on frontend which triggers an api request via Redux Query.',
      'Express server recieves the api request , do the checks and then route it to the appropraite router.',
      'Before reaching to the main controller , jwt middleware checks for the auth on protected routes and then passes to next.',
      'Controller act as anchor between validation and service layer. It sends data to Jod Validation and then calls the appropriate service layer',
      'Service layer interacts with the db layer and performs the required operations and creates a response.',
      'Once the operations are done the response is sent back to the client.',
    ] ,
    stack:[
      {name : 'Frontend :' , content :'React, Redux Toolkit, RTK Query'},
      {name : 'Backend :' , content :'Node.js, Express'},
      {name : 'Verification :' , content :'Zod'},
      {name : 'Auth :' , content :'JWT, Cookies'},
      {name : 'Database :' , content :'MongoDB Atlas'},
    ]
  } , {
    name : 'Authentication Flow' ,
    description: 'Secure user login and protected route via JWT and cookies' ,
    flowDiagram:[
      {color:'bg-fuchsia-800' , mainText: 'User Login' , secText: 'Email & Password' , icon: User2Icon},
      {color:'bg-cyan-600' , mainText: 'POST/login' , secText: 'Auth api' , icon: NetworkIcon},
      {color:'bg-green-600' , mainText: 'Controller' , secText: 'Validates creditials' , icon: CogIcon}, 
      {color: 'bg-sky-600' , mainText: 'DB Layer' , secText: 'fetch user & store refresh Token' , icon: DatabaseZapIcon },
      {color:'bg-red-600' , mainText: 'Pass Check' , secText: 'Bycrypt compare' , icon: GitCompareArrowsIcon},  
      {color:'bg-sky-600' , mainText: 'Jwt Token' , secText: 'generate sign' , icon: LayoutDashboardIcon },   
      {color:'bg-blue-800/50' , mainText: 'Http Cookie' , secText: 'secure storage' , icon: CookieIcon},   
      {color:'bg-gray-800' , mainText: 'Protected Route' , secText: 'Acess to routes' , icon: UserCheck},
    ] ,
    responsiblities:[
      {name : 'Auth service :' , content :' Handles token generation & DB update'}, 
      {name : 'Bycrypt :' , content : 'hashes & compare password and makes hashed refresh Token for db'},  
      {name : 'Jwt :' , content : 'generates access and refresh tokens'},
    ] ,
    process:[
      'User enters credentials and clicks login button' ,
      'express routes it to login /login controller' ,
      'controller validates the credentials and then calls the auth service' ,
      'auth service calls db layer to fetch the user details' ,
      'then it calls bycrypt to compare the password with the hashed one' ,
      'after matching it calls jwt generate the access and refresh token with credentials' ,
      'uses bycrypt to hash the refresh token and calls db layer to update the refresh token in db' ,
      'the controller then sets the tokens in http-only cookies and sends the response back to the client' ,
      'client can now visit the protected routes'      
    ] ,
    stack:[
      {name : 'Auth :' , content :'JWT '},
      {name : 'Password Hashing' , content : 'Bcrypt'},
      {name : 'Cookies :' , content :'Http only cookies, cookie parser'},
    ] ,
  } , {
    name: 'Media Upload Flow' ,
    description : 'Handles video uploads with secure stroage and processing',
    flowDiagram:[
      {color:'bg-purple-800' , mainText: 'Client Select' , secText: 'Video file' , icon: ImagePlayIcon},
      {color:'bg-yellow-600' , mainText : 'Initiate Api' ,  secText:'Create upload session & chunk metadata ' , icon: PanelsLeftRightIcon },
      {color:'bg-sky-600' , mainText : 'Media-Chunked' ,  secText:'Resumable & Multipart' , icon: Grid2X2Icon },
      {color:'bg-red-600' , mainText : 'Chunks Upload' ,  secText:'Uploads to server' , icon: BlocksIcon },
      
      {color:'bg-green-600' , mainText : 'Multer Middleware' ,  secText:'chunk and file handling' , icon: PanelBottomCloseIcon },
      {color:'bg-blue-600' , mainText : 'Controller' , secText:'Integrity & completion Checks' , icon : SendToBack} ,   
      {color:'bg-gray-600' , mainText : 'Video Merge Queue' ,  secText:'Merges chunks' , icon: FileVideoIcon },
      {color:'bg-pink-600' , mainText : 'Child Process' ,  secText:'Spin up FFmpeg' , icon:  LucideLoader }, 
      {color:'bg-zinc-300' , mainText: 'HLS creations' , secText: '360p/480p quality' , icon: LucideVideotape },
      {color:'bg-orange-600' , mainText : 'FFmpeg Output' , secText : 'm3u8 playlist' , icon: LucideFileOutput },
      {color: 'bg-purple-600/50', mainText: 'Upload Cloud' , secText: 'Calls supabase uploader' , icon: CloudUploadIcon },   
      {color: 'bg-teal-600', mainText: 'DB Layer' , secText: 'Update video status & metadata' , icon: DatabaseZapIcon }, 
    ] ,
    responsiblities : [
      {name : 'Multer :' , content : 'Handles media files ,storage, do type and size check'}, 
      {name : 'FFmpeg :' , content : 'Handles merger, multiple resolution downscaling, HLS segementation and m3u8 playlist creation'},   
      {name : 'Supabase :' , content : 'cloud storage for hsl videos and provide the cdn for fast access'},
      {name : 'Cloudinary :' , content : 'Handles media uploads to images'},
    ] ,
    stack : [
      {name : 'Server File Handling' , content : 'Multer'},
      {name : 'Video operations ' , content : 'FFmpeg'}, 
      {name : 'Cloud Storage' , content : 'Cloudinary ,Supabase' },
      {name : 'Child Process' , content : 'Nodejs'},
    ] ,
    process : [
      'For Images- User > Multer size & type checks > Controller > Cloudinary > DB URL Update (Images uploades are straight forward)' ,
      'User intiates the Video upload' , 
      'File type and size are send to Initate Api which size check, calculates the total required chunks , intiate the new MongoDB record and return to client',  
      'Client slices the video into chunks and uploads one by one.' , 
      'Multer middleware check size limit and puts into local storage ',
      'After completion , controller checks for missing parts, change DB status to "processing" and initiates the merge process' ,
      'It reads the chunks and merges them into a single video final size are checks with DB' , 
      'A child process is spawned to start FFmpeg worker' ,
      'FFmpeg probes the video generates a thumbnail and creates different streams of segments withing 360p, 480p and 720p resolution.' ,
      'Creates playlist for every resolution stream and finally it creates a master playlist.' , 
      'In the end the playlists along with all segments with their respective folder structure uploaded to supabase' ,  
      'Thumbnail as poster is uploaded to cloudinary',
      'In end DB is updated with "completed" status and thumnail url'
    ]
  } , {
    name : 'Real Time Communication',
    description : 'Live Stream & Video Conference using WebRTC & Socket.io',
    flowDiagram: [
      {color:'bg-purple-800' , mainText: 'User join' , secText: 'Room session' , icon :User2Icon},
      {color:'bg-yellow-600' , mainText: 'Socket.io' , secText: 'Signaling channel' , icon : ArrowRightLeftIcon},
      {color:'bg-sky-600' , mainText: 'Mediasoup worker ' , secText: 'Connection Router' , icon : NetworkIcon},
      {color :'bg-orange-600', mainText: 'Rtp Capabilities' , secText: 'Device compatibility' , icon : MonitorSmartphoneIcon},
      {color:'bg-green-800' , mainText : 'Transport' , secText : 'Handles connection to router' , icon : TruckElectricIcon}, 
      {color:'bg-cyan-600' , mainText: 'Producer ' , secText: 'Publishs Media' , icon : ImageUpIcon},
      {color:'bg-red-600' , mainText : 'Server Room store' , secText : 'Handles the room metadata' , icon : ClipboardPenLine}, 
      {color:'bg-lime-600' , mainText : 'Consumer' , secText : 'Request Rtp and build Transp.' , icon : GitCompareArrowsIcon},
      {color:'bg-blue-600' , mainText : 'Consume' , secText : 'Subsribe to the stream ', icon : ImageDownIcon } ,
      {color:'bg-pink-600' , mainText: 'Live Connection ' , secText: 'peer- SFU - peer' , icon : LucideView}, 
    ] ,
    process : [
      'User connects to server and a socket connection is established with proper jwt auth checks which servers as main signaling channel.' ,
      'User request to create a meeting room with required credentials like password or id.' ,
      'Server creates a mediasoup worker' ,
      'A router is intialized which handles all the media tracks, codecs and its routing' ,
      'User request for rtp capablities to router which provides media codecs for device compatiablity and consistencies.' ,
      'Mediasoup client loads capablities to Mediasoup Client Device' ,
      'This device requests a Send transport and router creates a new transport connection using using ICE and DTLS' , 
      "The transport is used then to produce data channels for audio and video tracks." ,    
      'Mediasoup assigns producerId to each track , get emitted into server and stored in room metadata on server' ,
      'New user joins the room ' ,
      'They follow similar protocol for stting up their own upstreams.',  
      'For consumption , the client requests the producers lists' ,
      'Server sends producer IDs',
      'Client creates consumers for each producer',
      'Client signals to resume consumers and starts receiving the tracks' ,
      'A mediastream is created from tracks and fed into Videojs to create visuals.' ,  
    ] ,
    stack : [
      {name : 'Webrtc' , content : 'Mediasoup'},
      {name : 'Signalling' , content : 'socket.io'},
      {name : 'Stream Read' , content : 'Video.js'}, 
    ] ,
    responsiblities : [
      {name : 'Mediasoup' , content : 'Handles webrtc router, transports , producers, consumers and transmission'},
      {name : 'Socket.io' , content : 'Handles signalling'},
      {name : 'Video.js' , content : 'Handles stream read'},
      {name: 'transport' , content : 'Handles the pathway between client and router and media transmission'},
      {name: 'rtp Capabilities' , content : 'Define the media codecs and compatibility headers of media transmission that the router can handle'}, 
      {name : 'Producer' , content : 'Creates a upstream data channel for media to router'}, 
      {name : 'Consumer' , content : 'Subscribe to producer & creates a donstream data channel.'},
      {name : 'Room Store' , content : 'Maintains the room metadata and producer-consumer mapping'},
      {name : 'DTLS Paramaters' , content : 'Used for validation handshake between server and client and encrypted media transmission '},   
    ]
  } , {
    name : 'Notification Workflow',
    description : 'Real Time and presistent notifications for user actions',
    flowDiagram : [
      {color : 'bg-cyan-600' ,mainText : 'User Action' , secText : 'Like/Mention/Follow' , icon : HandIcon},
      {color : 'bg-red-600' ,mainText : 'Controller-service' , secText : 'Validates & Processes' , icon : CogIcon},
      {color : 'bg-blue-600' ,mainText : 'DB Layer' , secText : 'Store Notification' , icon : DatabaseZapIcon},
      {color : 'bg-yellow-800' ,mainText : 'Event Service' , secText : 'Emit Socket Notification' , icon : NavigationIcon},
      {color : 'bg-purple-600' ,mainText : 'Client' , secText : 'Update Ui' , icon : MonitorSmartphoneIcon},
    ] ,
    responsiblities : [
      {name : 'Service' , content: 'Triggers on user event'} ,
      {name : 'DB' , content: 'Stores notifications'} ,
      {name : 'Event Service' , content: 'Create & emit Socket events'} , 
      {name : 'Client' , content: 'Receives & Update UI'} ,
    ] ,
    process : [
      'User like or mention a post' ,
      'Controller service validates the request and then calls service which  creates notification and updates DB' ,
      'Event serice is called which emits a Notification socket event to required connected clients' ,
      'End User is updated with the new notification' ,
    ] ,
    stack : [
      {name : 'Events' , content : 'Socket.io'},
      {name : 'Notification' , content : 'MongoDB Atlas'},
    ]
  } , {
    name : 'CI/CD Flow' ,
    description : 'Automatic testing and deployment using Github Actions' ,
    flowDiagram : [
      {color : 'bg-purple-800' , mainText : 'Development Push' , secText : 'Git Content' , icon :UploadIcon},
      {color : 'bg-yellow-600' , mainText : 'Github Actions' , secText : 'CI Pipeline' , icon : GithubIcon},
      {color : 'bg-sky-600' , mainText : 'Install Dependencies' , secText : '' , icon : DownloadIcon}, 
      {color : 'bg-sky-600' , mainText : 'Run Tests' , secText : 'Jest+ SuperTest' , icon : TextSelectionIcon},
      {color : 'bg-red-600' , mainText : 'Build' , secText : 'Vite Build' , icon : PackageIcon},
      {color : 'bg-green-600' , mainText : 'Deploy' , secText : 'Hosting/Server' , icon : ServerCogIcon},
    ] ,
    process : [
      'User pushes code to github' ,
      'Github actions detects the changes and triggers the pipeline' ,
      'Pipeline runs tests and checks for the potentials errorrs' ,
      'If no errors are found , different production build is created' , 
      'Build is deployed to hosting' ,
    ] ,
    stack : [
      {name : 'Github Actions' , content : 'Github , NodeJS , Vite '},
      {name : 'Testing' , content : 'Jest , SuperTest'},
      {name : 'Hosting' , content : 'Vercel, Render'},
    ] ,
    responsiblities : [
      {name : 'Github Actions' , content : 'Looks for changes and triggers the test pipeline'}, 
      {name : 'Jest , supertest' , content : 'Creates and runs predefined tests & flags inconsistencies before deplyoment.'},  
      {name : 'Vercel , Render' , content : 'Hosts the production application.'},
    ]
  } 



]

function ArchitectureTab() {
  const [selectedFlow , setSelectedFlow] = useState('Request Flow') ;
  
  function selectFlow(flow){
    if(selectedFlow === flow) return setSelectedFlow('') ;
    setSelectedFlow(flow) ;
  }
  return (
    <div className='w-full h-full md:mx-0 border md:p-8 p-2 pl-5 z-10  fade-in backdrop-filter backdrop-blur-sm rounded-lg bg-black/80 text-white md:mt-16 sm:mt-20 mt-24 duration-200'> 
      Architecture
      {flows.map(e => (
        <div onClick={() => selectFlow(e.name)} className=' cursor-pointer'>
          <Flow isSelected={selectedFlow === e.name} flow={e} title={e.name} description={e.description}/> 
        </div>
      ))}
    </div>
  )
}

export default ArchitectureTab


function Flow({isSelected , title , description , flow}){
  console.log(flow);
  
  return (
    <div className={`flex flex-col text-white transistion-all`}>         
      <h1 className='font-bold md:text-3xl text-2xl  items-center gap-2 relative mb-2'>
        <ChevronRightIcon size={25} strokeWidth={4} className={`${isSelected ? ' rotate-90' : ''} absolute -left-6 top-2 duration-200`}/>
        {title}
        <p className='text-sm font-semibold'>{description}</p>
      </h1>
      
      <div className={`grid transition-all duration-300 ease-linear ${isSelected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}> 
        <div className='flex md:flex-row flex-col gap-2 overflow-hidden'>
          {/* Flow Diagram */}
          <div className='  p-2 md:max-h-[800px] flex md:flex-col overflow-y-scroll md:w-1/2 w-full '> 
            {flow.flowDiagram.map(({color , mainText , secText , icon}, i) => (
              <FlowBox bgcolor={color} mainText={mainText} secText={secText} Icon={icon} isLast={i === flow.flowDiagram.length-1}  /> 
            ))}
          </div>

          <div className=' h-full p-2  min-w-1/2 shrink-1'>
            <h3 className='text-2xl font-[600] mt-2'>Responsiblities :</h3> 
            <ul className='list-disc md:text-lg text-[14px] ml-2'>
              {flow.responsiblities.map(({name , content}) => (
                <li className='text-md '><span className='font-semibold text-green-400'>{name} : </span> {content}</li> 
              ))}
            </ul>
            <h3 className='text-2xl font-[600] mt-2'>Process :</h3> 
            <ol className='list-disc md:text-lg text-[14px]  ml-2'>
              {flow.process.map((e) => (
                <li className='text- font-semibold'>{e}</li> 
              ))}

            </ol>
            <h3 className='text-2xl font-[600] mt-2'>Stack :</h3> 
            <ul className='list-disc text-lg ml-2'>
              {flow.stack.map(({name , content}) => (
                <li className='text-sm '><span className='text-green-400'>{name} : </span> {content}</li> 
              ))}
            </ul>
            
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowBox({mainText , bgcolor , secText , Icon , isLast}){
  return (
    <div className=' w-full rounded-md p-1 flex md:flex-col flex-row items-center'>
      <div className={`flex justify-center gap-2 ${bgcolor} rounded-md h-16 min-w-52 w-full `}>
        <Icon size={28} className='h-full' />
        <div className=' text-center my-auto '>
          <h1 className='text-md font-semibold'>
            {mainText}
          </h1>
          <p className='text-sm'> {secText}</p>
        </div>
      </div>
    {!isLast && <DownArrow />}
    </div>

  )
}