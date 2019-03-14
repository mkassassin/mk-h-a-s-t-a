import { Component, OnInit } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ModelActivitytypeCrmsettingsComponent } from '../../../../../models/settings/crm_settings/model-activitytype-crmsettings/model-activitytype-crmsettings.component';
import { DeleteConfirmationComponent } from '../../../../Common-Components/delete-confirmation/delete-confirmation.component';

import { CrmSettingsService } from './../../../../../services/settings/crmSettings/crm-settings.service';
import * as CryptoJS from 'crypto-js';
import { ToastrService } from '../../../../../services/common-services/toastr-service/toastr.service';
import { LoginService } from './../../../../../services/LoginService/login.service';

@Component({
  selector: 'app-activity-type-crm-settings',
  templateUrl: './activity-type-crm-settings.component.html',
  styleUrls: ['./activity-type-crm-settings.component.css']
})
export class ActivityTypeCrmSettingsComponent implements OnInit {

   bsModalRef: BsModalRef;
   Loader: Boolean = true;
   _List: any[] = [];
   User_Id;

   constructor (  private modalService: BsModalService,
                  private Service: CrmSettingsService,
                  private Toastr: ToastrService,
                  public Login_Service: LoginService
               ) {
                  this.User_Id = this.Login_Service.LoginUser_Info()['_id'];
                  //  Get Activity Type List
                     const Data = { 'User_Id' : this.User_Id };
                     let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
                     Info = Info.toString();
                     this.Service.Activity_Type_List({'Info': Info}).subscribe( response => {
                       console.log(response);
                        const ResponseData = JSON.parse(response['_body']);
                        this.Loader = false;
                        if (response['status'] === 200 && ResponseData['Status'] ) {
                           const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
                           const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
                           this._List = DecryptedData;
                        } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
                          this.Toastr.NewToastrMessage({ Type: 'Error', Message: response['Message'] });
                        } else if (response['status'] === 401 && !ResponseData['Status']) {
                          this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
                       } else {
                          this.Toastr.NewToastrMessage( { Type: 'Error', Message: 'Some Error Occurred!, But not Identify!'} );
                        }
                     });
                  }
   ngOnInit() {
   }
   // Create New Industry Type
      CreateActivitytype() {
         const initialState = { Type: 'Create' };
         this.bsModalRef = this.modalService.show(ModelActivitytypeCrmsettingsComponent, Object.assign({initialState}, {ignoreBackdropClick: true, class: '' }));
         this.bsModalRef.content.onClose.subscribe(response => {
            if (response.Status) {
               this._List.splice(0, 0, response.Response);
            }
         });
      }
   // Edit Industry Type
      EditActivitytype(_index) {
         const initialState = {
            Type: 'Edit',
            Data: this._List[_index]
         };
         this.bsModalRef = this.modalService.show(ModelActivitytypeCrmsettingsComponent, Object.assign({initialState}, { ignoreBackdropClick: true, class: '' }));
         this.bsModalRef.content.onClose.subscribe(response => {
            if (response.Status) {
               this._List[_index] = response.Response;
            }
         });
      }
   // View Activity Type
      ViewActivitytype(_index) {
         const initialState = {
            Type: 'View',
            Data: this._List[_index]
         };
         this.bsModalRef = this.modalService.show(ModelActivitytypeCrmsettingsComponent, Object.assign({initialState}, { class: '' }));
      }
   // Delete Activity Type
   DeleteActivityType(_index) {
      const initialState = {
         Text: 'Activity Type'
      };
      this.bsModalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { ignoreBackdropClick: true, class: 'modal-sm' }));
      this.bsModalRef.content.onClose.subscribe(response => {
         if (response.Status) {
            const Data = { 'Activity_Type_Id' :  this._List[_index]._id, 'Modified_By' : this.User_Id};
            let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
            Info = Info.toString();
            this.Service.Activity_Type_Delete({'Info': Info}).subscribe( returnResponse => {
               const ResponseData = JSON.parse(returnResponse['_body']);
               if (returnResponse['status'] === 200 && ResponseData['Status'] ) {
                  this._List.splice(_index, 1);
                  this.Toastr.NewToastrMessage( {  Type: 'Warning',  Message: 'Activity Type Successfully Deleted' } );
               } else if (returnResponse['status'] === 400 || returnResponse['status'] === 417 && !ResponseData['Status']) {
                 this.Toastr.NewToastrMessage({  Type: 'Error',  Message: ResponseData['Message'] });
               }  else if (response['status'] === 401 && !ResponseData['Status']) {
                this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
             } else {
                  this.Toastr.NewToastrMessage({  Type: 'Error',  Message: 'Some Error Occurred!, But not Identify!' } );
               }
            });
         }
      });
   }
}
