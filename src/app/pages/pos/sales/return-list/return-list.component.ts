import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { UiService } from "../../../../services/core/ui.service";
import { Router } from "@angular/router";
import { ReloadService } from "../../../../services/core/reload.service";
import { EMPTY, Subscription } from "rxjs";
import { FilterData } from "../../../../interfaces/gallery/filter-data";
import { SaleService } from "../../../../services/common/sale.service";
import { MatCheckbox } from "@angular/material/checkbox";
import { FormControl, FormGroup, NgForm } from "@angular/forms";
import { UtilsService } from "../../../../services/core/utils.service";
import { debounceTime, distinctUntilChanged, pluck, switchMap } from "rxjs/operators";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import * as XLSX from 'xlsx';
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../../shared/components/ui/confirm-dialog/confirm-dialog.component";
import { Select } from '../../../../interfaces/core/select';
import { MONTHS, YEARS } from '../../../../core/utils/app-data';
import { Sale, SaleCalculation } from '../../../../interfaces/common/sale.interface';
import { VendorService } from '../../../../services/vendor/vendor.service';
import { ShopInformation } from '../../../../interfaces/common/shop-information.interface';
import { ShopInformationService } from '../../../../services/common/shop-information.service';

@Component({
  selector: 'app-return-list',
  templateUrl: './return-list.component.html',
  styleUrls: ['./return-list.component.scss'],
})
export class ReturnListComponent implements OnInit, OnDestroy {
  // Vendor Base Data
  vendorId: string;
  role: string;

  // Static Data
  months: Select[] = MONTHS;
  years: Select[] = YEARS;

  // Store Data
  isLoading: boolean = true;
  private allReturns: Sale[] = [];
  private holdAllReturns: Sale[] = [];
  returns: { _id: string, data: Sale[], total: number, subTotal: number, discount: number, vat: number }[] = [];
  holdPrevData: any[] = [];
  calculation: SaleCalculation = null;
  holdCalculation: SaleCalculation = null;
  returnData: Sale = null;

  // Shop data
  shopInformation: ShopInformation;

  // FilterData
  isDefaultFilter: boolean = false;
  filter: any = null;
  sortQuery: any = null;
  activeFilterMonth: number = null;
  activeFilterYear: number = null;
  activeSort: number;

  // Selected Data
  selectedIds: string[] = [];
  @ViewChild('matCheckbox') matCheckbox: MatCheckbox;

  // Date
  today = new Date();
  dataFormDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  // Search Area
  @ViewChild('searchForm') searchForm: NgForm;
  searchQuery = null;
  searchReturn: Sale[] = [];

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subForm: Subscription;
  private subReload: Subscription;
  private subShopInfo: Subscription;

  constructor(
    private saleService: SaleService,
    private uiService: UiService,
    private utilsService: UtilsService,
    private router: Router,
    private dialog: MatDialog,
    private reloadService: ReloadService,
    private vendorService: VendorService,
    private shopInformationService: ShopInformationService,
  ) {
  }

  ngOnInit(): void {
    // Base Vendor Data
    this.getVendorBaseData();

    // Reload Data
    this.subReload = this.reloadService.refreshData$.subscribe(() => {
      this.getAllReturns();
    });

    // Set Default Filter
    this.setDefaultFilter();
    // Base Data
    this.getAllReturns();
    this.getShopInformation();
  }

