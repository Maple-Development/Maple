/* eslint-disable no-unused-vars */

module.exports = {
	addFriend: function (user, friend, socket, io) {
		try {
		io.to(socket.id).emit('friendRequest', { id: user });
		} catch (error) {
			console.error(error);
		}
	},

	getSocket: async function (io, id) {
		try {
			const clients = await io.fetchSockets();
			for (const client of clients) {
				if (client.user.id === id) {
					return client;
				}
			}
			return null;
		} catch (error) {
			console.error(error);
			return null;
		}
	},

	nowPlaying: function (user, socket, io, nowPlaying) {
		try {
			io.to(socket.id).emit('nowPlaying', { nowPlaying: nowPlaying, id: user });
		} catch (error) {
			console.error(error);
		}
	},

	emit: function (socket, event, data, io) {
		try {
			io.to(socket.id).emit(event, data);
		} catch (error) {
			console.error(error);
		}
	},
};
