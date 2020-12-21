const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { messageGenerator, generateLocationMessage } = require('./utils/messages')
const { addUser,removeUser,getUser,getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)

const io = socketio(server)

const port = process.env.PORT || 3000
const publicPathDir = path.join(__dirname,'../public')

app.use(express.static(publicPathDir))

io.on('connection', (socket)=>{
    socket.on('join', (options, callback)=>{
        
        const { error,user } = addUser({ id:socket.id, ...options })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', messageGenerator('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', messageGenerator('Admin',`${user.username} has Joined :)`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room) 
        })

        callback()
    })

    socket.on('typing', (data)=>{
        // console.log(data)
        if(data.typing==true)
           io.emit('display', data)
        else
           io.emit('display', data)
     })

    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profane Langugae is not allowed!')
        }

        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('message',messageGenerator(user.username,message))
            callback('Delivered')
        }
    })

    socket.on('sendLocation', (location, callback)=>{

        const user = getUser(socket.id)
        
        if(user){
            io.to(user.room).emit('LocationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
            callback('Location Shared')
        }
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',messageGenerator('Admin',`${user.username} has left :(`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, ()=>{
    console.log("Successfully running on Port "+port)
})