  ngAfterViewInit(): void {
    if (!this.searchForm) {
      console.warn('Search form not found');
      return;
    }

    const formValue = this.searchForm.valueChanges;

    this.subForm = formValue
      .pipe(
        pluck('searchTerm'),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((data) => {
          this.searchQuery = data;
          if (this.searchQuery === '' || this.searchQuery === null) {
            this.searchReturn = [];
            this.returns = this.holdPrevData;
            this.allReturns = this.holdAllReturns;
            this.calculation = this.holdCalculation;
            this.searchQuery = null;
            return EMPTY;
          }

          const mSelect = {
            returnInvoiceNo: 1,
            originalInvoiceNo: 1,
            invoiceNo: 1,
            customer: 1,
            products: 1,
            salesman: 1,
            returnType: 1,
            returnDate: 1,
            returnDateString: 1,
            grandTotal: 1,
            subTotal: 1,
          };

          const filter: FilterData = {
            filter: {
              $or: [
                { returnInvoiceNo: { $regex: this.searchQuery, $options: 'i' } },
                { originalInvoiceNo: { $regex: this.searchQuery, $options: 'i' } },
                { invoiceNo: { $regex: this.searchQuery, $options: 'i' } },
                { 'customer.phone': { $regex: this.searchQuery, $options: 'i' } },
              ]
            },
            pagination: null,
            select: mSelect,
            sort: { createdAt: -1 },
          };

          return this.saleService.getAllReturnSales(filter, this.searchQuery);
        })
      )
      .subscribe((res) => {
        if (res.success) {
          // Map return-sales data to match expected format
          const mappedData = res.data.map((r: any) => ({
            ...r,
            invoiceNo: r.returnInvoiceNo || r.invoiceNo,
            soldDate: r.returnDate,
            soldDateString: r.returnDateString,
            total: r.grandTotal,
            status: 'Return'
          }));
          this.searchReturn = mappedData;
          this.allReturns = mappedData;
          this.returns = this.utilsService.arrayGroupByFieldComplexCalc(this.allReturns, 'soldDateString', 'sale');
          this.calculation = res.reports || null;
        }
      });
  }

  private getVendorBaseData() {
    this.vendorId = this.vendorService.getUserId();
    this.role = this.vendorService.getUserRole() || 'admin';
  }

  setDefaultFilter() {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    this.filter = {
      month: month,
      year: year,
    };

    this.activeFilterMonth = this.months.findIndex(f => f.value === month);
    this.activeFilterYear = this.years.findIndex(f => f.value === year);
  }

  filterData(query: any, index: number, type: string) {
    if (type === 'month') {
      this.activeFilterMonth = index;
      this.filter = { ...this.filter, ...{ month: query.value } };
    } else if (type === 'year') {
      this.activeFilterYear = index;
      this.filter = { ...this.filter, ...{ year: query.value } };
    }
    this.isDefaultFilter = false;
    this.getAllReturns();
  }

  endChangeRegDateRange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      const startDate = this.dataFormDateRange.value.start;
      const endDate = event.value;

