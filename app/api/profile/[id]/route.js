import connectDB from "@/config/database"
import Team from "@/models/Team"
import User from "@/models/User"


export const GET = async (request , { params }) => {
    try {
        await connectDB()
        const { id } = params
        if(!id){
            return new Response(JSON.stringify({ message : 'Unauthorized' , ok : false }) , { status : 401 })
        }
        const user = await User.findById(id)

        if(!user){
            return new Response(JSON.stringify({ message : 'No such user exists' , ok : false }) , { status : 400 })
        }

        const { codeforcesId } = user

        const teams = await Team.find({ codeforcesHandles : { $in : [codeforcesId] }})

        return new Response(JSON.stringify({ message : 'User found' , ok : true , codeforcesId , teams }) , { status : 200 })

    } catch (error) {
        console.log(error)
    }
}

export const PUT = async (request , { params }) => {
    try {
        await connectDB()
        const { id } = params
        if(!id){
            return new Response(JSON.stringify({ message : 'Unauthorized' , ok : false }) , { status : 401 })
        }
        const user = await User.findById(id)

        if(!user){
            return new Response(JSON.stringify({ message : 'No such user exists' , ok : false }) , { status : 400 })
        }

        const data = await request.json()
        user.codeforcesId = data.codeforcesId

        await user.save()

        return new Response(JSON.stringify({ message : 'ID updated successfully' , ok : true }) , { status : 200 })
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ message : 'Could not update ID' , ok : false}) , { status : 500 })
    }
}