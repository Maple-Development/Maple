export type AddedFriend = {
    id: string;
    name: string;
    username: string;
    pfp?: string;
    nowPlaying?: {
        title: string;
        artist: string;
        album: string;
    };
}

export type Album = {
	id: string;
	name: string;
	artist: string;
	image: any;
	year: number;
	genre?: string;
	tracks?: String[];
};

export type Artist = {
	id: string;
	name: string;
	image?: any;
	tracks?: String[];
	albums?: String[];
};

export enum DataType {
    FILE = 'FILE',
    OTHER = 'OTHER'
}

export interface PeerData {
    dataType: DataType;
    file?: Blob;
    fileName?: string;
    fileType?: string;
    message?: string;
} 

export type Playlist = {
	id: string;
	name: string;
	description: string;
	tracks?: String[];
	image?: any;
	createdAt?: number;
	modifiedAt?: number;
};

export type PendingRequest = {
    user_id: string,
    friend_id: string
};

export type Song = {
	id: string;
	title: string;
	artist: string;
	album: string;
	year: number;
	genre?: string;
	fileName: string;
	duration: number;
	image?: any;
	trackNumber: number;
	disk: number;
	ext: string;
};

export type User = {
	id: string;
	username: string;
	name?: string;
	pfp?: any;
};