import { PeerManager } from './PeerManager';
import { OPFS } from '$lib/opfs';
import type { Song } from '$lib/types/song';
import type { Playlist } from '$lib/types/playlist';
import { DataType } from '$lib/types/peer';
import { toast } from 'svelte-sonner';

export class PeerInterface {
    public static async sendLibrary(peerId: string): Promise<void> {
        try {
            const tracks = await OPFS.get().tracks();
            let successCount = 0;
            let failCount = 0;

            for (const track of tracks) {
                try {
                    const audioResponse = await OPFS.getSong(track);
                    const audioBlob = await audioResponse.blob();
                    
                    const data = {
                        dataType: DataType.FILE,
                        file: audioBlob,
                        fileName: `${track.id}.${track.ext}`,
                        fileType: 'audio/mpeg'
                    };

                    await PeerManager.sendData(peerId, data);
                    successCount++;
                } catch (error) {
                    console.error(`[PEER] Failed to send track ${track.id}:`, error);
                    failCount++;
                }
            }

            toast.success(`Library transfer complete. Success: ${successCount}, Failed: ${failCount}`);
        } catch (error) {
            console.error('[PEER] Error sending library:', error);
            toast.error('Failed to send library');
            throw error;
        }
    }

    public static async sendPlaylist(peerId: string, playlist: Playlist): Promise<void> {
        try {
            let successCount = 0;
            let failCount = 0;

            for (const trackId of playlist.tracks || []) {
                try {
                    const track = await OPFS.get().track(String(trackId));
                    if (!track) continue;

                    const audioResponse = await OPFS.getSong(track);
                    const audioBlob = await audioResponse.blob();
                    
                    const data = {
                        dataType: DataType.FILE,
                        file: audioBlob,
                        fileName: `${track.id}.${track.ext}`,
                        fileType: 'audio/mpeg'
                    };

                    await PeerManager.sendData(peerId, data);
                    successCount++;
                } catch (error) {
                    console.error(`[PEER] Failed to send track ${trackId}:`, error);
                    failCount++;
                }
            }

            toast.success(`Playlist transfer complete. Success: ${successCount}, Failed: ${failCount}`);
        } catch (error) {
            console.error('[PEER] Error sending playlist:', error);
            toast.error('Failed to send playlist');
            throw error;
        }
    }

    public static async sendTrack(peerId: string, track: Song): Promise<void> {
        try {
            const audioResponse = await OPFS.getSong(track);
            const audioBlob = await audioResponse.blob();
            
            const data = {
                dataType: DataType.FILE,
                file: audioBlob,
                fileName: `${track.id}.${track.ext}`,
                fileType: 'audio/mpeg'
            };

            await PeerManager.sendData(peerId, data);
            toast.success(`Track ${track.title} sent successfully`);
        } catch (error) {
            console.error('[PEER] Error sending track:', error);
            toast.error('Failed to send track');
            throw error;
        }
    }

    public static async sendMessage(peerId: string, message: string): Promise<void> {
        try {
            const data = {
                dataType: DataType.OTHER,
                message: message
            };

            await PeerManager.sendData(peerId, data);
            toast.success(`Message sent successfully`);
        } catch (error) {
            console.error('[PEER] Error sending message:', error);
            toast.error('Failed to send message');
            throw error;
        }
    }
}
