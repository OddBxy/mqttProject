import { Component } from '@angular/core';
import { User } from "../../interfaces/user";
import { Router } from "@angular/router"

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

    currentUser : User = {pseudo : '', avatar : '' };

    constructor(private router : Router){

    }

    logIn(){
        const pseudoInput = this.currentUser.pseudo.trim();
        this.router.navigate(["/chat"])
    }
}
