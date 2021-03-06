import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ModelExpensesViewComponent } from '../../../../models/HRMS/model-expenses-view/model-expenses-view.component';
import { ModelExpensesApproveComponent } from '../../../../models/HRMS/model-expenses-approve/model-expenses-approve.component';
import { ModelExpensesPayComponent } from '../../../../models/HRMS/model-expenses-pay/model-expenses-pay.component';
import * as CryptoJS from 'crypto-js';

import { HrmsServiceService } from './../../../../services/Hrms/hrms-service.service';
import { ToastrService } from '../../../../services/common-services/toastr-service/toastr.service';
import { LoginService } from './../../../../services/LoginService/login.service';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
})
export class ExpensesListComponent implements OnInit {


   bsModalRef: BsModalRef;
   Loader: Boolean = true;
   _List: any[] = [];
   User_Id: any;
   User_Type: any;
   IfEmployeeId: any;

   _ShowMenus: any[] = [];

   Active_Id: any;

   constructor(   private modalService: BsModalService,
                  private Toastr: ToastrService,
                  public router: Router,
                  public Login_Service: LoginService,
                  public Service: HrmsServiceService
                ) {
                     this.User_Id = this.Login_Service.LoginUser_Info()['_id'];
                     this.User_Type = this.Login_Service.LoginUser_Info()['User_Type'];
                     if (this.User_Type === 'Employee') {
                        this.IfEmployeeId = this.Login_Service.LoginUser_Info()['Employee']['_id'];
                     }
                     // Get Expenses List
                     const Data = { 'User_Id' : this.User_Id, 'Employee_Id': this.IfEmployeeId };
                     let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
                     Info = Info.toString();
                     this.Service.Expenses_List({'Info': Info}).subscribe( response => {
                        const ResponseData = JSON.parse(response['_body']);
                        this.Loader = false;
                        if (response['status'] === 200 && ResponseData['Status'] ) {
                           const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
                           const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
                           this._List = DecryptedData;
                        } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
                           this.Toastr.NewToastrMessage({Type: 'Error', Message: ResponseData['Message']});
                        } else if (response['status'] === 401 && !ResponseData['Status']) {
                           this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
                        } else {
                        this.Toastr.NewToastrMessage( {  Type: 'Error', Message: 'Some Error Occurred!, But not Identify!'  });
                        }
                     });
                  }

   ngOnInit() { }


   Active_Id_Change(index) {
      this.Active_Id = this._List[index]._id;
      this._ShowMenus = [];
      const Stage = this._List[index].Stage;
      if (Stage === 'Stage_1') {
         this._ShowMenus = ['SendToApprove', 'DraftEdit'];
      }
      if (Stage === 'Stage_2' || Stage === 'Stage_4') {
         if (this.User_Type === 'Employee') {
            this._ShowMenus = [];
         } else {
            this._ShowMenus = ['Approve', 'Reject', 'SendToModify'];
         }
      }
      if (Stage === 'Stage_3') {
         this._ShowMenus = ['ModifyData'];
      }
      if ((Stage === 'Stage_5' || Stage === 'Stage_7') && this.User_Type !== 'Employee') {
         this._ShowMenus = ['Payment'];
      }
      if (Stage === 'Stage_6' || Stage === 'Stage_8') {
         this._ShowMenus = [];
      }
   }

   IfShowMenu(value) {
      return this._ShowMenus.includes(value);
   }

   // View Expenses
   ViewExpenses() {
      const _index = this._List.findIndex(obj =>  this.Active_Id === obj._id);
      const initialState = {
         Type: 'View',
         _Data: this._List[_index]
      };
      this.bsModalRef = this.modalService.show(ModelExpensesViewComponent, Object.assign({initialState}, { class: 'modal-lg max-width-85' }));
   }

   EditExpenses() {
      this.router.navigate(['/Edit_Expenses', this.Active_Id]);
   }

   SendToApprove() {
      const _index = this._List.findIndex(obj =>  this.Active_Id === obj._id);
      const Data = { 'User_Id' : this.User_Id, 'Expenses_Id': this.Active_Id };
      let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
      Info = Info.toString();
      this.Service.Expenses_SendToApprove({'Info': Info}).subscribe( response => {
         const ResponseData = JSON.parse(response['_body']);
         this.Loader = false;
         if (response['status'] === 200 && ResponseData['Status'] ) {
            this._List[_index].Current_Status = 'Waiting For Approve';
            this._List[_index].Stage = 'Stage_2';
         } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
            this.Toastr.NewToastrMessage({Type: 'Error', Message: ResponseData['Message']});
         } else if (response['status'] === 401 && !ResponseData['Status']) {
            this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
         } else {
         this.Toastr.NewToastrMessage( {  Type: 'Error', Message: 'Some Error Occurred!, But not Identify!'  });
         }
      });
   }

   Approve() {
      const _index = this._List.findIndex(obj =>  this.Active_Id === obj._id);
      const initialState = {
         Type: 'View',
         _Data: this._List[_index]
      };
      this.bsModalRef = this.modalService.show(ModelExpensesApproveComponent, Object.assign({initialState}, { class: 'modal-lg max-width-85' }));
      this.bsModalRef.content.onClose.subscribe(ResponseStatus => {
         if (ResponseStatus['Status']) {
            this._List[_index].Current_Status = 'Approved';
            this._List[_index].Stage = 'Stage_5';
            this._List[_index].Total_Approved_Expenses = ResponseStatus['Response']['Total_Approved_Expenses'];
            ResponseStatus['Response']['Expenses_Array'].map(obj => {
               const List_index = this._List[_index]['Expenses_Array'].findIndex(list_obj =>  obj['Expenses_Array_Id'] === list_obj._id);
               this._List[_index]['Expenses_Array'][List_index]['Approved_Amount'] = obj['Approved_Amount'];
            });
         }
      });
   }

   payment() {
      const _index = this._List.findIndex(obj =>  this.Active_Id === obj._id);
      const initialState = {
         Type: 'View',
         _Data: this._List[_index]
      };
      this.bsModalRef = this.modalService.show(ModelExpensesPayComponent, Object.assign({initialState}, { class: 'modal-lg max-width-85' }));
      this.bsModalRef.content.onClose.subscribe(ResponseStatus => {
         if (ResponseStatus['Status']) {
            if (parseFloat(ResponseStatus['Response']['Total_Approved_Expenses'].toString()) === parseFloat(ResponseStatus['Response']['Total_Paid_Expenses'].toString())) {
               this._List[_index].Current_Status = 'Payment Completed';
               this._List[_index].Stage = 'Stage_8';
               this._List[_index].Payment_Remarks = ResponseStatus['Response']['Payment_Remarks'];
            } else {
               this._List[_index].Current_Status = 'Payment Pending';
               this._List[_index].Stage = 'Stage_7';
               this._List[_index].Payment_Remarks = ResponseStatus['Response']['Payment_Remarks'];
            }
            this._List[_index].Total_Paid_Expenses = ResponseStatus['Response']['Total_Paid_Expenses'];
            ResponseStatus['Response']['Expenses_Array'].map(obj => {
               const List_index = this._List[_index]['Expenses_Array'].findIndex(list_obj =>  obj['Expenses_Array_Id'] === list_obj._id);
               this._List[_index]['Expenses_Array'][List_index]['Paid_Amount'] = obj['Paid_Amount'];
            });
         }
      });
   }

   Reject() {
      const _index = this._List.findIndex(obj =>  this.Active_Id === obj._id);
      const Data = { 'User_Id' : this.User_Id, 'Expenses_Id': this.Active_Id };
      let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
      Info = Info.toString();
      this.Service.Expenses_Rejected({'Info': Info}).subscribe( response => {
         const ResponseData = JSON.parse(response['_body']);
         this.Loader = false;
         if (response['status'] === 200 && ResponseData['Status'] ) {
            this._List[_index].Current_Status = 'Rejected';
            this._List[_index].Stage = 'Stage_6';
         } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
            this.Toastr.NewToastrMessage({Type: 'Error', Message: ResponseData['Message']});
         } else if (response['status'] === 401 && !ResponseData['Status']) {
            this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
         } else {
         this.Toastr.NewToastrMessage( {  Type: 'Error', Message: 'Some Error Occurred!, But not Identify!'  });
         }
      });
   }

   SendToModify() {
      const _index = this._List.findIndex(obj =>  this.Active_Id === obj._id);
      const Data = { 'User_Id' : this.User_Id, 'Expenses_Id': this.Active_Id };
      let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
      Info = Info.toString();
      this.Service.Expenses_SendToModify({'Info': Info}).subscribe( response => {
         const ResponseData = JSON.parse(response['_body']);
         this.Loader = false;
         if (response['status'] === 200 && ResponseData['Status'] ) {
            this._List[_index].Current_Status = 'Modify';
            this._List[_index].Stage = 'Stage_3';
         } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
            this.Toastr.NewToastrMessage({Type: 'Error', Message: ResponseData['Message']});
         } else if (response['status'] === 401 && !ResponseData['Status']) {
            this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
         } else {
         this.Toastr.NewToastrMessage( {  Type: 'Error', Message: 'Some Error Occurred!, But not Identify!'  });
         }
      });
   }



}
