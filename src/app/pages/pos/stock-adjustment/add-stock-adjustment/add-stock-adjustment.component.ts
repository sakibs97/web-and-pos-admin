import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UiService } from '../../../../services/core/ui.service';
import { StockAdjustmentService } from '../../../../services/common/stock-adjustment.service';
import { ProductService } from '../../../../services/common/product.service';
import { ShopService } from '../../../../services/common/shop.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { VendorService } from '../../../../services/vendor/vendor.service';
import { UtilsService } from '../../../../services/core/utils.service';
import { FilterData } from '../../../../interfaces/gallery/filter-data';
import { Product } from '../../../../interfaces/common/product.interface';

@Component({
  selector: 'app-add-stock-adjustment',
  templateUrl: './add-stock-adjustment.component.html',
  styleUrls: ['./add-stock-adjustment.component.scss']
})
export class AddStockAdjustmentComponent implements OnInit, OnDestroy {
  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;
  disable = false;

  // Store Data
  isLoading: boolean = false;
  id?: string;
  adjustment?: any;

  // Products
  products: Product[] = [];
  searchProducts: Product[] = [];
  searchResultsWithVariations: any[] = []; // Flattened results including variations
  productSearchQuery: string = '';
  selectedProduct: Product = null;
  selectedVariation: any = null; // Selected variation if product has variations

  // Branches
  branches: any[] = [];
  selectedBranch: string = '';

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subReload: Subscription;

  constructor(
    private fb: FormBuilder,
    private stockAdjustmentService: StockAdjustmentService,
    private productService: ProductService,
    private shopService: ShopService,
    private uiService: UiService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private reloadService: ReloadService,
    private vendorService: VendorService,
    public utilsService: UtilsService,
  ) { }

  ngOnInit(): void {
    // Get ID from route
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.initDataForm();
    this.getAllProducts();
    this.getAllBranches();

    if (this.id) {
      this.getAdjustmentById();
    }
  }

  /**
   * INIT FORM
   */
  private initDataForm() {
    this.dataForm = this.fb.group({
      product: [null, [Validators.required]],
      adjustmentType: ['stock_in', [Validators.required]],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
      reason: [null],
      reference: [null],
      date: [new Date(), [Validators.required]],
      branch: [null],
    });
  }

  /**
   * HTTP REQ HANDLE
   */
  private getAllProducts() {
    const mSelect = {
      _id: 1,
      name: 1,
      sku: 1,
      salePrice: 1,
      purchasePrice: 1,
      costPrice: 1,
      variation: 1,
      isVariation: 1,
      variation2:1,
      variationList:1,
      variation2Options:1,
      variationOptions1:1,
      quantity: 1,
      status: 1,
      images: 1,
      category: 1,
      brand: 1,
      sizes: 1,
      colors: 1,
      model: 1,
      others: 1,
    };

    // Filter for active products only
    const filter: FilterData = {
      filter: {
        status: {$ne: 'trash'}
      },
      pagination: null,
      select: mSelect,
      sort: {createdAt: -1},
    };

    this.subDataOne = this.productService.getAllProducts(filter, null).subscribe({
      next: (res) => {
        if (res.success) {
          this.products = res.data || [];
          console.log('Products loaded:', this.products.length);
        } else {
          console.error('Failed to load products:', res);
          this.uiService.message('Failed to load products', 'warn');
        }
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.uiService.message('Failed to load products', 'warn');
      }
    });
  }

