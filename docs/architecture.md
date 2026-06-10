# XConnect Architecture

## Overview

The architecture is divided into:

* Frontend (React)
* Backend API (Node.js + Express)
* Real-Time Layer (Socket.io + Mediasoup)
* Media Processing Pipeline (FFmpeg + HLS)
* Storage & CDN (Supabase + Cloudinary)
* Payment System (Stripe)
* DevOps & CI/CD

---

## High-Level Architecture

```
                     ┌────────────────────┐
                     │       Client       │
                     │      (React)       │
                     └─────────┬──────────┘
                               │
                         HTTPS / WSS
                               │
                     ┌─────────▼──────────┐
                     │      Nginx         │
                     │   Reverse Proxy    │
                     │   SSL / Routing    │ 
                     └─────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
      ┌────────────────┐ ┌────────────────┐ ┌──────────────────┐
      │ Express REST   │ │ Socket.io      │ │ Mediasoup router │
      │ API            │ │ Real-time      │ │ WebRTC SFU       │
      │                │ │                │ │ Mediasoup        │
      └───────┬────────┘ └───────┬────────┘ └──────────────────┘
              │                  │
              ▼                  ▼
      ┌───────────────────────────────────┐
      │            Backend Modules        │
      │ Router                            │
      │ Controller                        │
      │ Validators                        │
      │ Services                          │
      └───────────────┬───────────────────┘
                      │
             ┌────────▼────────┐
             │  MongoDB Atlas  │
             └─────────────────┘
```
### Media Pipeline:
```

 Upload
   │
   ▼
BullMQ Queue
   │
   ▼
  Redis
   │
   ▼
FFmpeg Workers
   │
   ├── HLS/DASH Output
   │
   ├── Supabase Storage (Video)
   │
   └── Cloudinary (Images)

``` 
### External:
```
Stripe Payments
```
### Infrastructure:
```
┌──────────────────────────────────┐
│ Docker                           │
│                                  │
│ Containers:                      │
│ - nginx                          │
│ - Nodejs Server                  │
│ - Redis                          │
└──────────────────────────────────┘
```

---

## Request Flow

### Description

Handles all standard API interactions between client and server.

### Flow

1. Client sends request via RTK Query or fetch
2. The request reaches the Aws EC2 server with docker   
3. Ngnix in docker listens to http & https requests & forwards them to the nodejs containers
2. Express gets it & routes request to controller
3. Controller sends to validator to validate input using Zod 
4. Service layer processes business logic
5. Database (MongoDB) is queried or updated
6. Response is returned to client

### Key Components

* Controller: Request validation and routing
* Service: Business logic
* DB Layer: Data persistence
* Middleware: Auth, Structured Logging & error handling
* Docker: Containerization
* Nginx: Reverse proxy, load balancing & SSL
---

## Authentication Flow

### Description

Handles secure login, session management, and protected routes.

### Flow

1. User submits email and password
2. Controller validates credentials
3. Database is queried for user
4. Password is verified using bcrypt
5. JWT access and refresh tokens are generated
6. Refresh token is hashed and stored in DB
7. Tokens are sent via HTTP-only cookies
8. Now middleware can verify these token for protected routes

### Key Components

* JWT: Authentication tokens
* Bcrypt: Password hashing
* Cookies: Secure storage
* Middleware: Route protection

---

## Media Upload Flow

### Description

Handles large video uploads with chunking , processing and cloud storage .

### Flow

1. For Images- User > Multer size & type checks > Controller > Cloudinary > DB URL Update (Images uploades are straight forward)
2. For videos- User initiates upload
3. File type and size are send to Initate Api which size check, calculates the total required chunks , intiate the new MongoDB record and return to client
4. Client slices the video into chunks and uploads one by one.
5. Backend creates upload session and metadata
6. Client splits video into chunks
7. Multer middleware check size limit and stores into temeporalry local storage
8. After completion , controller checks for missing parts, change DB status to "processing" 
9. BullMQ queues the job to FFmpeg process
10. FFmpeg processes video:

   * Generates thumbnail
   * Creates multiple resolutions
   * Generates HLS segments and playlists
