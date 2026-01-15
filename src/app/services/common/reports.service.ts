import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { VendorService } from '../vendor/vendor.service';

const API_REPORTS = environment.apiBaseLink + '/api/reports/';
const API_FINANCIAL_REPORTS = environment.apiBaseLink + '/api/financial-reports/';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(
    private httpClient: HttpClient,
    private vendorService: VendorService
  ) {
  }

  /**
   * Get Shop ID from Vendor Service
   */
  private getShopId(): string | null {
    const shopId = this.vendorService.getShopId();
    return shopId ? shopId : null;
  }

  /**
   * GET BALANCE SHEET (Using Reports API - date parameters commented out to fetch all expenses)
   */
  getBalanceSheet(startDate?: string, endDate?: string, asOnDate?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    // Date parameters commented out to fetch all data including expenses
    // if (asOnDate) {
    //   params = params.append('asOfDate', asOnDate);
    // }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'balance-sheet', { params });
  }

  /**
   * GET PROFIT & LOSS (New Financial Reports API)
   */
  getProfitAndLoss(startDate: string, endDate: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    
    return this.httpClient.get<ResponsePayload>(API_FINANCIAL_REPORTS + 'profit-loss', { params });
  }

  /**
   * GET TRIAL BALANCE
   */
  getTrialBalance(startDate?: string, endDate?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    
    return this.httpClient.get<ResponsePayload>(API_FINANCIAL_REPORTS + 'trial-balance', { params });
  }

  /**
   * GET CASH FLOW STATEMENT
   */
  getCashFlowStatement(startDate?: string, endDate?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    
    return this.httpClient.get<ResponsePayload>(API_FINANCIAL_REPORTS + 'cash-flow', { params });
  }

  /**
   * INITIALIZE CHART OF ACCOUNTS
   */
  initializeChartOfAccounts(): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    return this.httpClient.post<ResponsePayload>(
      environment.apiBaseLink + '/api/chart-of-accounts/initialize', 
      {}, 
      { params }
    );
  }

  /**
   * GET TAX REPORT
   */
  getTaxReport(startDate: string, endDate: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'tax', { params });
  }

  /**
   * GET PAYMENT GATEWAY FEES
   */
  getPaymentGatewayFees(startDate: string, endDate: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'payment-gateway-fees', { params });
  }

  /**
   * GET COURIER CHARGE REPORT
   */
  getCourierChargeReport(startDate: string, endDate: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'courier-charge', { params });
  }

  /**
   * GET DAILY SALE REPORT
   */
  getDailySaleReport(date: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('date', date);
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'daily-sale', { params });
  }

  /**
   * GET USER WISE SALE REPORT
   */
  getUserWiseSaleReport(startDate: string, endDate: string, userId?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    
    if (userId) {
      params = params.append('userId', userId);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'user-wise-sale', { params });
  }

  /**
   * GET PRODUCT WISE PROFIT REPORT
   */
  getProductWiseProfitReport(startDate: string, endDate: string, productId?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    
    if (productId) {
      params = params.append('productId', productId);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'product-profit', { params });
  }

  /**
   * GET TOP SELLING PRODUCTS
   */
  getTopSellingProducts(startDate: string, endDate: string, limit: number = 10): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    params = params.append('limit', limit.toString());
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'top-selling-products', { params });
  }

  /**
   * GET SLOW SELLING PRODUCTS
   */
  getSlowSellingProducts(startDate: string, endDate: string, limit: number = 10): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    params = params.append('limit', limit.toString());
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'slow-selling-products', { params });
  }

  /**
   * GET PURCHASE VS SALE COMPARISON
   */
  getPurchaseVsSaleComparison(startDate: string, endDate: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'purchase-vs-sale', { params });
  }

  /**
   * GET CUSTOMER DUE REPORT
   */
  getCustomerDueReport(customerId?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    if (customerId) {
      params = params.append('customerId', customerId);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'customer-due', { params });
  }

  /**
   * GET EXPENSE REPORT
   */
  getExpenseReport(startDate: string, endDate: string, categoryId?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    
    if (categoryId) {
      params = params.append('categoryId', categoryId);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'expense', { params });
  }

  /**
   * GET INVENTORY VALUATION
   */
  getInventoryValuation(): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'inventory-valuation', { params });
  }

  /**
   * GET STOCK VALUE REPORT
   */
  getStockValueReport(categoryId?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    if (categoryId) {
      params = params.append('categoryId', categoryId);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'stock-value', { params });
  }

  /**
   * GET BRANCH WISE SALE REPORT
   */
  getBranchWiseSaleReport(startDate: string, endDate: string, branch?: string, salesman?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    
    if (branch) {
      params = params.append('branch', branch);
    }
    
    if (salesman) {
      params = params.append('salesman', salesman);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'branch-wise-sale', { params });
  }

  /**
   * GET TODAY DASHBOARD
   */
  getTodayDashboard(): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'today-dashboard', { params });
  }

  /**
   * GET PURCHASE PAYMENT REPORT
   */
  getPurchasePaymentReport(startDate?: string, endDate?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    console.log('Purchase Payment Report - Shop ID:', shopId);
    
    if (shopId) {
      params = params.append('shop', shopId);
    } else {
      console.warn('Purchase Payment Report - Shop ID is missing!');
    }
    
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    
    console.log('Purchase Payment Report - API Params:', params.toString());
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'purchase-payment', { params });
  }

  /**
   * GET SELL PAYMENT REPORT
   */
  getSellPaymentReport(startDate?: string, endDate?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'sell-payment', { params });
  }

  /**
   * GET PRODUCT SELL REPORT
   */
  getProductSellReport(startDate?: string, endDate?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    console.log('Product Sell Report - Shop ID:', shopId);
    
    if (shopId) {
      params = params.append('shop', shopId);
    } else {
      console.warn('Product Sell Report - Shop ID is missing!');
    }
    
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    
    console.log('Product Sell Report - API Params:', params.toString());
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'product-sell', { params });
  }

  /**
   * GET PRODUCT PURCHASE REPORT
   */
  getProductPurchaseReport(startDate?: string, endDate?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'product-purchase', { params });
  }

  /**
   * GET ACTIVITY LOG
   */
  getActivityLog(startDate?: string, endDate?: string, userId?: string, subjectType?: string): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    
    if (userId) {
      params = params.append('userId', userId);
    }
    
    if (subjectType) {
      params = params.append('subjectType', subjectType);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'activity-log', { params });
  }

  /**
   * GET ACTIVITY LOG USERS
   */
  getActivityLogUsers(): Observable<ResponsePayload> {
    let params = new HttpParams();
    const shopId = this.getShopId();
    
    if (shopId) {
      params = params.append('shop', shopId);
    }
    
    return this.httpClient.get<ResponsePayload>(API_REPORTS + 'activity-log-users', { params });
  }
}