  private getAllBranches() {
    this.subDataTwo = this.shopService.getAllShop({ pagination: { pageSize: 1000, currentPage: 1 } }).subscribe({
      next: (res) => {
        if (res.success) {
          this.branches = res.data || [];
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onProductSearch(query: string) {
    this.productSearchQuery = query;
    if (!query || query.trim().length < 1) {
      this.searchProducts = [];
      this.searchResultsWithVariations = [];
      return;
    }
    const searchTerm = query.toLowerCase().trim();
    console.log('Searching for:', searchTerm, 'in', this.products.length, 'products');
    
    // Filter products that match
    this.searchProducts = this.products.filter(p => {
      const productName = this.utilsService.getProductName(p)?.toLowerCase() || '';
      const name = p.name?.toLowerCase() || '';
      const sku = p.sku?.toLowerCase() || '';
      const parentSku = p.parentSku?.toLowerCase() || '';
      const barcode = p.barcode?.toLowerCase() || '';
      const productKeyword = Array.isArray(p.productKeyword)
        ? p.productKeyword.map(k => k?.toLowerCase() || '').join(' ')
        : '';
      return productName.includes(searchTerm) ||
             name.includes(searchTerm) ||
             sku.includes(searchTerm) ||
             parentSku.includes(searchTerm) ||
             barcode.includes(searchTerm) ||
             productKeyword.includes(searchTerm);
    }).slice(0, 10);

    // Create flattened results with variations as separate items
    this.searchResultsWithVariations = [];
    this.searchProducts.forEach(product => {
      if (product.isVariation && product.variationList && product.variationList.length > 0) {
        // Add each variation as a separate item
        product.variationList.forEach((variation: any) => {
          // Also check if search term matches variation name, SKU, or barcode
          const variationName = variation.name?.toLowerCase() || '';
          const variationSku = variation.sku?.toLowerCase() || '';
          const variationBarcode = variation.barcode?.toLowerCase() || '';
          const matchesVariation = variationName.includes(searchTerm) ||
                                   variationSku.includes(searchTerm) ||
                                   variationBarcode.includes(searchTerm);

          // Include if product matches OR variation matches
          if (matchesVariation || this.searchProducts.includes(product)) {
            this.searchResultsWithVariations.push({
              product: product,
              variation: variation,
              isVariation: true,
              displayName: `${product.name} - ${variation.name || 'Variation'}`,
              stock: variation.quantity || 0,
              sku: variation.sku || product.sku,
              barcode: variation.barcode || product.barcode
            });
          }
        });
      } else {
        // Add non-variation product
        this.searchResultsWithVariations.push({
          product: product,
          variation: null,
          isVariation: false,
          displayName: this.utilsService.getProductName(product),
          stock: product.quantity || 0,
          sku: product.sku,
          barcode: product.barcode
        });
      }
    });
    
    console.log('Search results:', this.searchProducts.length, 'products,', this.searchResultsWithVariations.length, 'items (with variations)');
  }

  onSelectProduct(product: Product) {
    this.selectedProduct = product;
    this.selectedVariation = null;
    this.dataForm.patchValue({ product: product._id });
    this.productSearchQuery = this.utilsService.getProductName(product) || product.name || '';
    this.searchProducts = [];
    this.searchResultsWithVariations = [];
  }

  onSelectSearchItem(item: any) {
    // Direct selection from search results (already has variation selected if applicable)
    if (item.isVariation && item.variation) {
      this.selectedProduct = item.product;
      this.selectedVariation = item.variation;
      // Store variation ID in a custom way - you may need to adjust backend to accept variation
      this.dataForm.patchValue({ product: item.product._id });
      this.productSearchQuery = item.displayName;
    } else {
      this.selectedProduct = item.product;
      this.selectedVariation = null;
      this.dataForm.patchValue({ product: item.product._id });
      this.productSearchQuery = item.displayName;
    }
    this.searchProducts = [];
    this.searchResultsWithVariations = [];
  }

  private getAdjustmentById() {
    this.isLoading = true;
    this.subDataThree = this.stockAdjustmentService.getStockAdjustmentById(this.id)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.adjustment = res.data;
            this.setFormValue();
          } else {
            this.uiService.message('Failed to load adjustment data', 'warn');
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.uiService.message('Failed to load adjustment data', 'warn');
        }
      });
  }

  private setFormValue() {
    if (this.adjustment) {
      this.dataForm.patchValue({
        product: this.adjustment.product?._id,
        adjustmentType: this.adjustment.adjustmentType || this.adjustment.type,
        quantity: this.adjustment.quantity,
        reason: this.adjustment.reason,
        reference: this.adjustment.reference,
        date: this.adjustment.date ? new Date(this.adjustment.date) : new Date(),
        branch: this.adjustment.branch?._id || null,
      });

      if (this.adjustment.product) {
        this.selectedProduct = this.adjustment.product as any;
        this.productSearchQuery = this.adjustment.product.name;
      }
    }
  }

  /**
   * SUBMIT FORM
   */
  onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.message('Please fill all required fields', 'warn');
      return;
    }

    if (this.id) {
      this.updateAdjustment();
    } else {
      this.addAdjustment();
    }
  }

  private addAdjustment() {
    this.isLoading = true;
    const formData = { ...this.dataForm.value };

    // Add variation ID if variation is selected
    if (this.selectedVariation && this.selectedVariation._id) {
      formData.variation = this.selectedVariation._id;
    }

    // Convert empty string to null for branch field
    if (formData.branch === '' || formData.branch === undefined) {
      formData.branch = null;
    }

    this.subDataTwo = this.stockAdjustmentService.addStockAdjustment(formData)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.uiService.message('Stock adjustment added successfully', 'success');
            this.formElement.resetForm();
            this.initDataForm();
            this.reloadService.needRefreshData$();
            this.router.navigate(['/pos/stock-adjustment/list']);
          } else {
            this.uiService.message('Failed to add adjustment', 'warn');
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.uiService.message(err.error?.message || 'Failed to add adjustment', 'warn');
        }
      });
  }

  private updateAdjustment() {
    this.isLoading = true;
    const formData = { ...this.dataForm.value };

    // Add variation ID if variation is selected
    if (this.selectedVariation && this.selectedVariation._id) {
      formData.variation = this.selectedVariation._id;
    }

    // Convert empty string to null for branch field
    if (formData.branch === '' || formData.branch === undefined) {
      formData.branch = null;
    }

    this.subDataTwo = this.stockAdjustmentService.updateStockAdjustmentById(this.id, formData)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.uiService.message('Stock adjustment updated successfully', 'success');
            this.reloadService.needRefreshData$();
            this.router.navigate(['/pos/stock-adjustment/list']);
          } else {
            this.uiService.message('Failed to update adjustment', 'warn');
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.uiService.message(err.error?.message || 'Failed to update adjustment', 'warn');
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subDataOne) {
      this.subDataOne.unsubscribe();
    }
    if (this.subDataTwo) {
      this.subDataTwo.unsubscribe();
    }
    if (this.subDataThree) {
      this.subDataThree.unsubscribe();
    }
    if (this.subReload) {
      this.subReload.unsubscribe();
    }
  }
}

