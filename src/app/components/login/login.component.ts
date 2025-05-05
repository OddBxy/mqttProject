import {Component} from '@angular/core';
import {User} from "../../interfaces/user";
import {Router} from "@angular/router";
import {UserService} from '../../user.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  currentUser: User = {pseudo: '', avatar: '', photoURL: ''};

  constructor(
    private router: Router,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {
  }

  /**
   * Connecte l'utilisateur et navigue vers le chat
   */
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

  /**
   * Ouvre le sélecteur de fichier pour choisir une photo de profil
   */
  selectProfilePhoto(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // Limiter la taille du fichier à 1MB
        if (file.size > 10* 1024 * 1024) {
          alert('La taille de l\'image ne doit pas dépasser 1MB.');
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          this.currentUser.photoURL = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }

  /**
   * Retourne l'image de fond pour l'affichage de la photo de profil
   */
  getProfilePhotoBackground(): SafeStyle {
    if (this.currentUser.photoURL) {
      return this.sanitizer.bypassSecurityTrustStyle(`url(${this.currentUser.photoURL})`);
    }
    return 'none';
  }

  /**
   * Obtient les initiales à partir du pseudo
   */
  getInitials(name: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  selectProfilePhotoFromDrop(file: File): void {
    if (file.size > 10 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.currentUser.photoURL = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
