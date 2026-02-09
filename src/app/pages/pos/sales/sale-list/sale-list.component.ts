import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { UiService } from "../../../../services/core/ui.service";
import { Router } from "@angular/router";
import { ReloadService } from "../../../../services/core/reload.service";
import { EMPTY, Subscription } from "rxjs";
import { FilterData } from "../../../../interfaces/gallery/filter-data";
import { SaleService } from "../../../../services/common/sale.service";
import { VendorPermissions } from '../../../../enum/vendor-permission.enum';
import { MatCheckbox, MatCheckboxChange } from "@angular/material/checkbox";
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
import { PrinterSettingsService } from '../../../../services/common/printer-settings.service';
import { ThermalPrinterService } from '../../../../services/common/thermal-printer.service';
import { ReprintBillComponent } from '../reprint-bill/reprint-bill.component';

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.scss'],
})
export class SaleListComponent implements OnInit, OnDestroy {
  // Vendor Base Data
  vendorId: string;
  role: string;
  permissions: VendorPermissions[] = [];

  // Static Data
  months: Select[] = MONTHS;
  years: Select[] = YEARS;

  // Store Data
  isLoading: boolean = true;
  private allSales: Sale[] = [];
  private holdAllSales: Sale[] = [];
  sales: { _id: string, data: Sale[], total: number, subTotal: number, discount: number, vat: number }[] = [];
  holdPrevData: any[] = [];
  id?: string;
  calculation: SaleCalculation = null;
  holdCalculation: SaleCalculation = null;
  saleData: Sale = null;

  // Shop data
  shopInformation: ShopInformation;
  printerSettings: any = null;

  // FilterData
  isDefaultFilter: boolean = false;
  filter: any = null;
  sortQuery: any = null;
  activeFilter1: number = null;
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
  searchSale: Sale[] = [];

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subForm: Subscription;
  private subReload: Subscription;
  private subShopInfo: Subscription;
  private subPrinterSettings: Subscription;

  constructor(
    private saleService: SaleService,
    private uiService: UiService,
    private utilsService: UtilsService,
    private router: Router,
    private dialog: MatDialog,
    private reloadService: ReloadService,
    private vendorService: VendorService,
    private shopInformationService: ShopInformationService,
    private printerSettingsService: PrinterSettingsService,
    private thermalPrinterService: ThermalPrinterService,
  ) {
  }

  ngOnInit(): void {
    // Base Vendor Data
    this.getVendorBaseData();

    // Reload Data
    this.subReload = this.reloadService.refreshData$.subscribe(() => {
      this.getAllSale();
    });

    // Set Default Filter
    this.setDefaultFilter();
    // Base Data
    this.getAllSale();
    this.getShopInformation();
    this.loadPrinterSettings();
  }

