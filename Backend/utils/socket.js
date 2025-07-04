import { io } from "../app";

const EventEmitter = ( EventName ,room , data )=> {
  io.to(room).emit(EventName , data)
} ;

export { EventEmitter}