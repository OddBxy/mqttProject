import { Component } from '@angular/core';
import { User } from '../../interfaces/user'

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

    currentUser : User = {pseudo : "test", "avatar" : "t"}
}
