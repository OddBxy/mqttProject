import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {User} from '../../interfaces/user';
import {Message} from '../../interfaces/message';
import {MQTTCommunicationService} from '../../mqtt.service';
import {UserService} from '../../user.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: false,
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  currentUser: User = {pseudo: 'Invité', avatar: 'I'};
  currentChannel: string = 'general';
  channelMessages: Record<string, Message[]> = {
    'general': [],
    'aide': [],
    'blabla': [],
    'tech': [],
    'channel_log': []
  };
  channelNames: Record<string, string> = {
    'general': 'général',
    'aide': 'aide & support',
    'blabla': 'blabla',
    'tech': 'technologie',
  };
  showChangePseudoPopup: boolean = false;
  showAddChannelPopup: boolean = false;
  newPseudo: string = '';
  newChannelName: string = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;
  private userSubscription!: Subscription;
  private channelSubscriptions: Subscription[] = [];

  constructor(
    private mqttService: MQTTCommunicationService,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.currentUser = user;
    });

    // Add welcome message
    this.broadcastMessage(`Bienvenue ${this.currentUser.pseudo} ! Vous êtes maintenant connecté au salon #général.`);

    // Subscribe to MQTT topics for all channels
    this.subscribeToChannels();
    this.subscribeToLogChannel();

  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    // Unsubscribe from all MQTT topics
    this.channelSubscriptions.forEach(sub => sub.unsubscribe());
    this.channelSubscriptions = [];
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToBottom(), 100);

    // Set focus to message input
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  subscribeToChannels(): void {
    // Subscribe to each channel
    Object.keys(this.channelNames).forEach(channel => {
      const subscription = this.mqttService.observeTopic(`chat/${channel}`).subscribe((msg) => {
        try {
          const msgData = JSON.parse(msg.payload.toString()) as Message;

          // Only process if it's not from current user
          if (msgData.author.pseudo !== this.currentUser.pseudo) {
            this.channelMessages[channel].push(msgData);

            // If it's the current channel, update view
            if (channel === this.currentChannel) {
              setTimeout(() => this.scrollToBottom(), 50);
            }
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      });

      this.channelSubscriptions.push(subscription);
    });
  }

  changeChannel(channelId: string): void {
    if (this.currentChannel !== channelId) {
      this.currentChannel = channelId;
      setTimeout(() => {
        this.scrollToBottom();
        if (this.messageInput) {
          this.messageInput.nativeElement.focus();
        }
      }, 50);
    }
  }

  subscribeToLogChannel(): void {
    const subscription = this.mqttService.observeTopic(`chat/channel_log`).subscribe((msg) => {
      try {
        const msgData = JSON.parse(msg.payload.toString()) as Message;
        if(msgData.isSystem && msgData.SystemMessage) {
            const systemMessage = msgData.SystemMessage;
            if (systemMessage.type === 'channel_created') {
                this.addChannel(systemMessage.channelName);
            } else if (systemMessage.type === 'channel_deleted') {
                this.deleteChannel(systemMessage.channelName);
            }
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });

    this.channelSubscriptions.push(subscription);
  }

  sendMessage(): void {
    const content = this.messageInput.nativeElement.value.trim();
    if (content) {
      const messageData: Message = {
        author: this.currentUser,
        content,
        time: new Date(),
      };

      // Add to local array
      this.channelMessages[this.currentChannel].push(messageData);

      // Publish to MQTT
      this.mqttService.publish(`chat/${this.currentChannel}`, JSON.stringify(messageData));

      // Clear input and scroll
      this.messageInput.nativeElement.value = '';
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  addMessage(author: User, content: string, isSystem = false, isMyMessage = false): void {
    const messageData: Message = {
      author,
      content,
      time: new Date(),
      isSystem,
    };

    this.channelMessages[this.currentChannel].push(messageData);
    setTimeout(() => this.scrollToBottom(), 50);
  }

  openChangePseudoPopup(): void {
    this.newPseudo = this.currentUser.pseudo;
    this.showChangePseudoPopup = true;
    setTimeout(() => {
      const input = document.querySelector('.popup input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 50);
  }

  broadcastMessage(message: string): void {
    const messageData: Message = {
      author : {pseudo : "Système", avatar : "S"},
      content: message,
      time: new Date(),
      isSystem: true,
    }
    setTimeout(() => this.scrollToBottom(), 50);
    for (const channel in this.channelMessages) {
      if (channel !==  'channel_log') {
        this.mqttService.publish(`chat/${channel}`, JSON.stringify(messageData));
      }
    }
  }

  annonceChannel(type : 'channel_created' | 'channel_deleted', channelName : string) {
    const messageData: Message = {
      author : {pseudo : "Système", avatar : "S"},
      content: '',
      time: new Date(),
      isSystem: true,
      SystemMessage: {
        type,
        channelName
      }
    }
    if (type === 'channel_deleted') {
      if (confirm(`Êtes-vous sûr de vouloir supprimer le salon #${channelName} ?`)) {
        this.mqttService.publish(`chat/channel_log`, JSON.stringify(messageData));
      }
    }else{
      if (this.channelNames[channelName]) {
        alert('Un salon avec ce nom existe déjà !');
        return;
      }
      this.mqttService.publish(`chat/channel_log`, JSON.stringify(messageData));
    }
  }

  confirmChangePseudo(): void {
    const newPseudo = this.newPseudo.trim();
    if (newPseudo && newPseudo !== this.currentUser.pseudo) {
      const oldPseudo = this.currentUser.pseudo;
      this.currentUser.pseudo = newPseudo;
      this.currentUser.avatar = newPseudo.charAt(0).toUpperCase();

      // Update user via service
      this.userService.updateUser({...this.currentUser});

      this.broadcastMessage(`${oldPseudo} a changé son pseudo en ${newPseudo}.`);
      this.showChangePseudoPopup = false;
    } else {
      this.showChangePseudoPopup = false;
    }
  }

  openAddChannelPopup(): void {
    this.newChannelName = '';
    this.showAddChannelPopup = true;
    setTimeout(() => {
      const input = document.querySelector('.popup input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 50);
  }

  addChannel(channelName: string): void {
    console.log("addChannel", channelName);
    if (channelName) {
      const channelId = channelName.toLowerCase().replace(/\s+/g, '-');

      this.channelNames[channelId] = channelName;
      this.channelMessages[channelId] = [];

      // Subscribe to new channel
      const subscription = this.mqttService.observeTopic(`chat/${channelId}`).subscribe((msg) => {
        try {
          const msgData = JSON.parse(msg.payload.toString()) as Message;
          if (msgData.author.pseudo !== this.currentUser.pseudo) {
            this.channelMessages[channelId].push(msgData);
            if (channelId === this.currentChannel) {
              setTimeout(() => this.scrollToBottom(), 50);
            }
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      });

      this.channelSubscriptions.push(subscription);

      this.showAddChannelPopup = false;

      // Add system message about new channel
      this.broadcastMessage(`Salon #${channelName} créé par ${this.currentUser.pseudo}.`);
    }
  }

  deleteChannel(channelId: string, event?: Event): void {
    //print for debug
    console.log("deleteChannel", channelId);
    if (event) {
      event.stopPropagation();
    }
     const isActive = this.currentChannel === channelId;
      const channelName = this.channelNames[channelId];

      // Clean up subscriptions
        const subscriptionIndex = this.channelSubscriptions.findIndex(sub => sub.closed);
        const subscription = this.channelSubscriptions[subscriptionIndex];
        if (subscription) {
            subscription.unsubscribe();
            this.channelSubscriptions.splice(subscriptionIndex, 1);
        }

      delete this.channelNames[channelId];
      delete this.channelMessages[channelId];

      if (isActive) {
        this.changeChannel('general');
        this.broadcastMessage(`Salon #${channelName} supprimé par ${this.currentUser.pseudo}.`);}
  }

  isDefaultChannel(channelId: string): boolean {
    return ['general', 'aide', 'blabla', 'tech'].includes(channelId);
  }


  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.scrollToBottom();
  }

  select_sendImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Image = reader.result as string;
          const messageData: Message = {
            author: this.currentUser,
            content: base64Image,
            time: new Date(),
            isSystem: false,
          };

          // Ajouter l'image au tableau local
          this.channelMessages[this.currentChannel].push(messageData);

          // Publier l'image via MQTT
          this.mqttService.publish(`chat/${this.currentChannel}`, JSON.stringify(messageData));

          // Faire défiler vers le bas
          setTimeout(() => this.scrollToBottom(), 50);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

}
