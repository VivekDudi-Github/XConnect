import { io } from "../app.js";

const emitEvent = (eventName, room, data) => {
  if (!eventName || !room) {
    console.warn("emitEvent: Missing eventName or room.");
    return;
  }
  console.log( eventName ,'emiited');
  
  io.to(room).emit(eventName, data);
};

export { emitEvent };