  ngAfterViewInit(): void {
    if (!this.searchForm) {
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
            this.searchSale = [];
            this.sales = this.holdPrevData;
            this.allSales = this.holdAllSales;
            this.calculation = this.holdCalculation;
            this.searchQuery = null;
            return EMPTY;
          }

          // Select
          const mSelect = {
            invoiceNo: 1,
            date: 1,
            customer: 1,
            products: 1,
            salesman: 1,
            status: 1,
            month: 1,
            soldDate: 1,
            total: 1,
            soldDateString: 1,
            soldTime: 1,
            subTotal: 1,
            discount: 1,
            vatAmount: 1,
            paidAmount: 1,
            totalPurchasePrice: 1,
            receivedFromCustomer: 1,
            paymentType: 1,
          };

          const filterData: FilterData = {
            pagination: null,
            filter: { ...this.filter, ...{ status: 'Sale' } },
            select: mSelect,
            sort: { invoiceNo: -1 },
          };

          return this.saleService.getAllSale(
            filterData,
            this.searchQuery
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.allSales = res.data;
          this.searchSale = res.data;
          this.sales = this.utilsService.arrayGroupByFieldComplexCalc(this.searchSale, 'soldDateString', 'sale');
          // Handle both calculation and reports
          this.calculation = res.calculation || res.reports || null;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.uiService.message('Search failed. Please try again.', 'warn');
        },
      });
  }

  /**
   * CHECK VENDOR PERMISSION
   */
  get checkAddPermission(): boolean {
    return true; // Admin has full access
  }

  get checkDeletePermission(): boolean {
    return true; // Admin has full access
  }

  get checkEditPermission(): boolean {
    return true; // Admin has full access
  }

  private getVendorBaseData() {
    this.vendorId = this.vendorService.getUserId();
    this.role = this.vendorService.getUserRole() || 'admin';
    // Permissions can be added later if needed
  }

  /**
   * HTTP REQ HANDLE
   * getAllSale()
   * deleteSaleById()
   */

  private getAllSale() {
    // Select
    const mSelect = {
      invoiceNo: 1,
      date: 1,
      customer: 1,
      products: 1,
      salesman: 1,
      status: 1,
      month: 1,
      soldDate: 1,
      total: 1,
      soldDateString: 1,
      soldTime: 1,
      subTotal: 1,
      discount: 1,
      vatAmount: 1,
      paidAmount: 1,
      totalPurchasePrice: 1,
      receivedFromCustomer: 1,
      paymentType: 1,
      hasPartialReturn: 1,
      hasReturn: 1,
      totalReturnedAmount: 1,
      returnTotal: 1,
    };

    // Include Sale, Hold, Draft, and Exchange statuses
    let mFilter = { ...this.filter, ...{ status: { $in: ['Sale', 'Hold', 'Draft', 'Exchange'] } } };

    const filter: FilterData = {
      filter: mFilter,
      pagination: null,
      select: mSelect,
      sort: { invoiceNo: -1 },
    };

    this.subDataOne = this.saleService
      .getAllSale(filter, null)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.allSales = res.data;
            this.holdAllSales = this.allSales;
            this.sales = this.utilsService.arrayGroupByFieldComplexCalc(this.allSales, 'soldDateString', 'sale');
            this.holdPrevData = this.sales;
            // Handle both calculation and reports for compatibility
            this.calculation = res.calculation || res.reports || null;
            this.holdCalculation = this.calculation;
          } else {
            this.uiService.message('Failed to load sales data', 'warn');
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading sales:', err);
          this.uiService.message('Failed to load sales data. Please try again.', 'warn');
        },
      });
  }

  private deleteMultipleSaleById() {
    this.subDataThree = this.saleService
      .deleteMultipleSaleById(this.selectedIds)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.selectedIds = [];
            this.uiService.message(res.message || 'Sales deleted successfully', 'success');
            this.reloadService.needRefreshData$();
          } else {
            this.uiService.message(res.message || 'Failed to delete sales', 'warn');
          }
        },
        error: (error) => {
          console.log(error);
        }
      })
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
      })
  }

  /**
   * Load Printer Settings
   */
  private loadPrinterSettings() {
    this.subPrinterSettings = this.printerSettingsService.getPrinterSettings().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.printerSettings = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading printer settings:', err);
      }
    });
  }

  /**
   * FILTER DATA & Sorting
   */
  private setDefaultFilter() {
    this.isDefaultFilter = true;
    const month = this.utilsService.getDateMonth(false, new Date());
    const year = new Date().getFullYear();

    this.filter = {
      ...this.filter, ...{
        month: month,
        year: year,
      }
    }
    this.activeFilterMonth = this.months.findIndex(f => f.value === month);
    this.activeFilterYear = this.years.findIndex(f => f.value === year);
  }

  filterData(value: any, index: number, type: string) {
    switch (type) {
      case 'month': {
        this.isDefaultFilter = false;
        this.filter = { 'month': value };
        this.activeFilterMonth = index;
        break;
      }
      default: {
        break;
      }
    }
    // Re fetch Data
    this.getAllSale();
  }

  endChangeRegDateRange(event: MatDatepickerInputEvent<any>) {
    if (event.value) {
      const startDate = this.utilsService.getDateString(
        this.dataFormDateRange.value.start
      );
      const endDate = this.utilsService.getDateString(
        this.dataFormDateRange.value.end
      );

      const qData = { soldDateString: { $gte: startDate, $lte: endDate } };
      this.isDefaultFilter = false;
      this.filter = { ...this.filter, ...qData };

      // Re fetch Data
      this.getAllSale();
    }
  }

  sortData(query: any, type: number) {
    this.sortQuery = query;
    this.activeSort = type;
    this.getAllSale();
  }

  onRemoveAllQuery() {
    this.activeSort = null;
    this.activeFilter1 = null;
    this.activeFilterMonth = null;
    this.sortQuery = { createdAt: -1 };
    this.filter = null;
    this.dataFormDateRange.reset();
    this.setDefaultFilter();
    // Re fetch Data
    this.getAllSale();
  }

  /**
   * ON Select Check
   */
  onCheckChange(event: any, index: number, id: string) {
    if (event) {
      this.selectedIds.push(id);
    } else {
      const i = this.selectedIds.findIndex((f) => f === id);
      this.selectedIds.splice(i, 1);
    }
  }

  onAllSelectChange(event: MatCheckboxChange, data: Sale[], index: number) {
    const currentPageIds = data.map((m) => m._id);
    if (event.checked) {
      this.selectedIds = this.utilsService.mergeArrayString(
        this.selectedIds,
        currentPageIds
      );
      this.sales[index].data.forEach((m) => {
        m.select = true;
      });
    } else {
      currentPageIds.forEach((m) => {
        this.sales[index].data.find((f) => f._id === m).select = false;
        const i = this.selectedIds.findIndex((f) => f === m);
        this.selectedIds.splice(i, 1);
      });
    }
  }

  /**
   * EXPORTS TO EXCEL
   */
  exportToAllExcel() {
    const date = this.utilsService.getDateString(new Date());

    if (this.selectedIds.length) {
      const selectedSales = [];
      this.selectedIds.forEach(id => {
        const data = this.allSales.find(f => f._id === id);
        selectedSales.push(data);
      })

      const mSale = selectedSales.map(m => {
        return {
          ...m,
          ...{
            salesman: m.salesman ? m.salesman.name : '',
            customer: m.customer ? m.customer.phone : '',
            products: m.products ? m.products.map(p => p.name || p).join(', ') : '',
          }
        }
      })

      mSale.push({
        '_id': 'TOTAL=',
        'invoiceNo': '',
        'salesman': '',
        'products': '',
        'soldDate': null,
        'soldDateString': '',
        discount: mSale.map(t => t.discount ?? 0).reduce((acc, value) => acc + value, 0),
        vatAmount: mSale.map(t => t.vatAmount ?? 0).reduce((acc, value) => acc + value, 0),
        status: '',
        'totalPurchasePrice': mSale.map(t => t.totalPurchasePrice ?? 0).reduce((acc, value) => acc + value, 0),
        total: mSale.map(t => t.total ?? 0).reduce((acc, value) => acc + value, 0),
        paidAmount: mSale.map(t => t.paidAmount ?? 0).reduce((acc, value) => acc + value, 0),
        subTotal: mSale.map(t => t.subTotal ?? 0).reduce((acc, value) => acc + value, 0),
        month: null,
        soldTime: '',
        receivedFromCustomer: null,
        paymentType: '',
        customer: ''
      })

      // EXPORT XLSX
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mSale);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, `Sale_Reports_${date}.xlsx`);
    } else {
      const mSale = this.allSales.map(m => {
        return {
          ...m,
          ...{
            salesman: m.salesman ? m.salesman.name : '',
            customer: m.customer ? m.customer.phone : '',
            products: m.products ? m.products.map(p => p.name || p).join(', ') : '',
          }
        }
      })

      mSale.push({
        '_id': 'TOTAL=',
        'invoiceNo': '',
        'salesman': '',
        'products': '',
        'soldDate': null,
        'soldDateString': '',
        discount: mSale.map(t => t.discount ?? 0).reduce((acc, value) => acc + value, 0),
        vatAmount: mSale.map(t => t.vatAmount ?? 0).reduce((acc, value) => acc + value, 0),
        status: '',
        'totalPurchasePrice': mSale.map(t => t.totalPurchasePrice ?? 0).reduce((acc, value) => acc + value, 0),
        total: mSale.map(t => t.total ?? 0).reduce((acc, value) => acc + value, 0),
        paidAmount: mSale.map(t => t.paidAmount ?? 0).reduce((acc, value) => acc + value, 0),
        subTotal: mSale.map(t => t.subTotal ?? 0).reduce((acc, value) => acc + value, 0),
        month: null,
        soldTime: '',
        receivedFromCustomer: null,
        paymentType: '',
        customer: ''
      })
      // EXPORT XLSX
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mSale);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, `Sale_Reports_${date}.xlsx`);
    }
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
            this.deleteMultipleSaleById();
          }
        });
        break;
      }
      case 'print': {
        this.saleData = data;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          maxWidth: '400px',
          data: {
            title: 'Confirm Print',
            message: 'Do you want to print this invoice?',
          },
        });
        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            this.printInvoice(data);
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
   * Print Invoice
   */
  private printInvoice(sale: Sale) {
    try {
      if (!sale || !sale.invoiceNo) {
        this.uiService.message('Invoice data not available for printing', 'warn');
        return;
      }

      // Check printer settings
      const settings = this.printerSettings || {};
      const printType = settings.printType || 'pos'; // Default to POS if not set

      // If A4 print is selected, use HTML print (A4 format)
      if (printType === 'a4') {
        this.printInvoiceHTML(sale);
        return;
      }

      // For POS print, check if thermal printing is enabled
      if (printType === 'pos' && settings.printWithoutPreview) {
        // Prepare sale data for thermal printer
        const saleDataForPrint = {
          ...sale,
          invoiceNo: sale.invoiceNo,
          soldDate: sale.soldDate,
          soldTime: sale.soldTime,
          customer: sale.customer,
          products: sale.products,
          salesman: sale.salesman,
          subTotal: sale.subTotal,
          discount: sale.discount || 0,
          vatAmount: sale.vatAmount || 0,
          total: sale.total,
          paymentType: sale.paymentType,
          receivedFromCustomer: sale.receivedFromCustomer || sale.total,
        };

        this.thermalPrinterService.printDirect(saleDataForPrint, this.shopInformation).subscribe({
          next: (success) => {
            if (success) {
              this.uiService.message('Receipt printed successfully', 'success');
            } else {
              // Fallback to HTML print (POS format)
              this.printInvoiceHTML(sale);
            }
          },
          error: (err) => {
            console.error('Thermal print error:', err);
            // Fallback to HTML print (POS format)
            this.printInvoiceHTML(sale);
          }
        });
      } else {
        // Use HTML print with preview (POS format)
        this.printInvoiceHTML(sale);
      }
    } catch (error) {
      console.error('Print error:', error);
      this.uiService.message('Failed to open invoice for printing', 'warn');
    }
  }

  /**
   * Print invoice using HTML (with preview)
   */
  private printInvoiceHTML(sale: Sale) {
    try {
      // Generate print content
      const printContent = this.generatePrintContent(sale);

      if (!printContent || printContent.includes('Error:')) {
        console.error('Failed to generate print content');
        this.uiService.message('Failed to generate invoice content', 'warn');
        return;
      }

      // Create a new window/tab for invoice
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');

      if (printWindow && !printWindow.closed) {
        // Write content to new window
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load, then focus and print
        setTimeout(() => {
          try {
            if (printWindow && !printWindow.closed) {
              printWindow.focus();
              // Trigger print dialog
              printWindow.print();
            }
          } catch (printError) {
            console.error('Print trigger error:', printError);
            // If print fails, at least the invoice is visible in the new tab
            printWindow.focus();
          }
        }, 1000);
      } else {
        // If popup blocked, show error message
        console.error('Print window blocked by browser');
        this.uiService.message('Please allow popups to print invoice. Invoice will open in new tab.', 'warn');

        // Try alternative: create a blob URL and open it
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
      console.error('HTML print error:', error);
      this.uiService.message('Failed to open invoice for printing', 'warn');
    }
  }

  /**
   * Generate Print Content
   */
  private generatePrintContent(sale: Sale): string {
    const shopInfo = this.shopInformation;
    const settings = this.printerSettings || {};
    const date = new Date();
    const printType = settings.printType || 'pos'; // Default to POS if not set

    // Get currency symbol
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

    // Format values - Shop Information
    const shopName = shopInfo?.siteName || shopInfo?.websiteName || 'Shop Name';
    const shopAddress = shopInfo?.addresses?.[0]?.value || '';
    const shopPhone = shopInfo?.phones?.[0]?.value || '';
    const shopEmail = shopInfo?.emails?.[0]?.value || '';
    const shopWebsite = (shopInfo as any)?.website || '';

    // Invoice Information
    const invoiceNo = sale?.invoiceNo || 'N/A';
    const saleDate = this.utilsService.getDateString(sale?.soldDate || new Date());
    const saleTime = sale?.soldTime || '';

    // Customer Information
    const customerName = sale?.customer?.name || '';
    const customerPhone = sale?.customer?.phone || '';
    const customerEmail = sale?.customer?.email || '';
    const customerAddress = sale?.customer?.address || '';
    const customerCity = sale?.customer?.city || '';
    const customerPostCode = sale?.customer?.postCode || '';

    // Salesman Information
    const salesmanName = sale?.salesman?.name || 'N/A';
    const salesmanPhone = sale?.salesman?.phone || '';

    // Paper size - A4 or POS or Label
    const isA4Print = printType === 'a4';
    const isLabelPrint = printType === 'label';
    const paperSize = isA4Print ? 'A4' : (isLabelPrint ? (settings.labelSize || '3in 10in') : (settings.paperSize || '58mm'));
    const orientation = settings.orientation || 'portrait'; // portrait, landscape, portrait-180, landscape-180

    // Calculate paper width for POS thermal printers
    let calculatedPaperWidth = '58mm';
    if (!isA4Print && !isLabelPrint) {
      calculatedPaperWidth = paperSize === '80mm' ? '80mm' : '58mm';
    } else if (isLabelPrint) {
      // For label printers, use the custom size
      calculatedPaperWidth = paperSize;
    }
    const paperWidth = isA4Print ? '210mm' : calculatedPaperWidth;
    const customCss = settings.customCss || '';

    // Generate products table rows
    let productsRows = '';
    if (sale?.products && sale.products.length > 0) {
      productsRows = sale.products.map(p => {
        const productName = this.utilsService?.getProductName?.(p) || p?.name || 'Unknown Product';
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

    // Format totals
    const subTotal = (sale?.subTotal || 0);
    const discountAmount = sale?.discountAmount || sale?.discount || 0;
    const discount = discountAmount > 0 ? discountAmount : '0';
    const vatAmount = (sale?.vatAmount || 0);
    const grandTotal = (sale?.total || 0);
    const totalAmount = sale?.total || 0;
    // Paid amount should be receivedFromCustomer if available, otherwise paidAmount, otherwise total (for full payment)
    const paidAmount = sale?.receivedFromCustomer || sale?.paidAmount || (sale?.paymentType === 'cash' && !sale?.receivedFromCustomer ? sale?.total : 0);
    const dueAmount = totalAmount - paidAmount;
    const received = paidAmount > 0 ? paidAmount : (sale?.total || 0);
    const due = dueAmount > 0 ? dueAmount : '0';
    const change = sale?.receivedFromCustomer && sale?.receivedFromCustomer > sale?.total
      ? (sale.receivedFromCustomer - sale.total).toFixed(2)
      : '0.00';

    // A4 Invoice Template (Compact One-Page Design)
    if (isA4Print) {
      return `<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${invoiceNo}</title>
  <meta charset="utf-8">
  <style>
    @media print {
      @page { 
        margin: 8mm !important; 
        size: A4 !important;
        page-break-inside: avoid !important;
        orphans: 0 !important;
        widows: 0 !important;
      }
      /* Universal page break prevention for all elements */
      * {
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
        break-inside: avoid !important;
        break-after: avoid !important;
        break-before: avoid !important;
      }
      html, body {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-before: avoid !important;
        break-before: avoid !important;
      }
      body { 
        margin: 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      /* Prevent page breaks for all invoice sections */
      .invoice-container, .invoice-header, .shop-info, .invoice-details, .invoice-body, .invoice-summary, .invoice-footer, .footer-section, table, thead, tbody, tr, td, th {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-before: avoid !important;
        break-before: avoid !important;
      }
      table {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      thead {
        display: table-header-group;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      tbody {
        display: table-row-group;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      td, th {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 10px;
      max-width: 210mm;
      margin: 0 auto;
      background: #fff;
      color: #000 !important; /* Force black text for printing */
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      line-height: 1.4;
      font-size: 11px;
    }
    .invoice-container {
      background: #fff;
      padding: 15px;
    }
    .invoice-header {
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 2px solid #4CAF50;
    }
    .shop-info {
      margin: 0 auto;
      display: inline-block;
      text-align: center;
    }
    .shop-logo-container {
      margin: 0 auto 5px auto;
      display: flex;
      justify-content: center;
    }
    .shop-logo {
      max-width: 100px;
      max-height: 60px;
      display: ${settings.showShopLogo && (shopInfo as any)?.logoPrimary ? 'block' : 'none'};
      margin: 0 auto;
    }
    .shop-name {
      font-size: 18px;
      font-weight: bold;
      color: #000 !important;
      margin-bottom: 4px;
      display: ${(settings.showShopLogo && (shopInfo as any)?.logoPrimary) ? 'none' : (settings.showShopName !== false ? 'block' : 'none')};
    }
    .shop-details {
      color: #000 !important;
      font-size: 12px;
      line-height: 1.4;
      text-align: center;
      margin-top: 8px;
      font-weight: 500;
    }
    .shop-address {
      display: ${settings.showShopAddress !== false ? 'block' : 'none'};
      margin-bottom: 2px;
    }
    .shop-phone {
      display: ${settings.showShopPhone !== false ? 'block' : 'none'};
      margin-bottom: 2px;
    }
    .shop-email {
      display: ${shopEmail ? 'block' : 'none'};
      margin-bottom: 2px;
    }
    .shop-website {
      display: ${shopWebsite ? 'block' : 'none'};
      margin-bottom: 2px;
    }
    .invoice-title {
      text-align: center;
      margin-top: 5px;
    }
    .invoice-title h1 {
      font-size: 24px;
      color: #000 !important;
      margin-bottom: 5px;
      font-weight: 900;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .invoice-title .invoice-number {
      font-size: 12px;
      color: #000 !important;
      font-weight: 500;
      display: ${settings.showInvoiceNumber !== false ? 'block' : 'none'};
    }
    .invoice-meta {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
      padding: 10px;
      background: #f8f9fa !important;
      border: 1px solid #ddd !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border-radius: 4px;
      font-size: 12px;
    }
    .invoice-meta-section {
      flex: 1;
    }
    .invoice-meta-section h3 {
      font-size: 14px;
      color: #000 !important;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border-bottom: 1px solid #eee;
      padding-bottom: 4px;
    }
    .invoice-meta-section p {
      margin: 4px 0;
    }
    .invoice-meta-section strong {
      color: #2c3e50;
      display: inline-block;
      min-width: 70px;
    }
    .products-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      background: #fff;
      display: ${settings.showProductTable !== false ? 'table' : 'none'};
      font-size: 12px;
      border: 1px solid #ddd;
    }
    .products-table thead th {
      background: #f5f5f5 !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      padding: 8px 10px;
      text-align: left;
      font-weight: 700; /* Bolder text */
      font-size: 13px;  /* Slightly larger */
      border: 1px solid #ddd;
    }
    .products-table tbody td {
      padding: 8px 10px;
      border: 1px solid #ddd;
      font-size: 12px;
      color: #000 !important; /* Force black text */
      font-weight: 500; /* Slightly bolder */
    }
    .products-table tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    /* Force all text in table to be black */
    .products-table * {
      color: #000 !important;
    }
    .products-table tbody tr:hover {
      background-color: #f1f1f1;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .totals-section {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      display: ${settings.showTotals !== false ? 'flex' : 'none'};
      font-size: 13px;
    }
    .totals-box {
      width: 280px;
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #e0e0e0;
      margin: 6px 0;
    }
    .total-row:last-child {
      border-bottom: none;
    }
    .total-label {
      font-weight: 600;
      color: #333;
    }
    .total-value {
      font-weight: 600;
      color: #2c3e50;
    }
    .grand-total {
      font-size: 14px;
      font-weight: bold;
      color: #4CAF50;
      padding-top: 6px;
      margin-top: 8px;
      border-top: 1px solid #333;
    }
    .grand-total .total-value {
      color: #4CAF50;
      font-size: 16px;
    }
    .payment-section {
      margin-top: 10px;
      padding: 10px;
      background: #f0f0f0 !important;
      border: 1px solid #ddd !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border-radius: 4px;
      border-left: 3px solid #000 !important;
      display: ${settings.showPaymentInfo !== false ? 'block' : 'none'};
      font-size: 10px;
    }
    .payment-section h3 {
      font-size: 11px;
      color: #000 !important;
      margin-bottom: 6px;
      font-weight: 700;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .payment-info {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .payment-info-item {
      flex: 1;
      min-width: 120px;
    }
    .payment-info-item strong {
      display: block;
      color: #666;
      font-size: 9px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }
    .payment-info-item span {
      font-size: 11px;
      color: #2c3e50;
      font-weight: 600;
    }
    .footer-section {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #000 !important;
      text-align: center;
      color: #000 !important;
      font-size: 9px;
      display: ${settings.footerText ? 'block' : 'none'};
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .footer-section p {
      margin: 3px 0;
    }
    .thank-you {
      font-size: 12px;
      color: #000 !important;
      font-weight: 700;
      margin-bottom: 5px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .signature-section {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      display: ${settings.showSignatureArea !== false ? 'flex' : 'none'};
    }
    .signature-box {
      width: 200px;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin: 30px 0 5px 0;
    }
    .signature-label {
      font-size: 10px;
      color: #000 !important;
      font-weight: 600;
    }
    ${customCss}
  </style>
</head>
<body style="page-break-inside: avoid !important; break-inside: avoid !important;">
  <div class="invoice-container" style="page-break-inside: avoid !important; break-inside: avoid !important;">
    <!-- Header -->
    <div class="invoice-header">
    <div class="shop-info">
      ${settings.showShopLogo && (shopInfo as any)?.logoPrimary ? `
      <div class="shop-logo-container">
        <img src="${(shopInfo as any).logoPrimary}" alt="Logo" class="shop-logo">
      </div>
      ` : ''}
      ${(!settings.showShopLogo || !(shopInfo as any)?.logoPrimary) && settings.showShopName !== false ? `<div class="shop-name">${shopName}</div>` : ''}
      <div class="shop-details">
        ${settings.showShopAddress !== false ? `<div class="shop-address">${shopAddress}</div>` : ''}
        ${settings.showShopPhone !== false ? `<div class="shop-phone">${shopPhone}</div>` : ''}
        ${shopEmail ? `<div class="shop-email">${shopEmail}</div>` : ''}
        ${shopWebsite ? `<div class="shop-website">${shopWebsite}</div>` : ''}
      </div>
    </div>
    
  </div>

    <!-- Invoice Meta Information -->
    <div class="invoice-meta">
      <div class="invoice-meta-section">
        <h3>Bill To</h3>
        ${customerName ? `<p><strong>Name:</strong> ${customerName}</p>` : '<p><strong>Name:</strong> Walk-in Customer</p>'}
        ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ''}
        ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
        ${customerAddress ? `<p><strong>Address:</strong> ${customerAddress}</p>` : ''}
        ${customerCity || customerPostCode ? `<p><strong>City/Post:</strong> ${customerCity || ''}${customerPostCode ? (customerCity ? ' - ' : '') + customerPostCode : ''}</p>` : ''}
      </div>
      <div class="invoice-meta-section">
        <h3>Invoice Details</h3>
        ${settings.showInvoiceNumber !== false ? `<p><strong>Invoice #:</strong> ${invoiceNo}</p>` : ''}
        ${settings.showDate !== false ? `<p><strong>Date:</strong> ${saleDate}</p>` : ''}
        ${settings.showTime !== false && saleTime ? `<p><strong>Time:</strong> ${saleTime}</p>` : ''}
        ${settings.showSalesmanInfo !== false ? `<p><strong>Salesman:</strong> ${salesmanName}${salesmanPhone ? ' (' + salesmanPhone + ')' : ''}</p>` : ''}
      </div>
    </div>

    <!-- Products Table -->
    ${settings.showProductTable !== false ? `
    <table class="products-table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th class="text-center">Quantity</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${productsRows}
      </tbody>
    </table>
    ` : ''}

    <!-- Totals Section -->
    ${settings.showTotals !== false ? `
    <div class="totals-section">
      <div class="totals-box">
        <div class="total-row">
          <span class="total-label">Sub Total:</span>
          <span class="total-value">${currencySymbol}${subTotal}</span>
        </div>
        ${discountAmount > 0 ? `
        <div class="total-row">
          <span class="total-label">Discount:</span>
          <span class="total-value" style="color: #f44336;">-${currencySymbol}${discount}</span>
        </div>
        ` : ''}
        ${(sale?.vatAmount || 0) > 0 ? `
        <div class="total-row">
          <span class="total-label">VAT:</span>
          <span class="total-value">${currencySymbol}${vatAmount}</span>
        </div>
        ` : ''}
        <div class="total-row grand-total">
          <span class="total-label">Grand Total:</span>
          <span class="total-value">${currencySymbol}${grandTotal}</span>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Payment Information -->
    ${settings.showPaymentInfo !== false ? `
    <div class="payment-section">
      <h3>Payment Information</h3>
      <div class="payment-info">
        <div class="payment-info-item">
          <strong>Payment Method</strong>
          <span>${sale?.paymentType || 'Cash'}</span>
        </div>
        <div class="payment-info-item">
          <strong>Total Amount</strong>
          <span>${currencySymbol}${grandTotal}</span>
        </div>
        <div class="payment-info-item">
          <strong>Amount Paid</strong>
          <span>${currencySymbol}${received}</span>
        </div>
        ${dueAmount > 0 ? `
        <div class="payment-info-item">
          <strong>Due Amount</strong>
          <span style="color: #f44336; font-weight: 700;">${currencySymbol}${due}</span>
        </div>
        ` : ''}
        ${parseFloat(change) > 0 ? `
        <div class="payment-info-item">
          <strong>Change</strong>
          <span>${currencySymbol}${change}</span>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Signature Section -->
    ${settings.showSignatureArea !== false ? `
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Customer Signature</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Authorized Signature</div>
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    ${settings.footerText ? `
    <div class="footer-section">
      <p>${settings.footerText}</p>
      ${settings.showReturnPolicy !== false && settings.returnPolicyText ? `
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        <strong>Return Policy:</strong> ${settings.returnPolicyText}
      </p>
      ` : ''}
    </div>
    ` : ''}
  </div>
</body>
</html>`;
    }

    // POS Invoice Template (Original Design)
    return `<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${invoiceNo}</title>
  <style>
    @media print {
      @page { 
        margin: ${isA4Print ? '10mm' : '5mm'} !important; 
        size: ${paperWidth} !important; 
        page-break-inside: avoid !important;
        orphans: 0 !important;
        widows: 0 !important;
      }
      /* Universal page break prevention for all elements */
      * {
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
        break-inside: avoid !important;
        break-after: avoid !important;
        break-before: avoid !important;
      }
      html, body {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-before: avoid !important;
        break-before: avoid !important;
      }
      body { 
        margin: 0 !important;
        padding: 0 !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
      }
      /* Prevent page breaks for all invoice sections */
      .header, .invoice-info, .customer-info, .salesman-info, .total-section, .payment-info, .payment-section, .footer, .return-policy, .signature-area, .qr-code, .barcode, .divider {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-before: avoid !important;
        break-before: avoid !important;
      }
      table {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      thead {
        display: table-header-group;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      tbody {
        display: table-row-group;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      td, th {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
    body {
      font-family: Arial, sans-serif;
      padding: ${paperSize === '80mm' ? '15px' : '10px'};
      max-width: ${paperWidth};
      margin: 0 auto;
      font-size: ${paperSize === '80mm' ? '14px' : '12px'};
      overflow: hidden;
      height: auto;
    }
    .invoice-wrapper {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    @media print {
      body {
        overflow: visible;
        height: auto;
      }
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: ${settings.showShopName !== false ? '15px' : '10px'};
      margin-bottom: 15px;
    }
    .shop-logo {
      max-width: 80px;
      max-height: 80px;
      margin-bottom: 10px;
      display: ${settings.showShopLogo && (shopInfo as any)?.logo ? 'block' : 'none'};
    }
    .shop-name {
      font-size: ${isA4Print ? '24px' : (paperSize === '80mm' ? '20px' : '18px')};
      font-weight: bold;
      margin-bottom: 8px;
      display: ${settings.showShopName !== false ? 'block' : 'none'};
    }
    .shop-address {
      display: ${settings.showShopAddress !== false ? 'block' : 'none'};
      margin: 5px 0;
    }
    .shop-phone {
      display: ${settings.showShopPhone !== false ? 'block' : 'none'};
      margin: 5px 0;
    }
    .invoice-info {
      margin-bottom: 15px;
      font-size: ${isA4Print ? '14px' : (paperSize === '80mm' ? '13px' : '11px')};
    }
    .invoice-info div {
      margin: 3px 0;
    }
    .invoice-no {
      display: ${settings.showInvoiceNumber !== false ? 'block' : 'none'};
    }
    .invoice-date {
      display: ${settings.showDate !== false ? 'block' : 'none'};
    }
    .invoice-time {
      display: ${settings.showTime !== false ? 'block' : 'none'};
    }
    .customer-info {
      margin-bottom: 15px;
      display: ${settings.showCustomerInfo !== false && (customerName || customerPhone) ? 'block' : 'none'};
    }
    .salesman-info {
      margin-bottom: 15px;
      display: ${settings.showSalesmanInfo !== false ? 'block' : 'none'};
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      display: ${settings.showProductTable !== false ? 'table' : 'none'};
      font-size: ${isA4Print ? '13px' : (paperSize === '80mm' ? '12px' : '10px')};
    }
    th, td {
      border: 1px solid #ddd;
      padding: 5px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .total-section {
      margin-top: 15px;
      text-align: right;
      display: ${settings.showTotals !== false ? 'block' : 'none'};
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin: 4px 0;
    }
    .total-label {
      width: ${isA4Print ? '150px' : (paperSize === '80mm' ? '120px' : '100px')};
      font-weight: bold;
      text-align: left;
    }
    .total-value {
      width: ${isA4Print ? '120px' : (paperSize === '80mm' ? '100px' : '80px')};
      text-align: right;
    }
    .grand-total {
      font-size: ${isA4Print ? '18px' : (paperSize === '80mm' ? '16px' : '14px')};
      font-weight: bold;
      border-top: 2px solid #000;
      padding-top: 8px;
    }
    .payment-info {
      margin-top: 15px;
      display: ${settings.showPaymentInfo !== false ? 'block' : 'none'};
    }
    .qr-code {
      text-align: center;
      margin: 15px 0;
      display: ${settings.showQRCode !== false ? 'block' : 'none'};
    }
    .qr-code img {
      max-width: 150px;
      height: auto;
    }
    .barcode {
      text-align: center;
      margin: 15px 0;
      display: ${settings.showBarcode !== false ? 'block' : 'none'};
    }
    .barcode img {
      max-width: 100%;
      height: auto;
    }
    .return-policy {
      margin-top: 15px;
      font-size: ${paperSize === '80mm' ? '11px' : '9px'};
      display: ${settings.showReturnPolicy !== false && settings.returnPolicyText ? 'block' : 'none'};
    }
    .return-policy-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .signature-area {
      margin-top: 30px;
      display: ${settings.showSignatureArea !== false ? 'block' : 'none'};
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 40px;
      margin-bottom: 5px;
    }
    .signature-label {
      font-size: ${paperSize === '80mm' ? '11px' : '9px'};
      text-align: center;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: ${paperSize === '80mm' ? '11px' : '9px'};
      color: #666;
      display: ${settings.footerText ? 'block' : 'none'};
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 10px 0;
    }
    ${customCss}
  </style>
</head>
<body style="page-break-inside: avoid !important; break-inside: avoid !important;">
<div class="invoice-wrapper" style="page-break-inside: avoid !important; break-inside: avoid !important;">
  ${(settings.showShopName !== false || settings.showShopAddress !== false || settings.showShopPhone !== false) ? `
  <div class="header">
    ${settings.showShopLogo && (shopInfo as any)?.logo ? `<img src="${(shopInfo as any).logo}" alt="Logo" class="shop-logo">` : ''}
    ${settings.showShopName !== false ? `<div class="shop-name">${shopName}</div>` : ''}
    ${settings.showShopAddress !== false ? `<div class="shop-address">${shopAddress}</div>` : ''}
    ${settings.showShopPhone !== false ? `<div class="shop-phone">Phone: ${shopPhone}</div>` : ''}
  </div>
  <div class="divider"></div>
  ` : ''}
  
  <div class="invoice-info">
    ${settings.showInvoiceNumber !== false ? `<div class="invoice-no"><strong>Invoice:</strong> ${invoiceNo}</div>` : ''}
    ${settings.showDate !== false ? `<div class="invoice-date"><strong>Date:</strong> ${saleDate}</div>` : ''}
    ${settings.showTime !== false && saleTime ? `<div class="invoice-time"><strong>Time:</strong> ${saleTime}</div>` : ''}
  </div>
  
  ${settings.showCustomerInfo !== false && (customerName || customerPhone) ? `
  <div class="customer-info">
    ${customerName ? `<div><strong>Customer:</strong> ${customerName}</div>` : ''}
    ${customerPhone ? `<div><strong>Phone:</strong> ${customerPhone}</div>` : ''}
  </div>
  ` : ''}
  
  ${settings.showSalesmanInfo !== false ? `
  <div class="salesman-info">
    <div><strong>Salesman:</strong> ${salesmanName}</div>
  </div>
  ` : ''}
  
  ${settings.showProductTable !== false ? `
  <div class="divider"></div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${productsRows}
    </tbody>
  </table>
  <div class="divider"></div>
  ` : ''}
  
  ${settings.showTotals !== false ? `
  <div class="total-section">
    <div class="total-row">
      <div class="total-label">Sub Total:</div>
      <div class="total-value">${currencySymbol}${subTotal}</div>
    </div>
    ${discountAmount > 0 ? `
    <div class="total-row">
      <div class="total-label">Discount:</div>
      <div class="total-value">-${currencySymbol}${discount}</div>
    </div>
    ` : ''}
    ${(sale?.vatAmount || 0) > 0 ? `
    <div class="total-row">
      <div class="total-label">VAT:</div>
      <div class="total-value">${currencySymbol}${vatAmount}</div>
    </div>
    ` : ''}
    <div class="total-row grand-total">
      <div class="total-label">Total:</div>
      <div class="total-value">${currencySymbol}${grandTotal}</div>
    </div>
  </div>
  ` : ''}
  
  ${settings.showPaymentInfo !== false ? `
  <div class="payment-info">
    <div><strong>Payment:</strong> ${sale?.paymentType || 'Cash'}</div>
    <div><strong>Total:</strong> ${currencySymbol}${grandTotal}</div>
    <div><strong>Received:</strong> ${currencySymbol}${received}</div>
    ${dueAmount > 0 ? `<div><strong>Due:</strong> <span style="color: #f44336; font-weight: 700;">${currencySymbol}${due}</span></div>` : ''}
    ${parseFloat(change) > 0 ? `<div><strong>Change:</strong> ${currencySymbol}${change}</div>` : ''}
  </div>
  ` : ''}
  
  ${settings.showQRCode !== false ? `
  <div class="divider"></div>
  <div class="qr-code">
    <!-- QR Code will be generated by receipt template component -->
  </div>
  ` : ''}
  
  ${settings.showBarcode !== false ? `
  <div class="barcode">
    <!-- Barcode will be generated by receipt template component -->
  </div>
  ` : ''}
  
  ${settings.showReturnPolicy !== false && settings.returnPolicyText ? `
  <div class="divider"></div>
  <div class="return-policy">
    <div class="return-policy-title"><strong>Return Policy:</strong></div>
    <div class="return-policy-text">${settings.returnPolicyText}</div>
  </div>
  ` : ''}
  
  ${settings.showSignatureArea !== false ? `
  <div class="signature-area">
    <div class="signature-line"></div>
    <div class="signature-label">${settings.signatureLabel || 'Customer Signature'}</div>
  </div>
  ` : ''}
  
  ${settings.footerText ? `
  <div class="footer">
    <div>${settings.footerText}</div>
  </div>
  ` : ''}
</div>
</body>
</html>`;
  }

  /**
   * Reprint Bill Dialog
   */
  openReprintDialog() {
    this.dialog.open(ReprintBillComponent, {
      width: '600px',
      maxHeight: '80vh',
      data: {}
    });
  }

  /**
   * Get Paid Amount for a sale (prioritize receivedFromCustomer)
   */
  getPaidAmount(sale: Sale): number {
    // Priority: receivedFromCustomer > paidAmount > total (if cash and no receivedFromCustomer)
    return sale?.receivedFromCustomer || sale?.paidAmount || (sale?.paymentType === 'cash' && !sale?.receivedFromCustomer ? sale?.total : 0);
  }

  /**
   * Calculate Due Amount for a sale
   */
  getDueAmount(sale: Sale): number {
    const total = sale?.total || 0;
    const paid = this.getPaidAmount(sale);
    return Math.max(0, total - paid);
  }

  /**
   * Calculate Group Paid Total
   */
  getGroupPaidTotal(sales: Sale[]): number {
    return sales.reduce((sum, sale) => {
      return sum + this.getPaidAmount(sale);
    }, 0);
  }

  /**
   * Calculate Group Due Total
   */
  getGroupDueTotal(sales: Sale[]): number {
    return sales.reduce((sum, sale) => {
      const total = sale?.total || 0;
      const paid = this.getPaidAmount(sale);
      return sum + Math.max(0, total - paid);
    }, 0);
  }

  /**
   * Calculate Group Return Total
   */
  getGroupReturnTotal(sales: Sale[]): number {
    return sales.reduce((sum, sale) => {
      return sum + (sale?.totalReturnedAmount || sale?.returnTotal || 0);
    }, 0);
  }

  /**
   * Calculate Daily Grand Total
   */
  getDailyGrandTotal(): number {
    if (!this.sales || !this.sales.length) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const todaySales = this.sales.find(group => group._id === today);
    
    if (!todaySales || !todaySales.data || !todaySales.data.length) return 0;
    
    return todaySales.data.reduce((total, sale) => {
      return total + (sale?.total || 0);
    }, 0);
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
    if (this.subPrinterSettings) {
      this.subPrinterSettings.unsubscribe();
    }
  }
}

