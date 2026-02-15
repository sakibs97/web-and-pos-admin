import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { UiService } from '../../../../services/core/ui.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SaleService } from '../../../../services/common/sale.service';
import { Product } from '../../../../interfaces/common/product.interface';
import { MatDialog } from '@angular/material/dialog';
import { UtilsService } from '../../../../services/core/utils.service';
import { Sale } from '../../../../interfaces/common/sale.interface';
import { VendorService } from '../../../../services/vendor/vendor.service';
import { ShopInformation } from '../../../../interfaces/common/shop-information.interface';
import { ShopInformationService } from '../../../../services/common/shop-information.service';
import { ConfirmDialogComponent } from '../../../../shared/components/ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-sales-return',
  templateUrl: './new-sales-return.component.html',
  styleUrls: ['./new-sales-return.component.scss']
})
export class NewSalesReturnComponent implements OnInit, OnDestroy {

  // Vendor Base Data
  vendor: any = null;

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  isLoading: boolean = false;
  selectedSale: Sale = null;
  soldDate: Date = new Date();
  returnData: any = null; // Return data uses different structure than Sale

  // Shop data
  shopInformation: ShopInformation;

  // Store Components Data
  returnProducts: Product[] = [];
  allSales: Sale[] = [];
  searchSales: Sale[] = [];
  saleSearchQuery: string = '';

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subShopInfo: Subscription;

  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private activatedRoute: ActivatedRoute,
    private saleService: SaleService,
    private router: Router,
    private dialog: MatDialog,
    public utilsService: UtilsService,
    private vendorService: VendorService,
    private shopInformationService: ShopInformationService,
  ) {
  }

  ngOnInit(): void {
    // Init Data Form
    this.initDataForm();

    // Base Data
    this.getVendorData();
    this.getShopInformation();
    this.getAllSales();
  }

  /**
   * Vendor Data
   */
  private getVendorData() {
    const vendorId = this.vendorService.getUserId();
    let vendorName = 'Admin';

    const cachedName = sessionStorage.getItem('vendor-name');
    if (cachedName) {
      vendorName = cachedName;
      this.vendor = { _id: vendorId, name: vendorName };
      return;
    }

    this.subDataTwo = this.vendorService.getLoggedInVendorData()
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            vendorName = res.data.name ||
              res.data.username ||
              this.vendorService.getUserRole() ||
              'Admin';
            if (vendorName !== 'Admin') {
              sessionStorage.setItem('vendor-name', vendorName);
            }
            this.vendor = { _id: vendorId, name: vendorName };
          } else {
            vendorName = this.vendorService.getUserRole() || 'Admin';
            this.vendor = { _id: vendorId, name: vendorName };
          }
        },
        error: (err) => {
          console.warn('Failed to fetch vendor name, using role:', err);
          vendorName = this.vendorService.getUserRole() || 'Admin';
          this.vendor = { _id: vendorId, name: vendorName };
        }
      });
  }

  /**
   * FORM METHODS
   */
  private initDataForm() {
    this.dataForm = this.fb.group({
      saleSearch: [null],
    });
  }

  /**
   * HTTP REQ HANDLE
   */
  private getAllSales() {
    this.isLoading = true;
    const filter: any = {
      filter: {
        status: 'Sale'
      },
      pagination: null,
      select: {
        invoiceNo: 1,
        customer: 1,
        products: 1,
        soldDate: 1,
        soldDateString: 1,
        total: 1,
        subTotal: 1,
        hasPartialReturn: 1,
        hasReturn: 1,
        totalReturnedAmount: 1,
      },
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.saleService.getAllSale(filter, null)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.allSales = res.data || [];
          } else {
            this.uiService.message('Failed to load sales', 'warn');
            this.allSales = [];
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading sales:', err);
          this.allSales = [];
        }
      });
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
   * Handle Sale Search & Selection
   */
  onSaleSearch(query: string) {
    this.saleSearchQuery = query;
    if (query && query.length > 0) {
      const searchTerm = query.toLowerCase().trim();
      this.searchSales = this.allSales.filter(s => {
        const invoiceNo = s.invoiceNo?.toLowerCase() || '';
        const customerPhone = s.customer?.phone?.toLowerCase() || '';
        return invoiceNo.includes(searchTerm) || customerPhone.includes(searchTerm);
      }).slice(0, 10);
    } else {
      this.searchSales = [];
    }
  }

  onSelectSale(sale: Sale) {
    this.selectedSale = sale;
    this.returnProducts = [];
    this.saleSearchQuery = '';
    this.searchSales = [];

    // Load products from selected sale
    if (sale.products && sale.products.length > 0) {
      this.returnProducts = sale.products.map(p => ({
        ...p,
        returnQuantity: 0,
        // Calculate available quantity: soldQuantity - already returned
        maxReturnQuantity: (p.soldQuantity || 0) - (p.returnedQty || 0),
        returnStatus: p.returnStatus || 'SOLD'
      })).filter(p => p.maxReturnQuantity > 0); // Only show products that can be returned
    }

    if (this.returnProducts.length === 0) {
      this.uiService.message('All products from this sale have already been returned', 'warn');
    }
  }

  onSelectProductForReturn(index: number) {
    if (this.returnProducts[index]) {
      const product = this.returnProducts[index];
      if (product.returnQuantity === undefined || product.returnQuantity === 0) {
        product.returnQuantity = 1;
      }
    }
  }

  incrementReturnQuantity(index: number) {
    if (this.returnProducts[index]) {
      const product = this.returnProducts[index];
      if (product.returnQuantity < product.maxReturnQuantity) {
        product.returnQuantity++;
      } else {
        this.uiService.message('Cannot return more than sold quantity', 'warn');
      }
    }
  }

  decrementReturnQuantity(index: number) {
    if (this.returnProducts[index] && this.returnProducts[index].returnQuantity > 0) {
      this.returnProducts[index].returnQuantity--;
    }
  }

  removeReturnProduct(index: number) {
    this.returnProducts[index].returnQuantity = 0;
  }

  /**
   * Submit Return
   */
  onSubmit() {
    if (!this.selectedSale) {
      this.uiService.message('Please select a sale to return', 'warn');
      return;
    }

    const returnItems = this.returnProducts.filter(p => p.returnQuantity > 0);
    if (returnItems.length === 0) {
      this.uiService.message('Please select products to return', 'warn');
      return;
    }

    // Prepare return data - proper format for return-sales API
    const returnProducts = returnItems.map(p => ({
      _id: p._id,
      sku: p.sku || '',
      name: p.name,
      salePrice: p.salePrice,
      purchasePrice: p.purchasePrice || 0,
      soldQuantity: p.returnQuantity, // This is the quantity being returned
      returnQty: p.returnQuantity,
      returnAmount: (p.salePrice || 0) * p.returnQuantity,
      images: p.images || []
    }));

    this.returnData = {
      customer: this.selectedSale.customer,
      products: returnProducts,
      invoiceNo: this.selectedSale.invoiceNo, // Original invoice reference
      originalInvoiceNo: this.selectedSale.invoiceNo,
      returnType: 'REFUND',
      returnDate: this.soldDate,
      grandTotal: this.returnTotal, // Required for return-sales API
      subTotal: this.returnTotal,
      totalPurchasePrice: this.returnPurchaseTotal,
      reason: '', // Can be updated by user if needed
    };

    this.openConfirmDialog();
  }

  /**
   * COMPONENT DIALOG VIEW
   */
  public openConfirmDialog() {
    const currencySymbol = this.getCurrencySymbol();
    const totalAmount = this.returnTotal.toFixed(2);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        title: 'Confirm Return',
        message: `Are you sure you want to process this return? Return Amount: ${currencySymbol}${totalAmount}`,
        confirmText: 'Confirm Return',
        cancelText: 'Cancel'
      },
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.addReturn();
      }
    });
  }

  private addReturn() {
    this.isLoading = true;
    // Use addReturnSale for proper return-sales API
    this.subDataThree = this.saleService.addReturnSale(this.returnData).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.message(res.message || 'Return processed successfully', 'success');
          setTimeout(() => {
            this.formElement.resetForm();
            this.selectedSale = null;
            this.returnProducts = [];
            this.saleSearchQuery = '';
            this.isLoading = false;
            this.router.navigate(['/pos/sales/return-list']);
          }, 200);
        } else {
          this.isLoading = false;
          this.uiService.message(res.message || 'Failed to process return', 'warn');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error processing return:', error);
        const errorMessage = error?.error?.message ||
          error?.message ||
          'Failed to process return. Please check your connection and try again.';
        this.uiService.message(errorMessage, 'warn');
      },
    });
  }

  /**
   * Get Currency Symbol
   */
  private getCurrencySymbol(): string {
    if (!this.shopInformation?.currency) {
      return '৳';
    }
    switch (this.shopInformation.currency) {
      case 'BDT':
        return '৳';
      case 'SGD':
        return 'S$';
      case 'Dollar':
        return '$';
      default:
        return '৳';
    }
  }

  /**
   * Calculation Area
   */
  get returnTotal() {
    return Number(
      this.returnProducts
        .filter(p => p.returnQuantity > 0)
        .map(p => (p.salePrice || 0) * (p.returnQuantity || 0))
        .reduce((acc, value) => acc + value, 0)
        .toFixed(2)
    );
  }

  get returnPurchaseTotal() {
    return Number(
      this.returnProducts
        .filter(p => p.returnQuantity > 0)
        .map(p => (p.purchasePrice || 0) * (p.returnQuantity || 0))
        .reduce((acc, value) => acc + value, 0)
        .toFixed(2)
    );
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
    if (this.subShopInfo) {
      this.subShopInfo.unsubscribe();
    }
  }
}

