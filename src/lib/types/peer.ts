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