import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import * as CryptoJS from 'crypto-js';
import { map } from 'rxjs/operators';

import {NativeDateAdapter} from '@angular/material';
import {DateAdapter} from '@angular/material/core';
export class MyDateAdapter extends NativeDateAdapter {
   format(date: Date, displayFormat: Object): string {
        const day = date.getDate();
       const month = date.getMonth() + 1;
       const year = date.getFullYear();
       return `${day}-${month}-${year}`;
   }
}

import { LoginService } from './../../../../services/LoginService/login.service';
import { AdminService } from './../../../../services/Admin/admin.service';
import { CrmSettingsService } from './../../../../services/settings/crmSettings/crm-settings.service';
import { ToastrService } from './../../../../services/common-services/toastr-service/toastr.service';
import { CrmService } from './../../../../services/Crm/crm.service';

@Component({
  selector: 'app-crm-customers-create',
  templateUrl: './crm-customers-create.component.html',
  styleUrls: ['./crm-customers-create.component.css'],
  providers: [{provide: DateAdapter, useClass: MyDateAdapter}]
})
export class CrmCustomersCreateComponent implements OnInit {

   _CompanyTypes: any[] = ['PL', 'BR', 'AMC'];
   _Industry_Types: any[] =  [];
   _Ownership_Types: any[] =  [];

   AllCountry: any[];
   AllStateOfCountry: any[];
   AllCityOfState:  any[];

   ShopFloorAllCountry: any[];
   ShopFloorAllStateOfCountry: any[];
   ShopFloorAllCityOfState:  any[];

   AddLimitField: Boolean = false;

   ShopFloor_State: any;

   Form: FormGroup;

   User_Id: any;

