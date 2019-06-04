import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderListModel, SupplierOrderInfo } from '../../../models/order-list.model';
import { OrderListService } from '../../../services/order-list.service';

import { SupplierOrderListModel } from '../../../models/supplier-order-list.model';
import { SupplierOrderListService } from '../../../services/supplier-order-list-service.service';
import { SupplierService } from '../../../services/supplier.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

import { Http, URLSearchParams } from '@angular/http';
import { EmailService } from '../../../services/email.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-final-cart',
  templateUrl: './final-cart.component.html',
  styleUrls: ['./final-cart.component.css']
})
export class FinalCartComponent implements OnInit, OnDestroy {

  appUrl : string = environment.appUrl;
  checkChild = "email";
  ownEmail: string;
  isAddedCheck = "isAdded";
  selectProduct: any;
  supplierOrder = new Array();
  totalQtPrice: number;
  totalSelectPrice = 0;
  deliveryAddress = '';
  supplierDetail = new SupplierOrderInfo();
  productobj = new OrderListModel();
  supplierProductobj = new SupplierOrderListModel();

  supplierProdstruct = { productName: "", productPrice: 0, quantity: 0, supplierId: "", addOn: 0 };
  arr = [];
  user: any;
  credit: number;
  myTotalCredit = 0;
  selectedData: {};
  id: string;
  order_id: string;
  msgStruct = [{
    message: 'Welcome to M2B',
    timeSent: '',
    userName: '',
    senderId: '',
    senderEmail: ''
  }];
  isErr = false;
  emailUrl = environment.functionsURL + "/mailService";
  params: URLSearchParams = new URLSearchParams();
  supplierEmail: string;
  product: any;
  orderList: any;
  totalSKUPrice = 0;
  getProduct: any;
  productSub: Subscription;
  supplierTag = { title: "", data: "", link: "" };
  checkEmpty = false;
  constructor(
    private actRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private productService: ProductService,
    private router: Router,
    private orderListService: OrderListService,
    private http: Http,
    private sendEmailService: EmailService,
    private supplierOrderListService: SupplierOrderListService,
    private supplierSer: SupplierService
  ) {
    this.id = this.actRoute.snapshot.queryParamMap.get('productId');
    this.ownEmail = JSON.parse(localStorage.getItem("user")).email;

  }

  ngOnInit() {
    this.getCurrentUserInfo();
    this.orderList = JSON.parse(localStorage.getItem('orderData'));
    console.log(this.orderList.length - 1);

    this.order_id = this.orderList.length <= 0 ? "" : this.orderList[this.orderList.length - 1].order_id;

    this.calculateTotal();
  }
  ngOnDestroy() {
  }
  calculateTotal() {
    this.totalSelectPrice = 0;
    this.orderList.forEach(el => {
      el.productSKU.forEach(item => {
        this.totalSKUPrice = item.SKU_Price * +item.quantity;
        this.totalSelectPrice = Math.round((this.totalSelectPrice + this.totalSKUPrice) * 100) / 100;
      });

    });
  }

  createOrderForSuplliers() {
    let sameProd = [];
    let uniqueEmailValues: string[];
    let unique = {};
    let prodTotal = 0;
    let supplierTotal = 0;
    let container = {
      productDetail: []
    }
    this.orderList.forEach((i) => {

      if (!unique[i.supplierEmail]) {
        unique[i.supplierEmail] = true;
      }
    });
    uniqueEmailValues = Object.keys(unique);
    console.log(uniqueEmailValues);
    uniqueEmailValues.forEach((email) => {

      this.orderList.forEach((x) => {

        if (x.supplierEmail == email) {
          sameProd.push(x);


          x.productSKU.forEach(el => {
            prodTotal = el.quantity * el.SKU_Price;
            supplierTotal = supplierTotal + prodTotal;
          });
        }
      })

      sameProd.forEach((x) => {
        this.supplierDetail.totalProductName.push({
          productName: x.productName
        });
      })
      this.supplierProductobj.productDetail = sameProd;
      this.supplierProductobj.supplierEmail = email;
      this.supplierProductobj.userName = this.user.name;
      this.supplierProductobj.requested = "0";
      this.supplierProductobj.addOn = Date.now();
      this.msgStruct = [{
        message: 'Welcome to M2B', timeSent: Date.now().toString(), userName: "Supplier", senderId: '', senderEmail: email
      }]
      this.supplierProductobj.messages = this.msgStruct;
      this.supplierProductobj.supplierUnread = 0;
      this.supplierProductobj.deliverAddress = this.deliveryAddress;
      this.supplierProductobj.lastAddedMsgDate = Date.now().toString();
      this.supplierProductobj.userUnread = 1;
      this.supplierProductobj.userEmail = this.ownEmail;//
      this.supplierProductobj.userPhone = this.user.phoneNo;
      this.supplierProductobj.totalPrice = supplierTotal;
      this.supplierProductobj.orderID = this.productobj.id;
      this.supplierProductobj.userOrderID = this.makeid();
      this.supplierDetail.supplierOrderId = this.supplierProductobj.userOrderID;

      // Setting Email Data for admin and send
      console.log(this.supplierDetail);
      this.arr.push(this.supplierDetail);
      this.supplierOrderListService.createOrderList(this.supplierProductobj);
      this.supplierTag.title = "New Order Just Placed !";
      this.supplierTag.data = `<span style="font-weight: bold;">User Name:</span>  ${this.user.name} <p>
      Delivery Address :<br/>
        ${this.deliveryAddress} <br/>
        ${this.user.phoneNo }<br/>
        Delivery Time :<br/>
        3 Business  Day<br/>
      </p>`;


      this.supplierTag.link = ` <p style="background-color: #ff8e32;border: 2px solid #ffffff;color:#ffffff;border-radius: .5rem;font-size: 14px;font-weight: 600;line-height:1;padding: 20px 13px;text-align:center;margin-left: 21%;margin-right: 20%;cursor: pointer;"><a href="${this.appUrl}/#/admin/order-list" >Check Order Detail</a></p> `
      container.productDetail = this.orderList;
      this.sendEmailService.sendEmail(email, this.supplierTag, this.totalSelectPrice, container);
      console.log(this.arr);
      supplierTotal = 0;
      prodTotal = 0
      sameProd = [];
      this.supplierDetail = new SupplierOrderInfo();
    })

  }


  makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  createOrder() {
    this.orderList.forEach(order => {
      this.getData(order);

    });
    this.productobj.productDetail = this.orderList;
    this.productobj.deliverAddress = this.deliveryAddress;
    this.productobj.supplierOrderInfo = this.arr;
    this.productobj.addOn = Date.now();
    this.productobj.userEmail = this.ownEmail;//

    this.productobj.totalPrice = this.totalSelectPrice;
    this.orderListService.createOrderList(this.productobj);

  }

  getData(order) {

    this.productSub = this.productService.getProductbycat("id", order.id).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe(productDetail => {
      console.log(productDetail);
      productDetail.forEach(product => {
        this.getProduct = product;
      });

      console.log(this.getProduct);
      order.productSKU.forEach(SKU => {
        console.log(SKU.SKU_Quantity, SKU.quantity);
        let quantity = SKU.SKU_Quantity - +SKU.quantity;
        console.log(quantity);
        let index = this.getProduct.productSKU.findIndex(x => x.SKU_Name == SKU.SKU_Name);
        console.log(index);
        this.getProduct.productSKU[index].SKU_Quantity = quantity;

      });
      console.log(this.getProduct);
      this.productService.updateProduct(this.getProduct.key, this.getProduct, this.getProduct.product_image_url);
      this.productSub.unsubscribe();
    })
  }

  removeProduct(index) {

    this.orderList.splice(index, 1);
    this.calculateTotal();
    localStorage.setItem('orderData', JSON.stringify(this.orderList));

    if (this.orderList.length <= 0) {
      this.order_id = "";
      this.checkEmpty = true;
    } else {
      this.order_id = this.orderList[this.orderList.length - 1].order_id;
      this.checkEmpty = false;
    }

  }

  removeSKU(i, x) {
    this.orderList[i].productSKU.splice(x, 1);
    if (this.orderList[i].productSKU.length < 1) {
      this.orderList.splice(i, 1);

      this.order_id = this.orderList.length <= 0 ? "" : this.orderList[this.orderList.length - 1].order_id;
    }
    this.calculateTotal();
    localStorage.setItem('orderData', JSON.stringify(this.orderList));
    this.checkEmpty = this.orderList.length <= 0 ? true : false;
  }
  setQuantity() {
    if (this.deliveryAddress == '') {
      this.isErr = true;
      this.toastrService.error("Please enter Delivery Address");
    } else {
      this.isErr = false;

      let container = {
        productDetail: []
      }
      this.productobj.id = this.makeid();
      if (this.myTotalCredit == 0 || this.myTotalCredit < 0 || this.myTotalCredit < this.totalSelectPrice) {
        this.toastrService.error("Not enough credit in M2B Account");
        this.supplierSer.needCredit = this.totalSelectPrice - this.myTotalCredit;

        this.router.navigateByUrl('mym2bCredit?productId=' + this.id);
      } else {

        // Setting Email Data and send
        this.supplierTag.data = ` Your Order Placed Successfully! Order is shipping to  <p>
        Delivery Address :<br/>
          ${this.deliveryAddress} <br/>
          ${this.user.phoneNo }<br/>
          Delivery Time :<br/>
          3 Business  Day<br/>
        </p>` ;
        this.supplierTag.title = "Thank You!";
        this.supplierTag.link = ` <p style="background-color: #ff8e32;border: 2px solid #ffffff;color:#ffffff;border-radius: .5rem;font-size: 14px;font-weight: 600;line-height:1;padding: 20px 13px;text-align:center;margin-left: 21%;margin-right: 20%;cursor: pointer;"><a href="${this.appUrl}/#/myOrderList" >Check Order Detail</a></p> `
        container.productDetail = this.orderList;
        this.sendEmailService.sendEmail(this.ownEmail, this.supplierTag, this.totalSelectPrice, container);

        this.credit = this.myTotalCredit - this.totalSelectPrice;
        this.user.credit = this.credit;
        this.supplierSer.updateUser(this.user.key, this.user);


        this.createOrderForSuplliers();

        this.createOrder();

        this.router.navigateByUrl('basic-cart/final-cart/checkout-cart?productId=' + this.id);
        this.toastrService.success("Your Order Placed Successfully");
        this.productobj = new OrderListModel();
        localStorage.setItem('orderData2', JSON.stringify(this.orderList));
        localStorage.removeItem('orderData');

      }

    }
  }
  getCurrentUserInfo() {

    this.supplierSer.getUsersByOption(this.checkChild, this.ownEmail).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe(users => {
      users.forEach(user => {
        this.user = user;
        this.deliveryAddress = this.user.address;
        this.myTotalCredit = Math.round((this.user.credit) * 100) / 100;

      })
    });
  }

}






