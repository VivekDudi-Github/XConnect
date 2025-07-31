import mongoose from 'mongoose'

const UserRoomMetaSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    lastVisit: {
        type: Date,
        default: Date.now
    }
}, {timestamps : true})

export const UserRoomMeta = mongoose.model('UserRoomMeta' , UserRoomMetaSchema)