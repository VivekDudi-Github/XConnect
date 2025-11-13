import { io } from "../app.js";

const emitEvent = (eventName,  room , id = [] , data) => { 
  if (!eventName || !room) {
    console.warn("emitEvent: Missing eventName or room.");
    return;
  }
  console.log( eventName , id ,'emiited');
  
  if (id.length > 0 ){
    id.forEach( i => io.to(`${room}:${id}`).emit(eventName , data)); 
  }
};

export { emitEvent };

