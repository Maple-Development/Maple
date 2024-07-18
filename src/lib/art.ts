export type Art = {
    image: string;
    onClick: () => void;
    onContextMenu: (e: MouseEvent) => void;
}