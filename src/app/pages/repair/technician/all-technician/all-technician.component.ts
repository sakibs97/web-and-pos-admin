import { AfterViewInit, Component, inject, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UiService } from '../../../../services/core/ui.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { Pagination } from '../../../../interfaces/core/pagination';
import { ConfirmDialogComponent } from '../../../../shared/components/ui/confirm-dialog/confirm-dialog.component';
import { TechnicianService } from '../../../../services/common/technician.service';
import { FilterData } from '../../../../interfaces/gallery/filter-data';
import { DataTableSelectionBase } from '../../../../mixin/data-table-select-base.mixin';
import { adminBaseMixin } from '../../../../mixin/admin-base.mixin';
import { PageDataService } from '../../../../services/core/page-data.service';
import { Title } from '@angular/platform-browser';
import { VendorService } from '../../../../services/vendor/vendor.service';

@Component({
    selector: 'app-all-technician',
    templateUrl: './all-technician.component.html',
    styleUrls: ['./all-technician.component.scss']
})
export class AllTechnicianComponent extends DataTableSelectionBase(adminBaseMixin(Component)) implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('searchForm', { static: true }) private searchForm: NgForm;

    override allTableData: any[] = [];
    protected adminRole: any;

    isLoading: boolean = true;
    protected currentPage = 1;
    protected totalData = 0;
    protected dataPerPage = 10;

    filter: any = null;
    defaultFilter: any = null;
    searchQuery = null;
    private sortQuery = { name: 1 };
    private readonly select: any = {
        name: 1,
        phoneNo: 1,
        address: 1,
        status: 1,
        createdAt: 1,
    }

    activeSort: number = null;
    activeFilter1: number = null;

    private subscriptions: Subscription[] = [];

    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly dialog = inject(MatDialog);
    private readonly uiService = inject(UiService);
    private readonly reloadService = inject(ReloadService);
    private readonly pageDataService = inject(PageDataService);
    private readonly title = inject(Title);
    private readonly vendorService = inject(VendorService);
    private readonly technicianService = inject(TechnicianService);

    ngOnInit() {
        this.adminRole = this.vendorService.getUserRole();
        const subReload = this.reloadService.refreshData$.subscribe(() => {
            this.getAllTechnicians();
        });
        this.subscriptions.push(subReload);

        const subActivateRoute = this.activatedRoute.queryParamMap.subscribe(qParam => {
            if (qParam && qParam.get('page')) {
                this.currentPage = Number(qParam.get('page'));
            } else {
                this.currentPage = 1;
            }
            if (qParam && qParam.get('search')) {
                this.searchQuery = qParam.get('search');
            }
            this.getAllTechnicians();
        });
        this.subscriptions.push(subActivateRoute);

        this.setPageData();
    }

    ngAfterViewInit(): void {
        const formValue = this.searchForm.valueChanges;
        const subSearch = formValue.pipe(
            map((t: any) => t['searchTerm']),
            filter(() => this.searchForm.valid),
            debounceTime(500),
            distinctUntilChanged(),
        ).subscribe((searchTerm: string) => {
            if (searchTerm) {
                this.router.navigate([], {
                    queryParams: { search: searchTerm },
                    queryParamsHandling: 'merge'
                }).then();
            } else {
                this.router.navigate([], {
                    queryParams: { search: null },
                    queryParamsHandling: 'merge'
                }).then();
            }
        });
        this.subscriptions.push(subSearch);
    }

    private setPageData(): void {
        this.title.setTitle('Technicians');
        this.pageDataService.setPageData({
            title: 'Technicians',
            navArray: [
                { name: 'Dashboard', url: `/dashboard` },
                { name: 'Repair', url: `/repair` },
                { name: 'Technicians', url: '' },
            ]
        })
    }

    private getAllTechnicians() {
        this.isLoading = true;
        const pagination: Pagination = {
            pageSize: Number(this.dataPerPage),
            currentPage: Number(this.currentPage) - 1
        };

        const filterData: FilterData = {
            pagination: pagination,
            filter: this.filter,
            select: this.select,
            sort: this.sortQuery
        }

        const subscription = this.technicianService.getAllTechniciansByShop(filterData, this.searchQuery)
            .subscribe({
                next: res => {
                    this.allTableData = res.data;
                    this.totalData = res.count ?? 0;
                    if (this.allTableData && this.allTableData.length) {
                        this.allTableData.forEach((m, i) => {
                            const index = this.selectedIds.findIndex(f => f === m._id);
                            this.allTableData[i].select = index !== -1;
                        });
                        this.checkSelectionData();
                    }
                    this.isLoading = false;
                },
                error: err => {
                    this.isLoading = false;
                    console.log(err)
                }
            });
        this.subscriptions.push(subscription);
    }

    onDelete(id: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '400px',
            data: {
                title: 'Confirm Delete',
                message: 'Are you sure you want to delete this technician?'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.technicianService.deleteTechnicianById(id).subscribe({
                    next: (res) => {
                        if (res.success) {
                            this.uiService.message(res.message || 'Deleted successfully', 'success');
                            this.reloadService.needRefreshData$();
                        } else {
                            this.uiService.message(res.message, 'warn');
                        }
                    }
                });
            }
        });
    }

    onPageChanged(event: any) {
        this.router.navigate([], { queryParams: { page: event } }).then();
    }

    onClearSearch() {
        this.searchForm.reset();
        this.searchQuery = null;
        this.router.navigate([], { queryParams: { search: null } }).then();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub?.unsubscribe());
    }
}
