import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));


// Interfaces pour typer les données
interface User {
  pseudo: string;
  avatar: string;
}

interface Message {
  author: string;
  content: string;
  time: Date;
  isSystem?: boolean;
  isMyMessage?: boolean;
}

// Variables de l'application
let currentUser: User = {
  pseudo: '',
  avatar: ''
};

let currentChannel: string = 'general';

const channelMessages: Record<string, Message[]> = {
  'general': [],
  'aide': [],
  'blabla': [],
  'tech': []
};

const channelNames: Record<string, string> = {
  'general': 'général',
  'aide': 'aide & support',
  'blabla': 'blabla',
  'tech': 'technologie'
};

// DOM Elements
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const pseudoInput = document.getElementById('pseudo-input') as HTMLInputElement;
const chatContainer = document.getElementById('chat-container') as HTMLElement;
const loginContainer = document.querySelector('.login-container') as HTMLElement;
const userNameElement = document.getElementById('user-name') as HTMLElement;
const userAvatarElement = document.getElementById('user-avatar') as HTMLElement;
const currentChannelElement = document.getElementById('current-channel') as HTMLElement;
const messagesContainer = document.getElementById('messages-container') as HTMLElement;
const messageInput = document.getElementById('message-input') as HTMLInputElement;
const sendButton = document.getElementById('send-button') as HTMLButtonElement;
const changePseudoBtn = document.getElementById('change-pseudo-btn') as HTMLButtonElement;
const changePseudoPopup = document.getElementById('change-pseudo-popup') as HTMLElement;
const newPseudoInput = document.getElementById('new-pseudo-input') as HTMLInputElement;
const confirmChangePseudo = document.getElementById('confirm-change-pseudo') as HTMLButtonElement;
const cancelChangePseudo = document.getElementById('cancel-change-pseudo') as HTMLButtonElement;
const salonSelector = document.getElementById('salon-selector') as HTMLSelectElement;
const channelsList = document.getElementById('channels-list') as HTMLElement;
const addChannelBtn = document.getElementById('add-channel-btn') as HTMLButtonElement;
const addChannelPopup = document.getElementById('add-channel-popup') as HTMLElement;
const newChannelInput = document.getElementById('new-channel-input') as HTMLInputElement;
const confirmAddChannel = document.getElementById('confirm-add-channel') as HTMLButtonElement;
const cancelAddChannel = document.getElementById('cancel-add-channel') as HTMLButtonElement;

// Gestion du formulaire de connexion
loginForm.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  const pseudo = pseudoInput.value.trim();

  if (pseudo) {
    currentUser.pseudo = pseudo;
    currentUser.avatar = pseudo.charAt(0).toUpperCase();

    userNameElement.textContent = currentUser.pseudo;
    userAvatarElement.textContent = currentUser.avatar;

    loginContainer.style.display = 'none';
    chatContainer.style.display = 'flex';

    addMessage('Système', `Bienvenue ${currentUser.pseudo} ! Vous êtes maintenant connecté au salon #général.`, true);
    displayChannelMessages();
  }
});

channelsList.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const channelItem = target.closest('li');
  if (channelItem) {
    const channelId = channelItem.getAttribute('data-channel');
    if (!channelId) return;

    if (target.classList.contains('delete-channel')) {
      if (!channelItem.classList.contains('default-channel')) {
        deleteChannel(channelId);
      }
    } else {
      changeChannel(channelId);
      document.querySelectorAll('.channels-list li').forEach(el => el.classList.remove('active'));
      channelItem.classList.add('active');
      salonSelector.value = channelId;
    }
  }
});

