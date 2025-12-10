
const socket = io().connect()
const messagesForm = document.getElementById('messagesForm')
const userEmail = document.getElementById('userEmail')
const userName = document.getElementById('userName')
const userPhone = document.getElementById('userPhone')
const userAge = document.getElementById('userAge')
const userAddress = document.getElementById('userAddress')
const userAvatar = document.getElementById('userAvatar')
const messageContent = document.getElementById('messageContent')
const messagesContainer = document.getElementById('messagesContainer')
const messagesCenterTitle = document.getElementsByClassName('messagesCenterTitle')
let receiver

//  Envio nuevo mensaje al servidor
messagesForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // La info del user se obtiene a través de un div con display=none pasado como parámetro por ejs
    newMessage = {
        author: {
            id: userEmail.innerText,
            nombre: userName.innerText,
            edad: userAge.innerText,
            direccion: userAddress.innerText,
            telefono: userPhone.innerText,
            avatar: userAvatar.innerText
        },
        text: messagesForm[0].value,
        date: new Date().toLocaleString()
    }
    const sender = userEmail.innerText
    socket.emit('newMessage', { newMessage, receiver, sender })
    messagesForm.reset()
})

const mssgsListing = (data) => {
    const msgMapping = data.map(message => {
        return `<div id='messagesDiv'>
                    <div class='userDataContainer'>
                    <div class='userImgContainer'>
                        <img style='color: #313131' class='userImg' src='${message.author.avatar}' alt='[avatar]' width='25px'>
                    </div>
                    <p style="color: #5050fb; font-size: .8rem" class='msgAuthor'>${message.author.id}</p>
                    <span style="color: brown; font-size: .8rem">[ ${message.date} ]</span>
                    </div>
                        <div class='textContainer'>
                        <i style="color: green; font-size: .9rem">=>  ${message.text}</i>
                    </div>
                </div>`
    })
    return msgMapping.join(' ')
}

const renderUsers = (users) => {
    const usersMapping = users.map(user => {
        // <input type='hidden' id='${user.userID}'></input>
        return `<div id='messagesDiv'>
                    <div class='userDataContainer'>
                        <div class='userImgContainer connUsersContainer'>
                            <p style="color: #5050fb; font-size: .9rem" class='msgAuthor'>${user.username}</p>
                            
                            <button class='sndMssgBtn'>Enviar mensaje</button>
                        </div>
                    </div>
                </div>`
    })
    return usersMapping.join(' ')
}

socket.on('connectedUsers', users => {
    messagesContainer.innerHTML = renderUsers(users)
    const sndMssgBtn = document.getElementsByClassName('sndMssgBtn')
    sendPrivateMessage(sndMssgBtn)
})

socket.on('newMessage', data => {
    const { newMessage } = data
    const mappedMsggs = mssgsListing(newMessage)
    const privateMssgs = document.getElementById('privateMssgs')
    privateMssgs.innerHTML = mappedMsggs
    privateMssgContainer.scrollTop = 9999
})

// Eventos para abrir y cerrar chat
const chatLink = document.getElementById('chatLink')
const MessagesCenter = document.getElementById('MessagesCenter')
chatLink.addEventListener('click', () => {
    MessagesCenter.style.transition = 'all .5s ease-out'
    MessagesCenter.style.transform = 'translateX(-100%)'
    messagesContainer.scrollTop = 9999
})

const closeChat = document.getElementById('closeChat')
closeChat.addEventListener('click', () => {
    MessagesCenter.style.transition = 'all .5s ease-in'
    MessagesCenter.style.transform = 'translateX(100%)'
})

// Evento mensajes privados
let privateMssgContainer
const sendPrivateMessage = (sndMssgBtn) => {
    for (let i=0;i < sndMssgBtn.length;i++) {
        sndMssgBtn[i].addEventListener('click', () => {
            receiver = sndMssgBtn[i].previousElementSibling.innerText
            const privateMssgTemplate =
                `
                <div id='privateMssgContainer' style='height: 300px; background-color: #88d285de; overflow-y: auto'>
                    <div id='closePrivateChat'>X</div>
                    <div class='privateMssgTitle'>
                        <p style='text-align: center; margin: 0' >Chat con ${receiver}</p>
                    </div>
                    <div id='privateMssgs'>
                    </div>
                </div>
                `
            const privatePopup = document.createElement('div')
            privatePopup.setAttribute('id', 'privatePopup')
            messagesContainer.append(privatePopup)
            const privateDiv = document.getElementById('privatePopup')
            privateDiv.style.overflowX = 'hidden'
            privateDiv.innerHTML = privateMssgTemplate
            privateMssgContainer = document.getElementById('privateMssgContainer')
            messagesContainer.scrollTop = 9999
            messagesForm.style.visibility = 'visible'
            const closePrivateChat = document.getElementById('closePrivateChat')
            closePrivateChat.addEventListener('click', () => {
                privateDiv.remove()
                messagesForm.style.visibility = 'collapse'
            })
        })
    }
}