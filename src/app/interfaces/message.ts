import {SystemMessageContent} from './system-message-content';
import { User } from './user';

export interface Message {
  author: User;
  content: string;
  time: Date;
  isSystem?: boolean;
  SystemMessage?: SystemMessageContent;
}
