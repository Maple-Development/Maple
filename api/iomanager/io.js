/* eslint-disable no-unused-vars */

module.exports = {
	addFriend: function (user, friend, socket, io) {
		io.to(socket.id).emit('friendRequest', { id: user });
	},

	getSocket: async function (io, id) {
		const clients = await io.fetchSockets();
		for (const client of clients) {
			if (client.user.id === id) {
				return client;
			}
		}
		return null;
	},

	nowPlaying: function (user, socket, io, nowPlaying) {
		io.to(socket.id).emit('nowPlaying', { nowPlaying: nowPlaying, id: user });
	}
};
