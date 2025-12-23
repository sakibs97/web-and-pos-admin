import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrinterSettingsService } from '../../../../services/common/printer-settings.service';
import { UiService } from '../../../../services/core/ui.service';

@Component({
  selector: 'app-printer-settings',
  templateUrl: './printer-settings.component.html',
  styleUrls: ['./printer-settings.component.scss']
})
export class PrinterSettingsComponent implements OnInit {
  printerSettingsForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private printerSettingsService: PrinterSettingsService,
    private uiService: UiService
  ) {
    this.printerSettingsForm = this.fb.group({
      printType: ['pos', Validators.required], // A4, POS, or Label print
      paperSize: ['58mm', Validators.required],
      labelSize: ['3in 10in'], // For label printers (width height)
      orientation: ['portrait'], // portrait, landscape, portrait-180, landscape-180
      printerType: ['usb', Validators.required],
      printerName: [''],
      printerAddress: [''],
      printerPort: [9100],
      showShopLogo: [true],
      showShopName: [true],
      showShopAddress: [true],
      showShopPhone: [true],
      showInvoiceNumber: [true],
      showDate: [true],
      showTime: [true],
      showCustomerInfo: [true],
      showSalesmanInfo: [true],
      showProductTable: [true],
      showTotals: [true],
      showPaymentInfo: [true],
      showQRCode: [true],
      qrCodeType: ['invoice'],
      qrCodeCustomText: [''],
      showBarcode: [true],
      barcodeType: ['invoice'],
      barcodeCustomText: [''],
      // Barcode Label Settings
      barcodeLabelShowProductName: [true],
      barcodeLabelShowVariationName: [true],
      barcodeLabelShowPrice: [true],
      barcodeLabelShowSkuAndVariant: [false],
      barcodeLabelUseSalePrice: [true],
      barcodeLabelShowBarcodeAndVariant: [false],
      barcodeLabelUseBarcodeOrSku: ['barcode'], // 'barcode' or 'sku'
      barcodeLabelShowShopName: [true],
      barcodeLabelShowBarcodeCode: [true],
      barcodeWidth: [2.5],
      barcodeHeight: [60],
      showReturnPolicy: [true],
      returnPolicyText: ['No returns or exchanges after purchase.'],
      showSignatureArea: [false],
      signatureLabel: ['Customer Signature'],
      footerText: ['Thank you for your business!'],
      printWithoutPreview: [false],
      copies: [1],
      autoPrint: [false],
      customCss: [''],
      headerText: [''],
      footerCustomText: ['']
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.printerSettingsService.getPrinterSettings().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.printerSettingsForm.patchValue(res.data);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading printer settings:', err);
        this.uiService.message('Failed to load printer settings', 'warn');
      }
    });
  }

  onSubmit(): void {
    if (this.printerSettingsForm.invalid) {
      this.uiService.message('Please fill all required fields', 'warn');
      return;
    }

    this.isLoading = true;
    this.printerSettingsService.updatePrinterSettings(this.printerSettingsForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.uiService.message('Printer settings updated successfully', 'success');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.uiService.message('Failed to update printer settings', 'wrong');
      }
    });
  }
}

