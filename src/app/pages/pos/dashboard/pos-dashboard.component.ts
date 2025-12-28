import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReportsService } from '../../../services/common/reports.service';
import { UiService } from '../../../services/core/ui.service';
import { VendorService } from '../../../services/vendor/vendor.service';
import { CurrencyIconPipe } from '../../../shared/pipes/currency-icon.pipe';

@Component({
  selector: 'app-pos-dashboard',
  templateUrl: './pos-dashboard.component.html',
  styleUrls: ['./pos-dashboard.component.scss']
})
export class PosDashboardComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  dashboardData: any = {
    todaySale: 0,
    todayProfit: 0,
    todayDue: 0,
    expense: 0,
    cashInHand: 0,
    invoiceCount: 0
  };

  private subDataOne: Subscription;
  private readonly vendorService = inject(VendorService);
  private readonly router = inject(Router);

  constructor(
    private reportsService: ReportsService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    // Check if user has permission to access POS Dashboard
    const role = this.vendorService.getUserRole?.();
    const allowedPages = this.vendorService.getUserPagePermissions?.() || [];
    
    // Only owner and admin can access POS Dashboard by default
    // For other roles, check if they have 'pos-dashboard' permission
    if (role !== 'owner' && role !== 'admin') {
      const hasPermission = Array.isArray(allowedPages) && 
        allowedPages.some(page => 
          page?.toLowerCase() === 'pos-dashboard' || 
          page?.toLowerCase() === 'pos/dashboard'
        );
      
      if (!hasPermission) {
        this.uiService.message('You do not have permission to access POS Dashboard', 'warn');
        this.router.navigate(['/pages/dashboard']);
        return;
      }
    }
    
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.subDataOne = this.reportsService.getTodayDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboardData = res.data || this.dashboardData;
        } else {
          this.uiService.message(res.message || 'Failed to load dashboard data', 'warn');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.uiService.message('Failed to load dashboard data', 'wrong');
        this.isLoading = false;
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    if (this.subDataOne) {
      this.subDataOne.unsubscribe();
    }
  }
}

