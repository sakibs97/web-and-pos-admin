import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddProductRoutingModule } from './add-product-routing.module';
import { AddProductComponent } from './add-product.component';
import {AddTagComponent} from "./catalog-popup/add-tag/add-tag.component";
import {AddSubCategoryComponent} from "./catalog-popup/add-sub-category/add-sub-category.component";
import {AddChildCategoryComponent} from "./catalog-popup/add-child-category/add-child-category.component";
import {AddBrandComponent} from "./catalog-popup/add-brand/add-brand.component";
import {DigitOnlyModule} from "@uiowa/digit-only";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  GalleryImagePickerComponent
} from "../../../shared/components/gallery-image-picker/gallery-image-picker.component";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {BreadcrumbComponent} from "../../../shared/components/breadcrumb/breadcrumb.component";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatMenuModule} from "@angular/material/menu";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {AddCategoryComponent} from "./catalog-popup/add-category/add-category.component";
import {NgxPaginationModule} from "ngx-pagination";
import {NoContentComponent} from "../../../shared/components/no-content/no-content.component";
import {PageLoaderComponent} from "../../../shared/components/page-loader/page-loader.component";
import {RoleViewPipe} from "../../../shared/pipes/role-view.pipe";
import {NoWhitespaceModule} from "../../../shared/directives/no-whitespace/no-whitespace.module";
import {CdkDropList, DragDropModule} from "@angular/cdk/drag-drop";
import {LimitTextPipe} from "../../../shared/pipes/limit-text.pipe";
import {PaginationComponent} from "../../../shared/components/pagination/pagination.component";
import {
  GalleryImageViewerComponent
} from "../../../shared/components/gallery-image-viewer/gallery-image-viewer.component";
import {NoTableDataComponent} from "../../../shared/components/no-table-data/no-table-data.component";
import {HtmlEditorComponent} from "../../../shared/components/html-editor/html-editor.component";
import {MyGalleryModule} from '../../my-gallery/my-gallery.module';
import { SkinTypeComponent } from './catalog-popup/skin-type/skin-type.component';
import { SkinConcernComponent } from './catalog-popup/skin-concern/skin-concern.component';


@NgModule({
  declarations: [
    AddProductComponent,

    AddCategoryComponent,
    AddTagComponent,
    AddSubCategoryComponent,
    AddChildCategoryComponent,
    AddBrandComponent,
    SkinTypeComponent,
    SkinConcernComponent,
  ],
  imports: [
    CommonModule,
    AddProductRoutingModule,
    DigitOnlyModule,
    FormsModule,
    GalleryImagePickerComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule,
    BreadcrumbComponent,

    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatDividerModule,



    FormsModule,
    NgxPaginationModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    DigitOnlyModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    NoContentComponent,
    PageLoaderComponent,
    RoleViewPipe,
    MatDatepickerModule,
    NoWhitespaceModule,
    MatCardModule,
    MyGalleryModule,
    CdkDropList,
    DragDropModule,
    GalleryImagePickerComponent,
    LimitTextPipe,
    PaginationComponent,
    GalleryImageViewerComponent,
    GalleryImagePickerComponent,
    LimitTextPipe,
    NoTableDataComponent,
    PaginationComponent,
    HtmlEditorComponent,
  ]
})
export class AddProductModule { }
