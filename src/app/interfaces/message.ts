export interface Message {
    author: string;
    content: string;
    time: Date;
    isSystem?: boolean;
}
