/* eslint-disable no-unused-vars */

module.exports = {
    addFriend: function (user, friend, socket) {
        socket.broadcast.to(friend.id).emit('friendRequest', { id: user });
        console.log('Friend request sent');
    },

    getSocket: function (io, id) {
        const clients = io.sockets.clients();
        for (const client of clients) {
            if (client.user.id === id) {
                return client;
            }
        }
        return null;
    }
};