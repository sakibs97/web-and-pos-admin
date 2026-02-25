import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReportsService } from '../../../../../services/common/reports.service';
import { UiService } from '../../../../../services/core/ui.service';
import { ExportPrintService } from '../../../../../services/core/export-print.service';

@Component({
  selector: 'app-daily-sale-report',
  templateUrl: './daily-sale-report.component.html',
  styleUrls: ['./daily-sale-report.component.scss'],
  providers: [DatePipe]
})
export class DailySaleReportComponent implements OnInit {
  isLoading: boolean = true;
  reportData: any;
  selectedDate: Date = new Date();

  constructor(
    private reportsService: ReportsService,
    private uiService: UiService,
    private exportPrintService: ExportPrintService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport() {
    this.isLoading = true;
    const dateStr = this.datePipe.transform(this.selectedDate, 'YYYY-MM-dd');
    this.reportsService.getDailySaleReport(dateStr)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.reportData = res.data;
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading daily sale report:', err);
          this.uiService.message('Failed to load report', 'warn');
        }
      });
  }

  onDateChange() {
    this.loadReport();
  }

  exportCSV() {
    if (!this.reportData) {
      this.uiService.message('No data to export', 'warn');
      return;
    }

    const csvData = this.prepareDailySaleData();
    const headers = ['Item', 'Value'];

    this.exportPrintService.exportCSV(csvData, 'Daily_Sale_Report', headers);
    this.uiService.message('CSV exported successfully', 'success');
  }

  exportExcel() {
    if (!this.reportData) {
      this.uiService.message('No data to export', 'warn');
      return;
    }

    const excelData = this.prepareDailySaleData();
    const headers = ['Item', 'Value'];

    this.exportPrintService.exportExcel(excelData, 'Daily_Sale_Report', 'Daily Sale Report', headers);
    this.uiService.message('Excel exported successfully', 'success');
  }

  exportPDF() {
    if (!this.reportData) {
      this.uiService.message('No data to export', 'warn');
      return;
    }

    const htmlContent = this.generateDailySaleHTML();
    this.exportPrintService.exportPDF(htmlContent, 'Daily_Sale_Report');
    this.uiService.message('PDF exported successfully', 'success');
  }

  printReport() {
    if (!this.reportData) {
      this.uiService.message('No data to print', 'warn');
      return;
    }

    const htmlContent = this.generateDailySaleHTML();
    this.exportPrintService.printReport(htmlContent, 'Daily Sale Report');
  }

  showColumnsInfo() {
    this.uiService.message('Column visibility is not applicable for Daily Sale Report', 'warn');
  }

  private prepareDailySaleData(): any[] {
    const data: any[] = [];
    const rd = this.reportData;

    data.push({ Item: 'Total Sales', Value: (rd.summary?.totalSales || 0).toFixed(2) });
    data.push({ Item: 'Total Transactions', Value: (rd.summary?.totalTransactions || 0) });
    data.push({ Item: 'Total Paid', Value: (rd.summary?.totalPaid || 0).toFixed(2) });
    data.push({ Item: 'Total Due', Value: (rd.summary?.totalDue || 0).toFixed(2) });
    data.push({ Item: 'Cash Sales', Value: (rd.summary?.cashSales || 0).toFixed(2) });
    data.push({ Item: 'Card Sales', Value: (rd.summary?.cardSales || 0).toFixed(2) });
    data.push({ Item: 'Total Discount', Value: (rd.summary?.totalDiscount || 0).toFixed(2) });
    data.push({ Item: 'Total VAT', Value: (rd.summary?.totalVat || 0).toFixed(2) });
    data.push({ Item: 'Repair Amount', Value: (rd.summary?.totalRepairAmount || 0).toFixed(2) });

    if (rd.hourlyBreakdown && rd.hourlyBreakdown.length > 0) {
      data.push({ Item: '', Value: '' });
      data.push({ Item: 'Hourly Breakdown', Value: '' });
      rd.hourlyBreakdown.forEach((hour: any) => {
        data.push({ Item: `${hour._id}:00 - ${hour._id + 1}:00`, Value: `Sales: ${(hour.sales || 0).toFixed(2)}, Transactions: ${hour.count || 0}` });
      });
    }

    return data;
  }

  private generateDailySaleHTML(): string {
    const rd = this.reportData;
    const dateStr = this.datePipe.transform(this.selectedDate, 'longDate') || '';

    let html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="text-align: center; color: #2196f3; margin-bottom: 10px;">Daily Sale Report</h1>
        <div style="text-align: center; color: #666; margin-bottom: 30px;">${dateStr}</div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
          <div style="padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: white; font-size: 14px;">Total Sales</h4>
            <p style="margin: 0; font-size: 24px; font-weight: 700;">${(rd.summary?.totalSales || 0).toFixed(2)}</p>
          </div>
          <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Total Transactions</h4>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #2196f3;">${rd.summary?.totalTransactions || 0}</p>
          </div>
          <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Total Paid</h4>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #4caf50;">${(rd.summary?.totalPaid || 0).toFixed(2)}</p>
          </div>
          <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Total Due</h4>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #d32f2f;">${(rd.summary?.totalDue || 0).toFixed(2)}</p>
          </div>
          <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Cash Sales</h4>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #2196f3;">${(rd.summary?.cashSales || 0).toFixed(2)}</p>
          </div>
          <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Card Sales</h4>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #2196f3;">${(rd.summary?.cardSales || 0).toFixed(2)}</p>
          </div>
          <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Total Discount</h4>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #ff9800;">${(rd.summary?.totalDiscount || 0).toFixed(2)}</p>
          </div>
          <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Total VAT</h4>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #2196f3;">${(rd.summary?.totalVat || 0).toFixed(2)}</p>
          </div>
          <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Repair Amount</h4>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #2196f3;">${(rd.summary?.totalRepairAmount || 0).toFixed(2)}</p>
          </div>
        </div>
    `;

    if (rd.hourlyBreakdown && rd.hourlyBreakdown.length > 0) {
      html += `
        <div style="margin-top: 30px;">
          <h3 style="color: #333; margin-bottom: 15px;">Hourly Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse; background: #f9f9f9; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="padding: 12px; text-align: left; font-weight: 600;">Hour</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Sales</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Transactions</th>
              </tr>
            </thead>
            <tbody>
              ${rd.hourlyBreakdown.map((hour: any) => `
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0;">${hour._id}:00 - ${hour._id + 1}:00</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 600;">${(hour.sales || 0).toFixed(2)}</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${hour.count || 0}</td>
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

