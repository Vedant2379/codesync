import { Schema , models , model } from 'mongoose'

const NotificationSchema = new Schema({
    sender : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    receiver : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    body : {
        type : String,
        required : true
    },
    rating : {
        type : Number,
    },
    toAdmin : {
        type : Boolean,
        default : true,
    },
    read : {
        type : Boolean,
        default : false,
    }
},{
    timestamps : true
})

const Notification = models.Notification || model('Notification' , NotificationSchema)

export default Notification