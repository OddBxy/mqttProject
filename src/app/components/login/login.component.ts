import {Component} from '@angular/core';
import {User} from "../../interfaces/user";
import {Router} from "@angular/router";
import {UserService} from '../../user.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {ImageCompressionServiceService} from '../../image-compression-service.service';

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
    private sanitizer: DomSanitizer,
    private imageCompressionService: ImageCompressionServiceService,
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

        this.imageCompressionService.compressImage(file, 256, 256, 0.8).then((compressedImage) => {
          this.currentUser.photoURL = compressedImage;
        }).catch((error) => {
          console.error('Erreur lors de la compression de l\'image :', error);
        });
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

    this.imageCompressionService.compressImage(file, 256, 256, 0.8).then((compressedImage) => {
      this.currentUser.photoURL = compressedImage;
    }).catch((error) => {
      console.error('Erreur lors de la compression de l\'image :', error);
    });
  }
}
