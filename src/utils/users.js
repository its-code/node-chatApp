const users = []

// addUser , removeUser , getUser , getUsersInRoom

const addUser = ({id,username,room})=>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: "Username and Room should be provided!"
        }
    }
    // check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error : "Username is already in use!"
        }
    }

    // Store the user
    const user = { id,username,room }
    users.push(user)
    return { user }  
}

const removeUser = (id)=>{
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id)=>{
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter(user => user.room === room)
}
 
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}