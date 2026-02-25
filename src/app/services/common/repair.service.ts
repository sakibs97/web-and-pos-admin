import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';

const API_REPAIR = environment.apiBaseLink + '/api/repair/';

@Injectable({
  providedIn: 'root'
})
export class RepairService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * HTTP METHODS
   * addRepair()
   * getAllRepair()
   * getRepairById()
   * updateRepairById()
   * deleteRepairById()
   * deleteMultipleRepairById()
   */

  addRepair(data: any) {
    return this.httpClient.post<ResponsePayload>(API_REPAIR + 'add', data);
  }

  getAllRepair(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{
      data: any[],
      count: number,
      success: boolean,
      calculation: any
    }>(API_REPAIR + 'get-all-by-shop/', filterData, { params });
  }

  getRepairById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: any, message: string, success: boolean }>(API_REPAIR + id, { params });
  }

  updateRepairById(id: string, data: any) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_REPAIR + 'update/' + id, data);
  }

  deleteRepairById(id: string, checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.delete<ResponsePayload>(API_REPAIR + 'delete/' + id, { params });
  }

  deleteMultipleRepairById(ids: string[], checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.post<ResponsePayload>(API_REPAIR + 'delete-multiple', { ids: ids }, { params });
  }

  updateMultipleRepairById(ids: string[], data: any) {
    const mData = { ...{ ids: ids }, ...data };
    // Shop parameter is typically handled by interceptor, but we can add it explicitly if needed
    let params = new HttpParams();
    // Note: Shop is usually added by HTTP interceptor from auth token
    return this.httpClient.put<ResponsePayload>(API_REPAIR + 'update-multiple', mData, { params });
  }

  getTechnicianReport(startDate: string, endDate: string) {
    let params = new HttpParams();
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    return this.httpClient.get<ResponsePayload>(API_REPAIR + 'report/technician', { params });
  }
}

