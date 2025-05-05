import {SystemMessageContent} from './system-message-content';

export interface Message {
  author: string;
  content: string;
  time: Date;
  isSystem?: boolean;
  SystemMessage?: SystemMessageContent;
}
