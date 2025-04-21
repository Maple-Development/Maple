/* eslint-disable no-unused-vars */
const pool = require('../db');

module.exports = {
	addFriend: async function (user, friend, socket, io) {
		try {
			const clients = await this.getSocket(io, user);
			if (clients.length > 0) {
				console.log(`[IO] Found ${clients.length} sockets for user ${user}, emitting friendRequest`);
				clients.forEach(client => {
					io.to(client.id).emit('friendRequest', { id: friend });
				});
			}
		} catch (error) {
			console.error(error);
		}
	},

	getSocket: async function (io, id) {
		try {
			const clients = await io.fetchSockets();
			const userSockets = clients.filter(client => client.user.id === id);
			return userSockets;
		} catch (error) {
			console.error(error);
			return [];
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
				const targetId = friend.user_id === user ? friend.friend_id : friend.user_id;
				console.log(`[IO] Looking for sockets for friend ${targetId} (relationship: ${JSON.stringify(friend)})`);
				
				const clients = await this.getSocket(io, targetId);
				if (clients.length > 0) {
					console.log(`[IO] Found ${clients.length} sockets for friend ${targetId}`);
					const message = { nowPlaying: nowPlaying, id: user };
					clients.forEach(client => {
						console.log(`[IO] Emitting to socket ${client.id} for user ${targetId}:`, message);
						io.to(client.id).emit('nowPlaying', message);
					});
				} else {
					console.log(`[IO] No sockets found for friend ${targetId}`);
				}	
			})
		} catch (error) {
			console.error('[ERROR] Error in nowPlaying:', error);
		}
	},

	emit: async function (socket, event, data, io) {
		try {
			const clients = await this.getSocket(io, socket.user.id);
			if (clients.length > 0) {
				console.log(`[IO] Found ${clients.length} sockets for user ${socket.user.id}, emitting ${event}`);
				clients.forEach(client => {
					io.to(client.id).emit(event, data);
				});
			}
		} catch (error) {
			console.error(error);
		}
	},

	discordRPC: async function (user, _friends, io, nowPlaying) {
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

			const clients = await this.getSocket(io, user);
			if (clients.length > 0) {
				console.log(`[IO] Found ${clients.length} sockets for user ${user}, emitting discordRPC`);
				clients.forEach(client => {
					client.emit('rpcUpdate', rpcData);
				});
			}
		} catch (error) {
			console.error('[ERROR] Error in discordRPC:', error);
		}
	}
};
