import { Component } from '@angular/core';
import { User } from "../../interfaces/user";
import { Router } from "@angular/router";
import { UserService } from '../../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  currentUser: User = {pseudo: '', avatar: ''};

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  logIn(): void {
    const pseudoInput = this.currentUser.pseudo.trim();

    if (pseudoInput) {
      // Set the avatar to the first letter of pseudo
      this.currentUser.avatar = pseudoInput.charAt(0).toUpperCase();

      // Update user via service
      this.userService.updateUser(this.currentUser);

      // Navigate to chat
      this.router.navigate(["/chat"]);
    }
  }
}
