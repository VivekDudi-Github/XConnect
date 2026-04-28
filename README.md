# XConnect 🚀  
XConnect is a scalable real-time social platform with live streaming (WebRTC SFU),
chunked video processing (FFmpeg + HLS), and event-driven architecture.

![Live Stream GIF](./docs/gifs/LiveDemoShort.gif)
*Real-time live streaming with WebRTC SFU and instant SuperChat payments*


It enables users to connect, stream live, upload media, send superchats, receive real-time notifications, and interact through secure and scalable architecture.

---

## Live Links 
- 🌐 Live App: https://xconnect.vercel.app/
- 📘 API Docs (Swagger): <your-swagger-url>

---


## Demo
### Media Upload 
![Media Upload GIF](./docs/gifs/MediaUploadDemoShort.gif)
</br>
*Resumable media uploads, multi quality video and thumbnail generation using FFmpeg*  

### Meeting 
![Meeting GIF](./docs/gifs/MeetingDemoShort.gif)
</br>
*Multi-user video conferencing with mediasoup SFU and simulcast support*

## Core System Features

- Real-time streaming via WebRTC SFU
- Chunked video upload + FFmpeg processing (HLS) 
- Event-driven notifications using sockets
- SuperChat payments via Stripe
- Meeting and call with mediasoup SFU with simulcast support
- Swagger Documentation

## Platform Features

- Posts, likes, comments
- Follow system
- User profiles & communities
---

## High-Level Architecture Diagram
```
            Client (React)
                 │
     ┌───────────┼───────────┐
     │           │           │
 REST API    Socket.io    Media Pipeline
 (Express)   (Realtime)   (FFmpeg)
     │           │           │
  MongoDB     Mediasoup    HLS + Storage
                │
           Stripe / Cloudinary
```
### [More Detailed Architecture Link](./docs/architecture.md)  
----

## UI and System Preview
  <div align="center">
    <p><b>Analytics Dashboard</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>User Profile</b></p>
    <img src="./docs/screenshots/Dashboard.png" width="45%" />
    <img src="./docs/screenshots/ProfilePage.png" width="45%" />
  </div>
  <div style="height:2px; background-color: #444; width: 100%; margin: 20px 0px;"></div>
  <div align="center" style="margin-top: 0px;">
    <p><b>Mobile Post View</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>API Documentation (Swagger)</b></p>
    <img src="./docs/screenshots/PostMobile.png" width="25%" style="margin-right: 20px;" />
    <img src="./docs/screenshots/SwaggerDocs.png" width="65%" />
  </div>


##  Tech Stack

| Area              | Tech                                                             |
|-------------------|------------------------------------------------------------------|
| Frontend          | React , Tailwind Css, Redux Toolkit , RTK Query , Vite , Video.js |
| Backend           | Node.js , Express , Mongo Atlas , Mongoose                       |
| Real-Time Comms   | Mediasoup , Socket.io , WebRTC                                   |
| Media Processing  | Multer , FFmpeg , HLS                                            |
| Payments          | Stripe                                                           |
| Storage           | Cloudinary , Supabase                                            |  
| Security          | Helmet, CORS, Rate Limiting, JWT, Http only Cookies, Zod         |
| Backend Testing   | supertest + Jest                                                 |
| Dev Ops           | GitHub , Vercel , AWS t2                                         |
| API Docs          | Swagger                                                          |

---



## Project Structure

```text
XConnect
  │
  ├── Backend
  │   ├── controllers
  │   ├── routes
  │   ├── models
  │   ├── middleware
  │   ├── utils
  │   ├── tests
  │   ├── server.js
  |   ├── swagger.js
  │   └── app.js
  │
  ├── Frontend
  │   ├── src
  │       ├── components
  |       ├── layout
  |       ├── constants
  │       ├── pages
  │       ├── redux
  |       ├── api
  |       ├── main.jsx
  │       └── app.jsx
  │
  └── README.md
  ```
---

## Installation

Clone the repository
```text
git clone https://github.com/VivekDudi-Github/Xconnect.git
cd xconnect
```
Backend :
```text
cd Backend
npm install
npm run dev
```

For Stripe 
```text
stripe listen --forward-to localhost:3000/api/v1/stripe/webhook
```
Frontend :
```text
cd Frontend
npm install
npm run dev
```
### Running tests
```text
cd Backend
npm run test
```
---
## Environment Variables
```text
Backend:
PORT=
MONGO_URL=
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_SECRET_EXPIRES_IN=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_SECRET_EXPIRES_IN=

PUBLISHABLE_STRIPE_KEY=
STRIPE_SECRET_KEY=
WEBHOOK_KEY=

SUPABASE_URL=
SUPABASE_API_KEY=
SUPABASE_VIDEO_BUCKET
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Frontend:
VITE_STRIPE_PUBLISHABLE_KEY=
```
---

## Future Improvements

- Creator payout system
- Advanced analytics
- Scalable media workers
- SVC suppport on mediasoup
- Redis caching

---

## Detailed Features list

### Authentication
- JWT-based login and secure cookies
- Refresh and access token system
  
### Social Platform
- Create and manage posts
- Follow - unfollow & like comment
- Personalized feed system

### Media Upload
- Chunked video upload
- FFmpeg processing
- HLS streaming
- Dedicated bucket storage

### Real-Time Communication
- WebRTC live streaming
- Mediasoup SFU
- Socket.io signaling 
- Real Time Chats
- Video.js playback

### Notifications
- Real-time socket notifications
- Persistent notification storage

### SuperChat
- Stripe payment integration
- Live stream superchat messages

### Security
- Rate limiting , Helmet , CORS and global error handling

### DevOps
- GitHub Actions CI with automated testing
- Deployment pipeline


## Author

Vivek Dudi

GitHub: https://github.com/VivekDudi-Github
LinkedIn: VivekDudi-LinkedIn

---