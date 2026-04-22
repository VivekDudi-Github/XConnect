# XConnect System Architecture
XConnect is a modular full-stack real-time social platform built using MERN stack, WebRTC, and distributed media processing architecture. The system separates frontend, backend, media processing, and real-time communication into independent components to ensure scalability, security, and performance.


# XConnect Architecture

## Overview

XConnect is a full-stack real-time social media and live streaming platform built using a modular and scalable architecture. The system integrates REST APIs, WebRTC-based streaming, real-time communication, and media processing pipelines.

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
Client (React)
   │
   ├── REST API (Express)
   │       ├── Modules
   │            ├── Controller
   │            ├── Validators
   │            ├── Services
   │            └── Database (MongoDB)
   │
   ├── Socket.io (Real-Time Layer)
   │       └── Mediasoup (WebRTC SFU)
   │
   ├── Storage
   │       ├── Supabase (Videos)
   │       └── Cloudinary (Images)
   │
   └── External Services
           └── Stripe (Payments)
```

---

## Request Flow

### Description

Handles all standard API interactions between client and server.

### Flow

1. Client sends request via RTK Query or fetch
2. Express routes request to controller
3. Controller sends to validator to validate input using Zod 
4. Service layer processes business logic
5. Database (MongoDB) is queried or updated
6. Response is returned to client

### Key Components

* Controller: Request validation and routing
* Service: Business logic
* DB Layer: Data persistence
* Middleware: Auth, Structured Logging & error handling

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
2. User initiates upload
3. File type and size are send to Initate Api which size check, calculates the total required chunks , intiate the new MongoDB record and return to client
4. Client slices the video into chunks and uploads one by one.
5. Backend creates upload session and metadata
6. Client splits video into chunks
7. Multer middleware check size limit and stores into temeporalry local storage
8. After completion , controller checks for missing parts, change DB status to "processing" and initiates the merge process.
9. FFmpeg processes video:

   * Generates thumbnail
   * Creates multiple resolutions
   * Generates HLS segments and playlists
10. Processed files uploaded to Supabase
11. Thumbnail uploaded to Cloudinary
12. Database updated with final status and URLs

### Key Components

* Multer: File handling
* FFmpeg: Video processing
* HLS: Streaming format
* Supabase: Video storage
* Cloudinary: Image storage

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
7. Producer sends audio/video tracks
8. Producer IDs stored in room metadata
9. New users request producer list
10. Consumers are created for each producer
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

1. Code pushed to GitHub
2. GitHub Actions triggers pipeline
3. Dependencies installed
4. Tests executed (Jest + Supertest)
5. Build process runs
6. Application deployed

### Key Components

* GitHub Actions: Automation
* Jest: Testing
* Supertest: API testing
* Vercel / Render: Deployment

---

## Deployment Architecture

### Frontend

* Hosted on Vercel
* Static assets served via CDN

### Backend

* Hosted on Azure
* Handles API and WebSocket connections

### Database

* MongoDB Atlas (cloud database)

### Storage

* Supabase (video on demand files)
* Cloudinary (images)

---

## Future Improvements

* Creator payout system (Stripe Connect)
* Redis caching layer
* Horizontal scaling for media workers
* Kubernetes deployment
* Advanced analytics dashboard
* Multi-region streaming support

---

## Summary

XConnect follows a modular architecture combining:

* REST APIs for standard operations
* WebRTC SFU for real-time streaming
* Event-driven systems for notifications
* Pipeline-based media processing
* External services for payments and storage

This design ensures scalability, maintainability, and real-time performance.
