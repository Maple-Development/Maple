export type Song = {
    id: string;
    title: string;
    artist: string;
    album: string;
    year: number;
    genre: string;
    onClick: () => void;
    onContextMenu: (e: MouseEvent) => void;
}