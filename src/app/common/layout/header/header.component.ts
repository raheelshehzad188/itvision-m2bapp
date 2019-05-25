import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../../authentication/core/auth.service';
// import { ProductService } from '../../../services/product.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() currentAction: String;
  @Input() currentLink: string;

  @Input() previousAction: String;
  @Input() previousLink: string;

  show = false;
  cartCheck = false;
  adminShow = false;
  @Input() menuvisible: boolean = true;
  @Output() menuvisibleChange = new EventEmitter<boolean>();
  message = false;
  selectProduct: any;
  constructor(
    private router: Router,
    public authService: AuthService,
    private location: Location) {
    this.adminShow = this.authService.AdminCheck;
  }

  ngOnInit() {
    if (this.router.url.includes('home/products')) {
      this.show = true;
    }

  }

  cart() {
    if (this.currentAction == "Cart") {
      this.router.navigateByUrl(this.currentLink)
    }
  }
  logout() {
    console.log(this.previousAction);
    if (this.previousAction == "Log Out") {
      localStorage.clear();
      this.authService.doLogout()
      this.router.navigate(['/auth/login'])
        .then((res) => {
          this.router.navigate(['/auth/login'])


        }, (error) => {
          console.log("Logout error", error);
        });
    } else {
      console.log(this.previousLink);
      this.router.navigateByUrl(this.previousLink)
    }
  }

  toggleMenu() {
    this.message = !this.message;
    this.menuvisibleChange.emit(this.message);
  }

}
