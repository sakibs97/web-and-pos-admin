import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UiService } from '../../../../services/core/ui.service';
import { TechnicianService } from '../../../../services/common/technician.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { PageDataService } from '../../../../services/core/page-data.service';
import { Title } from '@angular/platform-browser';
import { adminBaseMixin } from '../../../../mixin/admin-base.mixin';

@Component({
    selector: 'app-add-technician',
    templateUrl: './add-technician.component.html',
    styleUrls: ['./add-technician.component.scss']
})
export class AddTechnicianComponent extends adminBaseMixin(Component) implements OnInit, OnDestroy {

    @ViewChild('formElement') formElement: NgForm;
    dataForm?: FormGroup;

    id?: string;
    technician?: any;
    isLoading: boolean = false;

    private subscriptions: Subscription[] = [];

    private readonly fb = inject(FormBuilder);
    private readonly uiService = inject(UiService);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly technicianService = inject(TechnicianService);
    private readonly router = inject(Router);
    private readonly reloadService = inject(ReloadService);
    private readonly pageDataService = inject(PageDataService);
    private readonly title = inject(Title);

    ngOnInit(): void {
        this.initDataForm();
        this.setPageData();

        const subRoute = this.activatedRoute.paramMap.subscribe((param) => {
            this.id = param.get('id');
            if (this.id) {
                this.getTechnicianById();
            }
        });
        this.subscriptions.push(subRoute);
    }

    private setPageData(): void {
        const pageTitle = this.id ? 'Edit Technician' : 'Add Technician';
        this.title.setTitle(pageTitle);
        this.pageDataService.setPageData({
            title: pageTitle,
            navArray: [
                { name: 'Dashboard', url: `/dashboard` },
                { name: 'Repair', url: `/repair` },
                { name: 'Technician', url: `/repair/technician-list` },
                { name: pageTitle, url: '' },
            ]
        })
    }

    private initDataForm() {
        this.dataForm = this.fb.group({
            name: [null, Validators.required],
            phoneNo: [null],
            address: [null],
            status: ['Active', Validators.required],
        });
    }

    private setFormValue() {
        this.dataForm.patchValue(this.technician);
    }

    onSubmit() {
        if (this.dataForm.invalid) {
            this.uiService.message('Please fill all the required fields', 'warn');
            return;
        }
        if (this.technician) {
            this.updateTechnicianById();
        } else {
            this.addTechnician();
        }
    }

    private getTechnicianById() {
        const subscription = this.technicianService.getTechnicianById(this.id)
            .subscribe({
                next: (res => {
                    if (res.data) {
                        this.technician = res.data;
                        this.setFormValue();
                    }
                }),
                error: (error => {
                    console.log(error);
                })
            });
        this.subscriptions.push(subscription);
    }

    private addTechnician() {
        const subscription = this.technicianService.addTechnician(this.dataForm.value)
            .subscribe({
                next: (res => {
                    if (res.success) {
                        this.uiService.message(res.message || 'Technician added successfully', 'success');
                        this.formElement.resetForm();
                        this.reloadService.needRefreshData$();
                        this.router.navigate(['/repair/technician-list']).then();
                    } else {
                        this.uiService.message(res.message, 'warn');
                    }
                }),
                error: (error => {
                    console.log(error);
                })
            });
        this.subscriptions.push(subscription);
    }

    private updateTechnicianById() {
        const subscription = this.technicianService.updateTechnicianById(this.technician._id, this.dataForm.value)
            .subscribe({
                next: (res => {
                    if (res.success) {
                        this.uiService.message(res.message || 'Technician updated successfully', 'success');
                        this.reloadService.needRefreshData$();
                        this.router.navigate(['/repair/technician-list']).then();
                    } else {
                        this.uiService.message(res.message, 'warn');
                    }
                }),
                error: (error => {
                    console.log(error);
                })
            });
        this.subscriptions.push(subscription);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub?.unsubscribe());
    }
}
