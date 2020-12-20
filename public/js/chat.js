const socket = io()

// Elements for Message Form
const $messageForm = document.querySelector('#message-form')
const $messageInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
// Elemenrs for Geo-Location 
const $geoLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Elements for templates
const renderMessage = document.querySelector('#render-message-template').innerHTML
const renderLocation = document.querySelector('#send-location-template').innerHTML
const renderSiderbar = document.querySelector('#sidebar-template').innerHTML

// Options
const { username,room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// AutoScroll

const autoScroll = ()=>{
    //Getting new Message Element
    const $newElement = $messages.lastElementChild

    //Height of the new Message
    const newMessageStyle = getComputedStyle($newElement)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newElement.offsetHeight + newMessageMargin

    // Visible Height of conatiner
    const visibleHeight = $messages.offsetHeight

    // Height of Messages Container
    const containerHeight = $messages.scrollHeight
    // How far i have scrolled
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message)=>{
    const html = Mustache.render(renderMessage, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})


socket.on('LocationMessage', (url)=>{
    const html = Mustache.render(renderLocation, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', ({ room, users })=>{
    const html = Mustache.render(renderSiderbar,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    
    $messageFormButton.setAttribute('disabled', 'disabled')

    let message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()
        if(error){
            return console.log(error)
        }

        console.log("Your Message is Devlivered!")
    }) 
    e.preventDefault()
})

$geoLocation.addEventListener('click', ()=>{
    

    if(!navigator.geolocation){
        alert("Your browser doesn't support Geo-Location")
    }

    $geoLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{        
        socket.emit('sendLocation', { 
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (locStatus)=>{
            $geoLocation.removeAttribute('disabled')
            console.log(locStatus)
        })
    })
})

socket.emit('join', {username,room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})