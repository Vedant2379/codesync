import { Schema , models , model } from 'mongoose'

const TeamSchema  = new Schema({
    teamName : {
        type : String,
        required : true
    },
    codeforcesHandles : [
        {
            type : String
        }
    ]
},{
    timestamps : true
})

const Team = models.Team || model('Team' , TeamSchema)

export default Team