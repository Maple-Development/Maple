export type Song = {
    title: string;
    artist: string;
    album: string;
    year: number;
    genre: string;
    art: string;
    onClick: () => void;
    onContextMenu: (e: MouseEvent) => void;
}