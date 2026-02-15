import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SaleService } from '../../../../services/common/sale.service';
import { Sale } from '../../../../interfaces/common/sale.interface';
import { UiService } from '../../../../services/core/ui.service';
import { ShopInformation } from '../../../../interfaces/common/shop-information.interface';
import { ShopInformationService } from '../../../../services/common/shop-information.service';
import { UtilsService } from '../../../../services/core/utils.service';
import { PrinterSettingsService } from '../../../../services/common/printer-settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reprint-bill',
  templateUrl: './reprint-bill.component.html',
  styleUrls: ['./reprint-bill.component.scss']
})
export class ReprintBillComponent implements OnInit {
  isLoading: boolean = false;
  recentSales: Sale[] = [];
  shopInformation: ShopInformation;
  printerSettings: any = null;
  private subDataOne: Subscription;
  private subShopInfo: Subscription;
  private subPrinterSettings: Subscription;

  constructor(
    public dialogRef: MatDialogRef<ReprintBillComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private saleService: SaleService,
    private uiService: UiService,
    private shopInformationService: ShopInformationService,
    private printerSettingsService: PrinterSettingsService,
    public utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.getLast10Sales();
    this.getShopInformation();
    this.loadPrinterSettings();
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

  private getLast10Sales() {
    this.isLoading = true;
    const filter: any = {
      filter: {
        status: 'Sale'
      },
      pagination: { pageSize: 10, currentPage: 1 },
      select: {
        invoiceNo: 1,
        customer: 1,
        products: 1,
        salesman: 1,
        soldDate: 1,
        soldDateString: 1,
        soldTime: 1,
        total: 1,
        subTotal: 1,
        discount: 1,
        vatAmount: 1,
        tax: 1,
        ait: 1,
        serviceCharge: 1,
        paymentType: 1,
        receivedFromCustomer: 1,
      },
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.saleService.getAllSale(filter, null)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.recentSales = res.data || [];
          } else {
            this.uiService.message('Failed to load recent sales', 'warn');
            this.recentSales = [];
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading recent sales:', err);
          this.recentSales = [];
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

  printInvoice(sale: Sale) {
    try {
      if (!sale || !sale.invoiceNo) {
        this.uiService.message('Sale data not available for printing', 'warn');
        return;
      }

      const printContent = this.generatePrintContent(sale);

      if (!printContent || printContent.includes('Error:')) {
        this.uiService.message('Failed to generate invoice content', 'warn');
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
        this.uiService.message('Please allow popups to print invoice', 'warn');
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
      this.uiService.message('Failed to open invoice for printing', 'warn');
    }
  }

  private generatePrintContent(sale: Sale): string {
    const shopInfo: any = this.shopInformation;
    const settings = this.printerSettings || {};
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
    const invoiceNo = sale?.invoiceNo || 'N/A';
    const saleDate = this.utilsService.getDateString(sale?.soldDate || new Date());
    const saleTime = sale?.soldTime || '';
    const customerName = sale?.customer?.name || '';
    const customerPhone = sale?.customer?.phone || '';
    const salesmanName = sale?.salesman?.name || 'N/A';

    // Paper size
    const paperSize = settings.paperSize || '58mm';
    const paperWidth = paperSize === '80mm' ? '80mm' : '58mm';
    const customCss = settings.customCss || '';

    let productsRows = '';
    if (sale?.products && sale.products.length > 0) {
      productsRows = sale.products.map(p => {
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

    const subTotal = (sale?.subTotal || 0).toFixed(2);
    const discount = (sale?.discount || 0).toFixed(2);
    const tax = (sale?.tax || 0).toFixed(2);
    const vatAmount = (sale?.vatAmount || 0).toFixed(2);
    const ait = (sale?.ait || 0).toFixed(2);
    const serviceCharge = (sale?.serviceCharge || 0).toFixed(2);
    const grandTotal = (sale?.total || 0).toFixed(2);
    const received = (sale?.receivedFromCustomer || sale?.total || 0).toFixed(2);
    const change = sale?.receivedFromCustomer && sale?.receivedFromCustomer > sale?.total
      ? (sale.receivedFromCustomer - sale.total).toFixed(2)
      : '0.00';

    return `<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${invoiceNo}</title>
  <style>
    @media print {
      @page { margin: 5mm; size: ${paperWidth}; }
      body { margin: 0; }
    }
    body {
      font-family: Arial, sans-serif;
      padding: ${paperSize === '80mm' ? '15px' : '10px'};
      max-width: ${paperWidth};
      margin: 0 auto;
      font-size: ${paperSize === '80mm' ? '14px' : '12px'};
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
      display: ${settings.showShopLogo && shopInfo?.logo ? 'block' : 'none'};
    }
    .shop-name {
      font-size: ${paperSize === '80mm' ? '20px' : '18px'};
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
      font-size: ${paperSize === '80mm' ? '13px' : '11px'};
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
      font-size: ${paperSize === '80mm' ? '12px' : '10px'};
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
      width: ${paperSize === '80mm' ? '120px' : '100px'};
      font-weight: bold;
      text-align: left;
    }
    .total-value {
      width: ${paperSize === '80mm' ? '100px' : '80px'};
      text-align: right;
    }
    .grand-total {
      font-size: ${paperSize === '80mm' ? '16px' : '14px'};
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
<body>
  ${(settings.showShopName !== false || settings.showShopAddress !== false || settings.showShopPhone !== false) ? `
  <div class="header">
    ${settings.showShopLogo && shopInfo?.logo ? `<img src="${shopInfo.logo}" alt="Logo" class="shop-logo">` : ''}
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
    ${(sale?.discount || 0) > 0 ? `
    <div class="total-row">
      <div class="total-label">Discount:</div>
      <div class="total-value">-${currencySymbol}${discount}</div>
    </div>
    ` : ''}
    ${(sale?.tax || 0) > 0 ? `
    <div class="total-row">
      <div class="total-label">Tax:</div>
      <div class="total-value">${currencySymbol}${tax}</div>
    </div>
    ` : ''}
    ${(sale?.vatAmount || 0) > 0 ? `
    <div class="total-row">
      <div class="total-label">VAT:</div>
      <div class="total-value">${currencySymbol}${vatAmount}</div>
    </div>
    ` : ''}
    ${(sale?.ait || 0) > 0 ? `
    <div class="total-row">
      <div class="total-label">AIT:</div>
      <div class="total-value">${currencySymbol}${ait}</div>
    </div>
    ` : ''}
    ${(sale?.serviceCharge || 0) > 0 ? `
    <div class="total-row">
      <div class="total-label">Service Charge:</div>
      <div class="total-value">${currencySymbol}${serviceCharge}</div>
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
    <div><strong>Received:</strong> ${currencySymbol}${received}</div>
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
</body>
</html>`;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    if (this.subDataOne) {
      this.subDataOne.unsubscribe();
    }
    if (this.subShopInfo) {
      this.subShopInfo.unsubscribe();
    }
    if (this.subPrinterSettings) {
      this.subPrinterSettings.unsubscribe();
    }
  }
}