   constructor(
      public Service: AdminService,
      private Toastr: ToastrService,
      public SettingsService: CrmSettingsService,
      public Crm_Service: CrmService,
      public Login_Service: LoginService,
      public router: Router
   ) {
         this.User_Id = this.Login_Service.LoginUser_Info()['_id'];
          const Data = { 'User_Id' : this.User_Id };
          let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
          Info = Info.toString();
          // Get Industry Type List
          this.SettingsService.Industry_Type_SimpleList({'Info': Info}).subscribe( response => {
             const ResponseData = JSON.parse(response['_body']);
             if (response['status'] === 200 && ResponseData['Status'] ) {
                const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
                const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
                this._Industry_Types = DecryptedData;
             } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
                this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
             } else if (response['status'] === 401 && !ResponseData['Status']) {
                this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
             } else {
                this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Industry Types Simple List Getting Error!, But not Identify!' });
             }
          });
          // Get Ownership Type List
          this.SettingsService.Ownership_Type_SimpleList({'Info': Info}).subscribe( response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this._Ownership_Types = DecryptedData;
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Ownership Types Simple List Getting Error!, But not Identify!' });
            }
         });
         // Get Country List
         this.Service.Country_List({'Info': Info}).subscribe( response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this.AllCountry = DecryptedData;
               this.ShopFloorAllCountry = DecryptedData;
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Ownership Types Simple List Getting Error!, But not Identify!' });
            }
         });
       }

   ngOnInit() {
      this.Form = new FormGroup({
         User_Id: new FormControl(this.User_Id),
         CompanyName: new FormControl('', Validators.required),
         PhoneNumber: new FormControl('', Validators.required),
         EmailAddress: new FormControl('', Validators.required),
         Website: new FormControl(''),
         NoOfEmployees: new FormControl(''),
         CompanyType: new FormControl(null, Validators.required),
         IndustryType: new FormControl(null),
         OwnershipType: new FormControl(null),
         StateCode: new FormControl(''),
         GSTNo: new FormControl(''),
         Notes: new FormControl(''),
         BillingStreet: new FormControl('', Validators.required),
         BillingArea: new FormControl('', Validators.required),
         BillingCountry: new FormControl(null, Validators.required),
         BillingState: new FormControl(null, Validators.required),
         BillingCity: new FormControl(null, Validators.required),
         BillingZipCode: new FormControl('', Validators.required),
         SameAddresses: new FormControl(false),
         ShopFloorStreet: new FormControl('', Validators.required),
         ShopFloorArea: new FormControl('', Validators.required),
         ShopFloorCountry: new FormControl(null, Validators.required),
         ShopFloorState: new FormControl(null, Validators.required),
         ShopFloorCity: new FormControl(null, Validators.required),
         ShopFloorZipCode: new FormControl('', Validators.required),
      });
   }

   NotAllow(): boolean {return false; }

   CompanyTypeChange() {
      const type = this.Form.controls['CompanyType'].value;
      if (type === 'AMC') {
         this.Form.addControl('TicketsLimit', new FormControl('', Validators.required));
         this.Form.addControl('AMCFrom', new FormControl(null, Validators.required));
         this.Form.addControl('AMCTo', new FormControl(null, Validators.required));
         this.AddLimitField = true;
      } else {
         this.Form.removeControl('TicketsLimit');
         this.Form.removeControl('AMCFrom');
         this.Form.removeControl('AMCTo');
         this.AddLimitField = false;
      }
   }

   BillingCountry_Change() {
      const SelectedCountry = this.Form.controls['BillingCountry'].value;
      if (SelectedCountry !== null && typeof SelectedCountry === 'object' && Object.keys(SelectedCountry).length > 0) {
         const Data = {Country_Id: SelectedCountry._id, 'User_Id' : this.User_Id };
          let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
          Info = Info.toString();
          // Get State List
         this.Service.State_List({'Info': Info}).subscribe( response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this.AllStateOfCountry = DecryptedData;
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Country Based States List Getting Error!, But not Identify!' });
            }
         });
      }
      this.Form.controls['BillingState'].setValue(null);
      this.Form.controls['BillingCity'].setValue(null);
   }

   BillingState_Change() {
      const SelectedState = this.Form.controls['BillingState'].value;
      if ( SelectedState !== null && typeof SelectedState === 'object' && Object.keys(SelectedState).length > 0) {
         const Data = {State_Id: SelectedState._id, 'User_Id' : this.User_Id };
          let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
          Info = Info.toString();
          // Get City List
         this.Service.City_List({'Info': Info}).subscribe( response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this.AllCityOfState = DecryptedData;
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'State Based City List Getting Error!, But not Identify!' });
            }
         });
      }
      this.Form.controls['BillingCity'].setValue(null);
   }

   ShopFloorCountry_Change() {
      const SelectedCountry = this.Form.controls['ShopFloorCountry'].value;
      if (!this.Form.controls['SameAddresses'].value && SelectedCountry !== null && typeof SelectedCountry === 'object' && Object.keys(SelectedCountry).length > 0) {
         const Data = {Country_Id: SelectedCountry._id, 'User_Id' : this.User_Id };
          let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
          Info = Info.toString();
          // Get State List
         this.Service.State_List({'Info': Info}).subscribe( response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this.ShopFloorAllStateOfCountry = DecryptedData;
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Country Based States List Getting Error!, But not Identify!' });
            }
         });
      }
      if (!this.Form.controls['SameAddresses'].value) {
         this.Form.controls['ShopFloorState'].setValue(null);
         this.Form.controls['ShopFloorCity'].setValue(null);
      }
   }

   ShopFloorState_Change() {
      const SelectedState = this.Form.controls['ShopFloorState'].value;
      if ( !this.Form.controls['SameAddresses'].value && SelectedState !== null && typeof SelectedState === 'object' && Object.keys(SelectedState).length > 0) {
         const Data = {State_Id: SelectedState._id, 'User_Id' : this.User_Id };
          let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
          Info = Info.toString();
          // Get City List
         this.Service.City_List({'Info': Info}).subscribe( response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this.ShopFloorAllCityOfState = DecryptedData;
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'State Based City List Getting Error!, But not Identify!' });
            }
         });
      }
      if (!this.Form.controls['SameAddresses'].value) {
         this.Form.controls['ShopFloorCity'].setValue(null);
      }
   }

   SameAddresses_Change() {
      const Status = this.Form.controls['SameAddresses'].value;
      if (Status) {
         this.Form.controls['ShopFloorStreet'].setValue(this.Form.controls['BillingStreet'].value);
         this.Form.controls['ShopFloorArea'].setValue(this.Form.controls['BillingArea'].value);
         this.Form.controls['ShopFloorCountry'].setValue(this.Form.controls['BillingCountry'].value);
         this.ShopFloorAllStateOfCountry = this.AllStateOfCountry;
         setTimeout(() => {
            this.Form.controls['ShopFloorState'].setValue(this.Form.controls['BillingState'].value);
         }, 100);
         this.ShopFloorAllCityOfState = this.AllCityOfState;
         setTimeout(() => {
            this.Form.controls['ShopFloorCity'].setValue(this.Form.controls['BillingCity'].value);
         }, 100);
         this.Form.controls['ShopFloorZipCode'].setValue(this.Form.controls['BillingZipCode'].value);
         setTimeout(() => {
            this.Form.controls['ShopFloorStreet'].disable();
            this.Form.controls['ShopFloorArea'].disable();
            this.Form.controls['ShopFloorCountry'].disable();
            this.Form.controls['ShopFloorState'].disable();
            this.Form.controls['ShopFloorCity'].disable();
            this.Form.controls['ShopFloorZipCode'].disable();
         }, 100);
      } else {
         this.Form.controls['ShopFloorStreet'].enable();
         this.Form.controls['ShopFloorArea'].enable();
         this.Form.controls['ShopFloorCountry'].enable();
         this.Form.controls['ShopFloorState'].enable();
         this.Form.controls['ShopFloorCity'].enable();
         this.Form.controls['ShopFloorZipCode'].enable();
         this.Form.controls['ShopFloorStreet'].setValue('');
         this.Form.controls['ShopFloorArea'].setValue('');
         this.Form.controls['ShopFloorCountry'].setValue(null);
         this.Form.controls['ShopFloorState'].setValue(null);
         this.Form.controls['ShopFloorCity'].setValue(null);
         this.Form.controls['ShopFloorZipCode'].setValue('');
      }
   }

   BillingAddressAny_Changes() {
      const Status = this.Form.controls['SameAddresses'].value;
      if (Status) {
         this.Form.controls['SameAddresses'].setValue(false);
         this.Form.controls['ShopFloorStreet'].enable();
         this.Form.controls['ShopFloorArea'].enable();
         this.Form.controls['ShopFloorCountry'].enable();
         this.Form.controls['ShopFloorState'].enable();
         this.Form.controls['ShopFloorCity'].enable();
         this.Form.controls['ShopFloorZipCode'].enable();
         this.Form.controls['ShopFloorStreet'].setValue('');
         this.Form.controls['ShopFloorArea'].setValue('');
         this.Form.controls['ShopFloorCountry'].setValue(null);
         this.Form.controls['ShopFloorState'].setValue(null);
         this.Form.controls['ShopFloorCity'].setValue(null);
         this.Form.controls['ShopFloorZipCode'].setValue('');
      }
   }

   Submit() {
      if (this.Form.valid) {
         let Info = CryptoJS.AES.encrypt(JSON.stringify(this.Form.getRawValue()), 'SecretKeyIn@123');
         Info = Info.toString();
         this.Crm_Service.CrmCustomers_Create({ 'Info': Info }).subscribe( response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
                this.Toastr.NewToastrMessage({ Type: 'Success', Message: 'New Customer Successfully Created' });
               this.router.navigate(['/Crm_Customers_List']);
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Creating Customer Getting Error!, But not Identify!' });
            }
         });
      }

   }

}
