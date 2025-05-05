export interface SystemMessageContent {
  type: 'channel_created' | 'channel_deleted';
  channelName: string;
}
