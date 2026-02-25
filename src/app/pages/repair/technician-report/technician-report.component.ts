import { Component, inject, OnInit } from '@angular/core';
import { RepairService } from '../../../services/common/repair.service';
import { UtilsService } from '../../../services/core/utils.service';
import { UiService } from '../../../services/core/ui.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-technician-report',
    templateUrl: './technician-report.component.html',
    styleUrls: ['./technician-report.component.scss']
})
export class TechnicianReportComponent implements OnInit {

    isLoading = false;
    reportData: any[] = [];

    dateRange = new FormGroup({
        start: new FormControl<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        end: new FormControl<Date | null>(new Date())
    });

    private readonly repairService = inject(RepairService);
    private readonly utilsService = inject(UtilsService);
    private readonly uiService = inject(UiService);

    ngOnInit(): void {
        this.getTechnicianReport();
    }

    getTechnicianReport() {
        if (!this.dateRange.value.start || !this.dateRange.value.end) {
            this.uiService.message('Please select a date range', 'warn');
            return;
        }

        this.isLoading = true;
        const startDate = this.utilsService.getDateString(this.dateRange.value.start);
        const endDate = this.utilsService.getDateString(this.utilsService.getEndOfDate(this.dateRange.value.end));

        this.repairService.getTechnicianReport(startDate, endDate)
            .subscribe({
                next: (res: any) => {
                    this.isLoading = false;
                    if (res.success) {
                        this.reportData = res.data;
                    }
                },
                error: (error) => {
                    this.isLoading = false;
                    console.error(error);
                    this.uiService.message('Failed to load report', 'warn');
                }
            });
    }

    onFilter() {
        this.getTechnicianReport();
    }

    getTotalServiceCharge() {
        return this.reportData.reduce((sum, item) => sum + (item.totalServiceCharge || 0), 0);
    }

    getTotalPartsAmount() {
        return this.reportData.reduce((sum, item) => sum + (item.totalPartsAmount || 0), 0);
    }

    getTotalAmount() {
        return this.reportData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    }

    getTotalRepairs() {
        return this.reportData.reduce((sum, item) => sum + (item.totalRepairs || 0), 0);
    }
}