      if (startDate && endDate) {
        const startDateString = this.utilsService.getDateString(startDate);
        const endDateString = this.utilsService.getDateString(endDate);

        const qData = { soldDateString: { $gte: startDateString, $lte: endDateString } };
        this.isDefaultFilter = false;
        this.filter = { ...this.filter, ...qData };

        // Re fetch Data
        this.getAllReturns();
      }
    }
  }

  sortData(query: any, type: number) {
    this.sortQuery = query;
    this.activeSort = type;
    this.getAllReturns();
  }

  onRemoveAllQuery() {
    this.activeSort = null;
    this.activeFilterMonth = null;
    this.activeFilterYear = null;
    this.sortQuery = { createdAt: -1 };
    this.filter = null;
    this.dataFormDateRange.reset();
    this.setDefaultFilter();
    this.getAllReturns();
  }

  /**
   * ON Select Check
   */
  onCheckChange(event: boolean, index: number, id: string) {
    if (event) {
      this.selectedIds.push(id);
    } else {
      const i = this.selectedIds.findIndex(f => f === id);
      this.selectedIds.splice(i, 1);
    }
  }

  onAllSelectChange(event: MatCheckbox, data: Sale[], groupIndex: number) {
    if (event.checked) {
      data.forEach(m => {
        m.select = true;
        const index = this.selectedIds.findIndex(f => f === m._id);
        if (index === -1) {
          this.selectedIds.push(m._id);
        }
      });
    } else {
      data.forEach(m => {
        m.select = false;
        const i = this.selectedIds.findIndex(f => f === m._id);
        this.selectedIds.splice(i, 1);
      });
    }
  }

  get checkDeletePermission(): boolean {
    return true;
  }

  private getShopInformation() {
    this.subShopInfo = this.shopInformationService.getShopInformation()
      .subscribe({
        next: res => {
          this.shopInformation = res.data;
        },
        error: err => {
          console.log(err);
        }
      });
  }

  /**
   * HTTP REQ HANDLE
   */
  private getAllReturns() {
    this.isLoading = true;
    const mSelect = {
      returnInvoiceNo: 1,
      originalInvoiceNo: 1,
      invoiceNo: 1,
      customer: 1,
      products: 1,
      salesman: 1,
      returnType: 1,
      reason: 1,
      month: 1,
      returnDate: 1,
      returnDateString: 1,
      grandTotal: 1,
      subTotal: 1,
      totalPurchasePrice: 1,
    };

    // Remove status filter - return-sales doesn't have status field
    const filterWithoutStatus = { ...this.filter };
    delete filterWithoutStatus.status;

    const filter: FilterData = {
      filter: filterWithoutStatus,
      pagination: null,
      select: mSelect,
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.saleService
      .getAllReturnSales(filter, null)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            // Map return-sales data to match expected format
            this.allReturns = res.data.map((r: any) => ({
              ...r,
              invoiceNo: r.returnInvoiceNo || r.invoiceNo,
              soldDate: r.returnDate,
              soldDateString: r.returnDateString,
              total: r.grandTotal,
              status: 'Return'
            }));
            this.holdAllReturns = this.allReturns;
            this.returns = this.utilsService.arrayGroupByFieldComplexCalc(this.allReturns, 'soldDateString', 'sale');
            this.holdPrevData = this.returns;
            this.calculation = res.reports || null;
            this.holdCalculation = this.calculation;
          } else {
            this.uiService.message('Failed to load returns', 'warn');
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading returns:', err);
          this.uiService.message('Failed to load returns. Please try again.', 'warn');
        },
      });
  }

  deleteMultipleReturnById() {
    if (this.selectedIds.length < 1) {
      this.uiService.message('Please select at least one item', 'warn');
      return;
    }
    this.subDataTwo = this.saleService.deleteMultipleSaleById(this.selectedIds)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.selectedIds = [];
            this.uiService.message(res.message, 'success');
            this.getAllReturns();
          } else {
            this.uiService.message(res.message, 'warn');
          }
        },
        error: (err) => {
          console.error('Error deleting returns:', err);
          this.uiService.message('Failed to delete returns', 'warn');
        }
      });
  }

  exportToAllExcel() {
    if (!this.allReturns.length) {
      this.uiService.message('No data to export', 'warn');
      return;
    }

    const date = new Date().toISOString().split('T')[0];
    const data = this.allReturns.map((m, index) => {
      return {
        'SL': index + 1,
        'Invoice No': m.invoiceNo || '',
        'Customer Phone': m.customer?.phone || '',
        'Salesman': m.salesman?.name || '',
        'Date': m.soldDateString || '',
        'Sub Total': m.subTotal || 0,
        'Discount': m.discount || 0,
        'GST': m.vatAmount || 0,
        'Total': m.total || 0,
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Returns');
    XLSX.writeFile(wb, `Returns_${date}.xlsx`);
  }

  /**
   * COMPONENT DIALOG VIEW
   */
  public openConfirmDialog(type: string, data?: any) {
    switch (type) {
      case 'delete': {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          maxWidth: '400px',
          data: {
            title: 'Confirm Delete',
            message: 'Are you sure you want delete this data?',
          },
        });
        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            this.deleteMultipleReturnById();
          }
        });
        break;
      }
      case 'print': {
        this.returnData = data;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          maxWidth: '400px',
          data: {
            title: 'Confirm Print',
            message: 'Do you want to print this return invoice?',
          },
        });
        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            this.printReturnInvoice(data);
          }
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * Print Return Invoice
   */
  private printReturnInvoice(returnSale: Sale) {
    try {
      if (!returnSale || !returnSale.invoiceNo) {
        this.uiService.message('Return data not available for printing', 'warn');
        return;
      }

      const printContent = this.generatePrintContent(returnSale);

      if (!printContent || printContent.includes('Error:')) {
        this.uiService.message('Failed to generate return invoice content', 'warn');
        return;
      }

      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');

      if (printWindow && !printWindow.closed) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        setTimeout(() => {
          try {
            if (printWindow && !printWindow.closed) {
              printWindow.focus();
              printWindow.print();
            }
          } catch (printError) {
            console.error('Print trigger error:', printError);
            printWindow.focus();
          }
        }, 1000);
      } else {
        this.uiService.message('Please allow popups to print return invoice', 'warn');
        const blob = new Blob([printContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const altWindow = window.open(url, '_blank');
        if (altWindow) {
          setTimeout(() => {
            altWindow.print();
            URL.revokeObjectURL(url);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Print error:', error);
      this.uiService.message('Failed to open return invoice for printing', 'warn');
    }
  }

  /**
   * Generate Print Content for Return
   */
  private generatePrintContent(returnSale: Sale): string {
    const shopInfo = this.shopInformation;
    const date = new Date();

    let currencySymbol = '৳';
    if (shopInfo?.currency) {
      switch (shopInfo.currency) {
        case 'BDT':
          currencySymbol = '৳';
          break;
        case 'SGD':
          currencySymbol = 'S$';
          break;
        case 'Dollar':
          currencySymbol = '$';
          break;
        default:
          currencySymbol = '৳';
      }
    }

    const shopName = shopInfo?.siteName || shopInfo?.websiteName || 'Shop Name';
    const shopAddress = shopInfo?.addresses?.[0]?.value || '';
    const shopPhone = shopInfo?.phones?.[0]?.value || '';
    const invoiceNo = returnSale?.invoiceNo || 'N/A';
    const saleDate = this.utilsService.getDateString(returnSale?.soldDate || new Date());
    const saleTime = returnSale?.soldTime || '';
    const customerName = returnSale?.customer?.name || '';
    const customerPhone = returnSale?.customer?.phone || '';
    const salesmanName = returnSale?.salesman?.name || 'N/A';

    let productsRows = '';
    if (returnSale?.products && returnSale.products.length > 0) {
      productsRows = returnSale.products.map(p => {
        const productName = this.utilsService.getProductName(p);
        const qty = p.soldQuantity || 0;
        const price = (p.salePrice || 0).toFixed(2);
        const total = ((p.salePrice || 0) * qty).toFixed(2);
        return `
        <tr>
          <td>${productName}</td>
          <td>${qty}</td>
          <td>${currencySymbol}${price}</td>
          <td>${currencySymbol}${total}</td>
        </tr>`;
      }).join('');
    }

    const returnTotal = (returnSale?.total || 0).toFixed(2);

    return `<!DOCTYPE html>
<html>
<head>
  <title>Return Invoice - ${invoiceNo}</title>
  <style>
    @media print {
      @page { margin: 10mm; }
      body { margin: 0; }
    }
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #f44336;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .shop-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .invoice-details {
      flex: 1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #ffebee;
      font-weight: bold;
    }
    .total-section {
      margin-top: 20px;
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin: 5px 0;
    }
    .total-label {
      width: 150px;
      font-weight: bold;
    }
    .total-value {
      width: 120px;
      text-align: right;
      color: #f44336;
    }
    .grand-total {
      font-size: 18px;
      font-weight: bold;
      border-top: 2px solid #f44336;
      padding-top: 10px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="shop-name">${shopName}</div>
    <div>${shopAddress}</div>
    <div>Phone: ${shopPhone}</div>
  </div>
  
  <div class="invoice-info">
    <div class="invoice-details">
      <div><strong>Return Invoice No:</strong> ${invoiceNo}</div>
      <div><strong>Date:</strong> ${saleDate}</div>
      <div><strong>Time:</strong> ${saleTime}</div>
      ${customerName ? `<div><strong>Customer:</strong> ${customerName}</div>` : ''}
      ${customerPhone ? `<div><strong>Phone:</strong> ${customerPhone}</div>` : ''}
      <div><strong>Salesman:</strong> ${salesmanName}</div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${productsRows}
    </tbody>
  </table>
  
  <div class="total-section">
    <div class="total-row grand-total">
      <div class="total-label">Return Total:</div>
      <div class="total-value">${currencySymbol}${returnTotal}</div>
    </div>
  </div>
  
  <div class="footer">
    <div>Thank you for your business!</div>
    <div>Generated on: ${date.toLocaleString()}</div>
  </div>
</body>
</html>`;
  }

  /**
   * ON DESTROY
   */
  ngOnDestroy() {
    if (this.subDataOne) {
      this.subDataOne.unsubscribe();
    }
    if (this.subDataTwo) {
      this.subDataTwo.unsubscribe();
    }
    if (this.subDataThree) {
      this.subDataThree.unsubscribe();
    }
    if (this.subForm) {
      this.subForm.unsubscribe();
    }
    if (this.subReload) {
      this.subReload.unsubscribe();
    }
    if (this.subShopInfo) {
      this.subShopInfo.unsubscribe();
    }
  }
}