salonSelector.addEventListener('change', function () {
  changeChannel(this.value);
  document.querySelectorAll('.channels-list li').forEach(ch => {
    const el = ch as HTMLElement;
    if (el.getAttribute('data-channel') === this.value) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
});

function updateSalonSelector(): void {
  salonSelector.innerHTML = '';
  Object.keys(channelNames).forEach(channelId => {
    const option = document.createElement('option');
    option.value = channelId;
    option.textContent = channelNames[channelId];
    option.selected = channelId === currentChannel;
    salonSelector.appendChild(option);
  });
}

function changeChannel(channelId: string): void {
  currentChannel = channelId;
  currentChannelElement.textContent = channelNames[channelId] || channelId;
  displayChannelMessages();
}

function displayChannelMessages(): void {
  messagesContainer.innerHTML = '';

  if (!channelMessages[currentChannel]) {
    channelMessages[currentChannel] = [{
      author: 'Système',
      content: `Bienvenue sur le salon #${channelNames[currentChannel] || currentChannel}!`,
      time: new Date(),
      isSystem: true
    }];
  }

  channelMessages[currentChannel].forEach(msg => {
    const messageElement = createMessageElement(msg);
    messagesContainer.appendChild(messageElement);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createMessageElement(messageData: Message): HTMLElement {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${messageData.isMyMessage ? 'my-message' : ''}`;

  const hours = messageData.time.getHours().toString().padStart(2, '0');
  const minutes = messageData.time.getMinutes().toString().padStart(2, '0');

  messageElement.innerHTML = `
        <div class="message-header">
            <div class="message-author">${messageData.author}</div>
            <div class="message-time">Aujourd'hui à ${hours}:${minutes}</div>
        </div>
        <div class="message-content">${messageData.content}</div>
    `;
  return messageElement;
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function (e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage(): void {
  const content = messageInput.value.trim();
  if (content) {
    const messageData: Message = {
      author: currentUser.pseudo,
      content,
      time: new Date(),
      isMyMessage: true
    };

    channelMessages[currentChannel] = channelMessages[currentChannel] || [];
    channelMessages[currentChannel].push(messageData);

    messagesContainer.appendChild(createMessageElement(messageData));
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    messageInput.value = '';
  }
}

function addMessage(author: string, content: string, isSystem = false, isMyMessage = false): void {
  const messageData: Message = {
    author,
    content,
    time: new Date(),
    isSystem,
    isMyMessage
  };

  channelMessages[currentChannel] = channelMessages[currentChannel] || [];
  channelMessages[currentChannel].push(messageData);

  messagesContainer.appendChild(createMessageElement(messageData));
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

changePseudoBtn.addEventListener('click', () => {
  newPseudoInput.value = currentUser.pseudo;
  changePseudoPopup.style.display = 'flex';
});

cancelChangePseudo.addEventListener('click', () => {
  changePseudoPopup.style.display = 'none';
});

confirmChangePseudo.addEventListener('click', () => {
  const newPseudo = newPseudoInput.value.trim();
  if (newPseudo) {
    const oldPseudo = currentUser.pseudo;
    currentUser.pseudo = newPseudo;
    currentUser.avatar = newPseudo.charAt(0).toUpperCase();
    userNameElement.textContent = currentUser.pseudo;
    userAvatarElement.textContent = currentUser.avatar;
    addMessage('Système', `${oldPseudo} a changé son pseudo en ${newPseudo}.`, true);
    changePseudoPopup.style.display = 'none';
  }
});

addChannelBtn.addEventListener('click', () => {
  newChannelInput.value = '';
  addChannelPopup.style.display = 'flex';
});

cancelAddChannel.addEventListener('click', () => {
  addChannelPopup.style.display = 'none';
});

confirmAddChannel.addEventListener('click', () => {
  const channelName = newChannelInput.value.trim();
  if (channelName) {
    addChannel(channelName);
    addChannelPopup.style.display = 'none';
  }
});

function addChannel(channelName: string): void {
  const channelId = channelName.toLowerCase().replace(/\s+/g, '-');

  if (channelNames[channelId]) {
    alert('Un salon avec ce nom existe déjà !');
    return;
  }

  channelNames[channelId] = channelName;
  channelMessages[channelId] = [];

  const liElement = document.createElement('li');
  liElement.setAttribute('data-channel', channelId);
  liElement.innerHTML = `
        <span class="channel-name">${channelName}</span>
        <span class="delete-channel">🗑️</span>
    `;
  channelsList.appendChild(liElement);

  updateSalonSelector();
  changeChannel(channelId);
  document.querySelectorAll('.channels-list li').forEach(el => el.classList.remove('active'));
  liElement.classList.add('active');
}

function deleteChannel(channelId: string): void {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le salon #${channelNames[channelId]} ?`)) {
    const isActive = currentChannel === channelId;

    delete channelNames[channelId];
    delete channelMessages[channelId];

    const channelElement = document.querySelector(`.channels-list li[data-channel="${channelId}"]`);
    channelElement?.remove();

    updateSalonSelector();

    if (isActive) {
      changeChannel('general');
      document.querySelector('.channels-list li[data-channel="general"]')?.classList.add('active');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const welcomeMsg: Message = {
    author: 'Système',
    content: 'Bienvenue sur le salon #général! Vous pouvez commencer à discuter.',
    time: new Date(),
    isSystem: true
  };
  channelMessages['general'].push(welcomeMsg);
});
