import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReportsService } from '../../../../../services/common/reports.service';
import { UiService } from '../../../../../services/core/ui.service';
import { ExportPrintService } from '../../../../../services/core/export-print.service';

@Component({
  selector: 'app-stock-value-report',
  templateUrl: './stock-value-report.component.html',
  styleUrls: ['./stock-value-report.component.scss'],
  providers: [DatePipe]
})
export class StockValueReportComponent implements OnInit {
  isLoading: boolean = true;
  stockData: any;
  originalStockData: any;
  searchTerm: string = '';

  constructor(
    private reportsService: ReportsService,
    private uiService: UiService,
    private exportPrintService: ExportPrintService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport() {
    this.isLoading = true;
    this.reportsService.getStockValueReport()
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.originalStockData = JSON.parse(JSON.stringify(res.data));
            this.stockData = res.data;
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading stock value report:', err);
          this.uiService.message('Failed to load report', 'warn');
        }
      });
  }

  exportCSV() {
    if (!this.stockData) {
      this.uiService.message('No data to export', 'warn');
      return;
    }

    const csvData = this.prepareStockValueData();
    const headers = ['Category', 'Total Quantity', 'Total Stock Value', 'Product Count'];
    
    this.exportPrintService.exportCSV(csvData, 'Stock_Value_Report', headers);
    this.uiService.message('CSV exported successfully', 'success');
  }

  exportExcel() {
    if (!this.stockData) {
      this.uiService.message('No data to export', 'warn');
      return;
    }

    const excelData = this.prepareStockValueData();
    const headers = ['Category', 'Total Quantity', 'Total Stock Value', 'Product Count'];
    
    this.exportPrintService.exportExcel(excelData, 'Stock_Value_Report', 'Stock Value Report', headers);
    this.uiService.message('Excel exported successfully', 'success');
  }

  exportPDF() {
    if (!this.stockData) {
      this.uiService.message('No data to export', 'warn');
      return;
    }

    const htmlContent = this.generateStockValueHTML();
    this.exportPrintService.exportPDF(htmlContent, 'Stock_Value_Report');
    this.uiService.message('PDF exported successfully', 'success');
  }

  printReport() {
    if (!this.stockData) {
      this.uiService.message('No data to print', 'warn');
      return;
    }

    const htmlContent = this.generateStockValueHTML();
    this.exportPrintService.printReport(htmlContent, 'Stock Value Report');
  }

  showColumnsInfo() {
    this.uiService.message('Column visibility is not applicable for Stock Value Report', 'warn');
  }

  onSearchChange() {
    if (!this.originalStockData) {
      return;
    }

    const searchLower = this.searchTerm.toLowerCase().trim();

    if (!searchLower) {
      this.stockData = JSON.parse(JSON.stringify(this.originalStockData));
      return;
    }

    // Filter products
    let filteredProducts = [];
    if (this.originalStockData.products && this.originalStockData.products.length > 0) {
      filteredProducts = this.originalStockData.products.filter((product: any) => {
        const productName = (product.productName || '').toLowerCase();
        const sku = (product.sku || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        return productName.includes(searchLower) || 
               sku.includes(searchLower) || 
               category.includes(searchLower);
      });
    }

    // Filter category summary based on filtered products
    let filteredCategorySummary = [];
    if (this.originalStockData.categorySummary && this.originalStockData.categorySummary.length > 0) {
      const categoryMap = new Map();
      
      // Group filtered products by category
      filteredProducts.forEach((product: any) => {
        const categoryName = product.category || 'N/A';
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            categoryName: categoryName,
            totalQuantity: 0,
            totalStockValue: 0,
            productCount: 0
          });
        }
        const cat = categoryMap.get(categoryName);
        cat.totalQuantity += product.quantity || 0;
        cat.totalStockValue += product.stockValue || 0;
        cat.productCount += 1;
      });

      // Also include categories that match search term directly
      this.originalStockData.categorySummary.forEach((cat: any) => {
        const categoryName = (cat.categoryName || '').toLowerCase();
        if (categoryName.includes(searchLower) && !categoryMap.has(cat.categoryName)) {
          categoryMap.set(cat.categoryName, { ...cat });
        }
      });

      filteredCategorySummary = Array.from(categoryMap.values());
    }

    // Update stockData with filtered results
    this.stockData = {
      ...this.originalStockData,
      products: filteredProducts,
      categorySummary: filteredCategorySummary,
      summary: this.originalStockData.summary // Keep original summary
    };
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearchChange();
  }

  private prepareStockValueData(): any[] {
    const data: any[] = [];
    
    if (this.stockData?.summary) {
      data.push({ Category: 'SUMMARY', 'Total Quantity': this.stockData.summary.totalQuantity || 0, 'Total Stock Value': (this.stockData.summary.totalStockValue || 0).toFixed(2), 'Product Count': this.stockData.summary.totalProducts || 0 });
      data.push({ Category: '', 'Total Quantity': '', 'Total Stock Value': '', 'Product Count': '' });
    }

    if (this.stockData?.categorySummary && this.stockData.categorySummary.length > 0) {
      this.stockData.categorySummary.forEach((cat: any) => {
        data.push({ 
          Category: cat.categoryName || 'N/A', 
          'Total Quantity': cat.totalQuantity || 0, 
          'Total Stock Value': (cat.totalStockValue || 0).toFixed(2), 
          'Product Count': cat.productCount || 0 
        });
      });
    }

    return data;
  }

  private generateStockValueHTML(): string {
    const sd = this.stockData;

    let html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="text-align: center; color: #2196f3; margin-bottom: 30px;">Stock Value Report</h1>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 30px;">
          <div style="padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: white; font-size: 14px;">Total Stock Value</h3>
            <p style="margin: 0; font-size: 24px; font-weight: 700;">${(sd.summary?.totalStockValue || 0).toFixed(2)}</p>
          </div>
          <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Total Quantity</h3>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #2196f3;">${sd.summary?.totalQuantity || 0}</p>
          </div>
          <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Total Products</h3>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #2196f3;">${sd.summary?.totalProducts || 0}</p>
          </div>
        </div>
    `;

    if (sd.categorySummary && sd.categorySummary.length > 0) {
      html += `
        <div style="margin-top: 30px;">
          <h3 style="color: #333; margin-bottom: 15px;">Category Wise Summary</h3>
          <table style="width: 100%; border-collapse: collapse; background: #f9f9f9; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="padding: 12px; text-align: left; font-weight: 600;">Category</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Total Quantity</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Total Stock Value</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Product Count</th>
              </tr>
            </thead>
            <tbody>
              ${sd.categorySummary.map((cat: any) => `
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0;">${cat.categoryName || 'N/A'}</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${cat.totalQuantity || 0}</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 600;">${(cat.totalStockValue || 0).toFixed(2)}</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${cat.productCount || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }
}