11. Processed files uploaded to Supabase
12. Thumbnail uploaded to Cloudinary
13. Database updated with final status and URLs

### Key Components

* Multer: File handling
* FFmpeg: Video processing
* HLS: Streaming format
* Supabase: Video storage
* Cloudinary: Image storage
* BullMQ: Background processing

---

## Real-Time Communication

### Description

Implements live streaming and video communication using WebRTC with Mediasoup as SFU.

### Flow

1. Client connects via Socket.io (JWT authenticated)
2. Server creates Mediasoup worker
3. Router is initialized
4. Client requests RTP capabilities
5. Device loads capabilities
6. WebRTC transport is created (ICE + DTLS)
7. Transport sends audio/video tracks
8. Producer IDs stored in room metadata
9. New users request producer list
10. Consumers are created for every other producer in the room
11. Consumers receive tracks
12. MediaStream is rendered using Video.js

### Key Components

* Socket.io: Signaling
* Mediasoup: SFU routing
* Transport: WebRTC connection
* Producer/Consumer: Media flow
* Video.js: Playback

---

## SuperChat Payment Flow

### Description

Handles real-time user payments during live streams.

### Flow

1. User initiates SuperChat
2. Client creates payment request
3. Stripe card Checkout is triggered
4. User completes payment
5. Stripe sends webhook to server
6. Server verifies payment
7. SuperChat stored in database
8. Socket event emitted to live stream
9. Message appears in real-time

### Key Components

* Stripe: Payment processing
* Webhook: Verification
* DB: Transaction storage
* Socket.io: Real-time update

### Note

Creator payout system is not implemented yet and will be added in future.

---

## Notification Workflow

### Description

Handles real-time and persistent user notifications.

### Flow

1. User performs action (like, follow, mention)
2. Server processes event
3. Notification stored in database
4. Socket event emitted
5. Client receives notification
6. UI updates in real-time

### Key Components

* MongoDB: Storage
* Socket.io: Real-time delivery
* Client: UI updates

---

## CI/CD Flow

### Description

Automates testing, building, and deployment.

### Flow

1. Github Actions detects the push event and starts the CI pipeline. 
2. Pipeline checks out the latest source code . 
3. Installs project dependencies and restores cache if available .
4. Runs linting. unit tests and API integration tests .
5. If checks pass. starts Docker image build process .
6. Creates production images: Frontend. Backend. Nginx & Redis  .
7. Tags and pushes Docker images to Docker Hub / Container Registry .
8. Uploads deployment configuration including docker-compose.yml and nginx.conf.
9. Production server pulls the latest images.
10. Docker executes the compose files & creates and starts all containers . 
11. Nginx starts reverse proxy routing.
12. Health checks verify services are running successfully.

### Key Components

* GitHub Actions: Automation
* Jest: Testing
* Supertest: API testing
* AWS : Deployment

---

## Deployment Architecture

### Host
* Hosted on AWS EC2 
* Handles the Dockerized containers
* Handle the following containers:
  * NGINX : ServeS as frontend as static assets & reverse proxy  
  * Backend : Node.js , Express.js , Socket.io , Mediasoup , FFmpeg  
  * Redis: BullMQ & Page Caching

### Database

* MongoDB Atlas (cloud database)

### Storage

* Supabase (video on demand files)
* Cloudinary (images)

---

## Future Improvements

* Creator payout system (Stripe Connect)
* Horizontal scaling for media workers
* Kubernetes deployment
* Advanced analytics dashboard

---

## Summary

XConnect follows a modular architecture combining:

* REST APIs for standard operations
* WebRTC SFU for real-time streaming
* Event-driven systems for notifications
* Pipeline-based media processing
* External services for payments and storage

This design ensures scalability, maintainability, and real-time performance.
