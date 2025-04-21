/* eslint-disable no-unused-vars */
const pool = require('../db');

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

	nowPlaying: function (user, friends, io, nowPlaying) {
		try {
			console.log(`[IO] Processing nowPlaying for user ${user} with ${friends.length} friends`);
			pool.promise().query(
				'INSERT INTO live_status (user_id, playing) VALUES (?, ?) ' +
				'ON DUPLICATE KEY UPDATE playing = VALUES(playing)',
				[user, JSON.stringify(nowPlaying)]
			);
			friends.forEach(async (friend) => {
				// Check both user_id and friend_id to find the correct socket
				const targetId = friend.user_id === user ? friend.friend_id : friend.user_id;
				console.log(`[IO] Looking for socket for friend ${targetId} (relationship: ${JSON.stringify(friend)})`);
				
				const client = await this.getSocket(io, targetId);
				if (client) {
					console.log(`[IO] Found socket for friend ${targetId}, emitting nowPlaying`);
					io.to(client.id).emit('nowPlaying', { nowPlaying: nowPlaying, id: user });
				} else {
					console.log(`[IO] No socket found for friend ${targetId}`);
				}	
			})
		} catch (error) {
			console.error('[ERROR] Error in nowPlaying:', error);
		}
	},

	emit: function (socket, event, data, io) {
		try {
			io.to(socket.id).emit(event, data);
		} catch (error) {
			console.error(error);
		}
	},

	discordRPC: function (user, _friends, io, nowPlaying) {
		try {
			const rpcData = {
				artist: nowPlaying.artist || undefined,
				title: nowPlaying.title || undefined,
				state: nowPlaying.artist ? `by ${nowPlaying.artist}` : undefined,
				largeImageKey: nowPlaying.image ? `data:image/jpeg;base64,${nowPlaying.image}` : "maple",
				largeImageText: nowPlaying.album || undefined,
				id: nowPlaying.id || undefined,
				album: nowPlaying.album || undefined,
				smallImageKey: "play",
				smallText: "Listening to Maple",
				buttons: [
					{
						label: "Listen on Maple",
						url: `https://maple.kolf.pro/user/${user}`
					}
				]
			};

			io.sockets.sockets.forEach(socket => {
				if (socket.user && socket.user.id === user) {
					socket.emit('rpcUpdate', rpcData);
				}
			});
		} catch (error) {
			console.error('[ERROR] Error in discordRPC:', error);
		}
	}
};
