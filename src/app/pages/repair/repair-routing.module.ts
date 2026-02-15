import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepairListComponent } from './repair-list/repair-list.component';
import { AddRepairComponent } from './add-repair/add-repair.component';
import { AllBrandComponent } from './brand/all-brand/all-brand.component';
import { AddBrandComponent } from './brand/add-brand/add-brand.component';
import { AllModelComponent } from './model/all-model/all-model.component';
import { AddModelComponent } from './model/add-model/add-model.component';
import { AllProblemComponent } from './problem/all-problem/all-problem.component';
import { AddProblemComponent } from './problem/add-problem/add-problem.component';
import { TechnicianReportComponent } from './technician-report/technician-report.component';
import { AllTechnicianComponent } from './technician/all-technician/all-technician.component';
import { AddTechnicianComponent } from './technician/add-technician/add-technician.component';

const routes: Routes = [
  { path: '', redirectTo: 'repair-list', pathMatch: 'full' },
  { path: 'repair-list', component: RepairListComponent },
  { path: 'add-repair', component: AddRepairComponent },
  { path: 'edit-repair/:id', component: AddRepairComponent },
  { path: 'brand-list', component: AllBrandComponent },
  { path: 'add-brand', component: AddBrandComponent },
  { path: 'edit-brand/:id', component: AddBrandComponent },
  { path: 'model-list', component: AllModelComponent },
  { path: 'add-model', component: AddModelComponent },
  { path: 'edit-model/:id', component: AddModelComponent },
  { path: 'problem-list', component: AllProblemComponent },
  { path: 'add-problem', component: AddProblemComponent },
  { path: 'edit-problem/:id', component: AddProblemComponent },
  { path: 'technician-report', component: TechnicianReportComponent },
  { path: 'technician-list', component: AllTechnicianComponent },
  { path: 'add-technician', component: AddTechnicianComponent },
  { path: 'edit-technician/:id', component: AddTechnicianComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepairRoutingModule { }

