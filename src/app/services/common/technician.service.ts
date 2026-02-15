import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { VendorService } from '../vendor/vendor.service';

const API_TECHNICIAN = environment.apiBaseLink + '/api/technician/';

@Injectable({
    providedIn: 'root'
})
export class TechnicianService {

    constructor(
        private httpClient: HttpClient,
        private vendorService: VendorService
    ) { }

    private getShopId(): string | null {
        return this.vendorService.getShopId();
    }

    addTechnician(data: any) {
        let params = new HttpParams();
        const shopId = this.getShopId();
        if (shopId) {
            params = params.append('shop', shopId);
        }
        return this.httpClient.post<ResponsePayload>(API_TECHNICIAN + 'add', data, { params });
    }

    getAllTechniciansByShop(filterData: FilterData, searchQuery?: string) {
        let params = new HttpParams();
        const shopId = this.getShopId();
        if (shopId) {
            params = params.append('shop', shopId);
        }
        if (searchQuery) {
            params = params.append('q', searchQuery);
        }
        return this.httpClient.post<ResponsePayload>(API_TECHNICIAN + 'get-all-by-shop', filterData, { params });
    }

    getTechnicianById(id: string, select?: string) {
        let params = new HttpParams();
        if (select) {
            params = params.append('select', select);
        }
        return this.httpClient.get<ResponsePayload>(API_TECHNICIAN + id, { params });
    }

    updateTechnicianById(id: string, data: any) {
        return this.httpClient.put<ResponsePayload>(API_TECHNICIAN + 'update/' + id, data);
    }

    deleteTechnicianById(id: string) {
        return this.httpClient.delete<ResponsePayload>(API_TECHNICIAN + 'delete/' + id);
    }
}
