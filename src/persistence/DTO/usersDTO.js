
class usersDTO {
    constructor (data) {
        return data
    }
}

const usersAdministrationDTO = (users) => {
    const mappedUsers = users.map(users => {
        const formattedUser = {
            _id: users._id,
            user: users.user,
            name: users.name,
            address: users.address,
            age: users.age,
            phone: users.phone,
            avatar: users.avatar,
            admin: users.admin,
            cartId: users.cartId
        }
        return new usersDTO(formattedUser)
    })
    return mappedUsers
}

export {
    usersAdministrationDTO
}