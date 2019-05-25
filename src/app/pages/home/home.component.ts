import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../../authentication/core/auth.service';
import { CategoryService } from '../../services/category.service';
import { map } from 'rxjs/operators';
import { LoggedInAsService } from '../../authentication/logged-in-as.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Role } from '../../models/user.model';
import { SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tabClick = false;
  categories: any;
  selectedItemId = 0;
  localStorageData: any;
  LSRole: string;
  isOrder = false;
  credit: number;
  constructor(
    private supplierService: SupplierService,
    public authService: AuthService,
    private categoryService: CategoryService,
    private loginUser: LoggedInAsService,
    private router: Router
  ) {
    this.LSRole = localStorage.getItem("op");
    this.isOrder = localStorage.getItem("orderData") ? true : false;
  }

  ngOnInit() {
    if (this.LSRole === Role.Supplier) {
      this.router.navigate(['/supplierHome']);
    } else if (this.LSRole === Role.Courier) {
      this.router.navigate(['/courier-map']);
    } else if (this.LSRole === Role.Admin) {
      this.router.navigate(['/admin']);
    }
    console.log(this.loginUser.option);
    this.localStorageData = JSON.parse(localStorage.getItem("user"));
    this.getCategoriesList();
    this.getUserByOption();

  }

  getCategoriesList() {
    // Use snapshotChanges().map() to store the key
    this.categoryService.getCategoriesList().snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe(categories => {
      this.categories = categories;

    });
  }


  getUserByOption() {
    this.supplierService.getUsersByOption('email', this.localStorageData.email).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe(users => {
      this.credit = users[0].credit;

    });

  }
}



