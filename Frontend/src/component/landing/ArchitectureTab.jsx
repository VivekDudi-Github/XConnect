import { ArrowRightLeftIcon, BlocksIcon, BoxIcon, ChartNetworkIcon, ChevronRightIcon, ClipboardPenLine, CloudUploadIcon, CogIcon, CookieIcon, DatabaseZapIcon, DownloadIcon, FileOutputIcon, FileVideoIcon, GitCompareArrowsIcon, GithubIcon, Grid2X2Icon, GridIcon, Hand, HandIcon, icons, ImageDownIcon, ImagePlayIcon, ImageUpIcon, LayoutDashboardIcon, ListTodoIcon, LoaderIcon, LucideDatabaseZap, LucideFileOutput, LucideLoader, LucideNewspaper, LucideVideotape, LucideView, MonitorSmartphoneIcon, NavigationIcon, NetworkIcon, PackageIcon, PackageOpenIcon, PanelBottomCloseIcon, PanelsLeftRightIcon, PickaxeIcon, Plug2Icon, RocketIcon, SendToBack, ServerCogIcon, ShieldCheckIcon, SquareSplitVerticalIcon, TextSelectionIcon, TrendingUpDown, TruckElectricIcon, UnplugIcon, UploadCloudIcon, UploadIcon, User2Icon, UserCheck, VideoIcon } from 'lucide-react'
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
    name: 'Media Upload Flow',
    description: 'Handles video uploads with secure storage and background processing',

    flowDiagram:[
      {
        color:'bg-purple-800',
        mainText:'Client Select',
        secText:'Video file',
        icon:ImagePlayIcon
      },
      {
        color:'bg-yellow-600',
        mainText:'Initiate API',
        secText:'Create upload session',
        icon:PanelsLeftRightIcon
      },
      {
        color:'bg-sky-600',
        mainText:'Chunk Upload',
        secText:'Resumable Multipart',
        icon:Grid2X2Icon
      },
      {
        color:'bg-red-600',
        mainText:'Multer',
        secText:'Validate & Store Chunks',
        icon:PanelBottomCloseIcon
      },
      {
        color:'bg-blue-600',
        mainText:'Controller',
        secText:'Integrity Checks',
        icon:SendToBack
      },
      {
        color:'bg-gray-600',
        mainText:'BullMQ Queue',
        secText:'Create Processing Job',
        icon:ListTodoIcon
      },
      {
        color:'bg-indigo-600',
        mainText:'Worker',
        secText:'Background Processor',
        icon:CogIcon
      },
      {
        color:'bg-pink-600',
        mainText:'Child Process',
        secText:'Spawn FFmpeg',
        icon:LoaderIcon
      },
      {
        color:'bg-slate-600',
        mainText:'FFmpeg',
        secText:'Merge + Transcode',
        icon:VideoIcon
      },
      {
        color:'bg-orange-600',
        mainText:'HLS Output',
        secText:'m3u8 + Segments',
        icon:FileOutputIcon
      },
      {
        color:'bg-purple-600/50',
        mainText:'Cloud Upload',
        secText:'Supabase Storage',
        icon:CloudUploadIcon
      },
      {
        color:'bg-teal-600',
        mainText:'DB Update',
        secText:'Completed Status',
        icon:DatabaseZapIcon
      },
    ],

    process:[
      'For images: User uploads → Multer validates → Controller → Cloudinary → DB URL update',

      'User initiates video upload',

      'Client sends metadata to Initiate API',

      'Server validates size/type, calculates chunks, creates MongoDB upload record',

      'Client slices video and uploads chunks',

      'Multer validates chunks and stores temporarily',

      'Controller verifies missing chunks and updates status to processing',

      'A BullMQ job is created for video processing',

      'BullMQ worker picks the job asynchronously',

      'Worker merges uploaded chunks into final video file',

      'Child process starts FFmpeg worker',

      'FFmpeg generates thumbnail, compresses video and creates multiple resolutions',

      'FFmpeg creates HLS streams (360p, 480p, 720p) with m3u8 playlists',

      'Generated HLS folders and segments are uploaded to Supabase',

      'Thumbnail is uploaded to Cloudinary',

      'Database is updated with completed status, playback URL and thumbnail URL'
    ],
    responsiblities:[
      {
        name:'Multer',
        content:'Handles chunk receiving, validation, temporary storage and file checks'
      },
      {
        name:'BullMQ',
        content:'Manages background video processing jobs and prevents blocking API requests'
      },
      {
        name:'FFmpeg',
        content:'Handles merging, encoding, HLS segmentation, resolutions and thumbnails'
      },
      {
        name:'Supabase',
        content:'Stores processed HLS videos and provides CDN delivery'
      },
      {
        name:'Cloudinary',
        content:'Stores thumbnails and image assets'
      }
    ],

    stack:[
      {
        name:'Upload Handling',
        content:'Multer'
      },
      {
        name:'Queue System',
        content:'BullMQ + Redis'
      },
      {
        name:'Video Processing',
        content:'FFmpeg + Node Child Process'
      },
      {
        name:'Storage',
        content:'Supabase + Cloudinary'
      },
      {
        name:'Database',
        content:'MongoDB'
      }
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
  name: 'CI/CD Flow',
  description: 'Automatic testing, containerization and deployment using Github Actions',

  flowDiagram: [
    {
      color: 'bg-purple-800',
      mainText: 'Code Push',
      secText: 'Git Repository',
      icon: UploadIcon
    },
    {
      color: 'bg-yellow-600',
      mainText: 'Github Actions',
      secText: 'CI Trigger',
      icon: GithubIcon
    },
    {
      color: 'bg-blue-600',
      mainText: 'Checkout Code',
      secText: 'Clone Repository',
      icon: DownloadIcon
    },
    {
      color: 'bg-cyan-600',
      mainText: 'Install Packages',
      secText: 'npm / pnpm',
      icon: PackageOpenIcon
    },
    {
      color: 'bg-indigo-600',
      mainText: 'Quality Checks',
      secText: 'Lint + Jest + SuperTest',
      icon: ShieldCheckIcon
    },
    {
      color: 'bg-orange-600',
      mainText: 'Docker Build',
      secText: 'Create Images',
      icon: BoxIcon
    },
    {
      color: 'bg-purple-600',
      mainText: 'Push Images',
      secText: 'Docker Registry',
      icon: UploadCloudIcon
    },
    {
      color: 'bg-red-600',
      mainText: 'Deploy Config',
      secText: 'Compose + Nginx',
      icon: ServerCogIcon
    },
    {
      color: 'bg-green-600',
      mainText: 'Production Online',
      secText: 'Containers Running',
      icon: RocketIcon
    }
  ],

  process: [
    'Developer pushes code changes to Github repository',

    'Github Actions detects the push event and starts the CI pipeline',

    'Pipeline checks out the latest source code',

    'Installs project dependencies and restores cache if available',

    'Runs linting, unit tests and API integration tests',

    'If checks pass, starts Docker image build process',

    'Creates production images: Frontend, Backend, Nginx & Redis ',

    'Tags and pushes Docker images to Docker Hub / Container Registry',

    'Uploads deployment configuration including docker-compose.yml and nginx.conf',

    'Production server pulls the latest images',

    'Docker executes the compose files & creates and starts all containers', 

    'Nginx starts reverse proxy routing',

    'Health checks verify services are running successfully'
  ],

  stack: [
    {
      name: 'CI/CD',
      content: 'Github Actions, Github Repository'
    },
    {
      name: 'Testing',
      content: 'Jest, SuperTest, ESLint'
    },
    {
      name: 'Containerization',
      content: 'Docker, Docker Compose'
    },
    {
      name: 'Registry',
      content: 'Docker Hub'
    },
    {
      name: 'Deployment',
      content: 'AWS EC2 / Cloud Server'
    },
    {
      name: 'Reverse Proxy',
      content: 'Nginx'
    }
  ],

  responsiblities: [
    {
      name: 'Github Actions',
      content: 'Automates checkout, testing, building and deployment workflows.'
    },
    {
      name: 'Jest + SuperTest',
      content: 'Runs automated tests and prevents broken builds from reaching production.'
    },
    {
      name: 'Docker',
      content: 'Packages frontend, backend and infrastructure services into isolated containers.'
    },
    {
      name: 'Docker Compose',
      content: 'Defines and starts multi-container production environments.'
    },
    {
      name: 'Docker Hub',
      content: 'Stores versioned production container images.'
    },
    {
      name: 'Nginx',
      content: 'Handles SSL termination, reverse proxying, static files and API routing.'
    },
    {
      name: 'AWS',
      content: 'Provides production hosting infrastructure for running containers.'
    }
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