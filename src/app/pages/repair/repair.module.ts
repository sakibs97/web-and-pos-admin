import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RepairRoutingModule } from './repair-routing.module';
import { MaterialModule } from '../../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DigitOnlyModule } from "@uiowa/digit-only";
import { NoContentComponent } from '../../shared/components/no-content/no-content.component';
import { PageLoaderComponent } from '../../shared/components/page-loader/page-loader.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../shared/components/ui/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyIconPipe } from '../../shared/pipes/currency-icon.pipe';
import { LimitTextPipe } from '../../shared/pipes/limit-text.pipe';
import { PatternLockComponent } from '../../shared/components/pattern-lock/pattern-lock.component';
import { ExportToolbarComponent } from '../../shared/components/export-toolbar/export-toolbar.component';

// Brand Components
import { AllBrandComponent } from './brand/all-brand/all-brand.component';
import { AddBrandComponent } from './brand/add-brand/add-brand.component';

// Model Components
import { AllModelComponent } from './model/all-model/all-model.component';
import { AddModelComponent } from './model/add-model/add-model.component';

// Problem Components
import { AllProblemComponent } from './problem/all-problem/all-problem.component';
import { AddProblemComponent } from './problem/add-problem/add-problem.component';

// Repair Components
import { RepairListComponent } from './repair-list/repair-list.component';
import { AddRepairComponent } from './add-repair/add-repair.component';
import { TechnicianReportComponent } from './technician-report/technician-report.component';
import { AllTechnicianComponent } from './technician/all-technician/all-technician.component';
import { AddTechnicianComponent } from './technician/add-technician/add-technician.component';

@NgModule({
  declarations: [
    // Brand
    AllBrandComponent,
    AddBrandComponent,
    // Model
    AllModelComponent,
    AddModelComponent,
    // Problem
    AllProblemComponent,
    AddProblemComponent,
    // Repair
    RepairListComponent,
    AddRepairComponent,
    TechnicianReportComponent,
    AllTechnicianComponent,
    AddTechnicianComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    RepairRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    DigitOnlyModule,
    NoContentComponent,
    PageLoaderComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    CurrencyIconPipe,
    LimitTextPipe,
    PatternLockComponent,
    ExportToolbarComponent,
  ]
})
export class RepairModule { }

