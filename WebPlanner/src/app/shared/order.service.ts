import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PriceList, PriceListInfo } from '../planner/estimate';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { FileItem } from './files.service';
import { UserInfo } from './account.service';

export interface ClientInfo {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  params?: any;
}

export interface OrderInfo {
  id: number;
  status: string;
  client?: ClientInfo
  params?: any;
}

export interface OrderItem extends FileItem {
  shopId?: number;
  order?: OrderInfo;
  client?: ClientInfo;
}

export interface FileOrderItem extends FileItem {
  status: string;
  client?: ClientInfo;
  params?: any;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  // -1 for all prices [my prices + shared system prices for non-admin users]
  // -2 for all prices owned by users
  // 0 - all system prices
  getPrices(user: number): Observable<PriceListInfo[]> {
    return this.http.get<PriceListInfo[]>('/api/firm/pricelists', { params: { user: `${user}` } });
  }

  addPrice(name: string): Observable<number> {
    return this.http
      .post(`/api/firm/pricelist`, { name })
      .pipe(map(r => Number(r)));
  }

  getPrice(id: number): Observable<PriceList> {
    return this.http
      .get<any>(`/api/firm/pricelist/${id}`)
      .pipe(map(info => new PriceList(info)));
  }

  getActivePrice(data = true, user?: number): Observable<PriceList | undefined> {
    let params = new HttpParams();
    params = params.set('data', `${data}`);
    if (user) {
      params = params.set('user', `${user}`);
    }
    return this.http
      .get<PriceListInfo>(`/api/firm/activepricelist`, { params })
      .pipe(map(data => data ? new PriceList(data) : undefined));
  }

  setActivePrice(price: PriceListInfo, userId?: number) {
    let params = userId ? { userId: userId.toString() } : undefined;
    return this.http.post<PriceListInfo>(`/api/firm/activepricelist`, price, { params });
  }

  savePrice(price: PriceList): Observable<any> {
    let data = {
      name: price.name,
      ownerId: price.ownerId,
      externalId: price.externalId,
      data: price.saveItems(),
      shared: price.shared,
      recordCount: price.itemCount
    };
    if (price.shared === '!') {
      data.shared = undefined;
    }
    let url = '/api/firm/pricelist';
    if (price.id) {
      url += '/' + price.id;
    }
    return this.http.post(url, data);
  }

  removePrice(id: number): Observable<any> {
    return this.http.delete(`/api/firm/pricelist/${id}`);
  }

  getOrders(view?: string, max: number = 0, skip = 0, search = '', date = '', user = 0) {
    let params = {
      view,
      max: max.toString(),
      skip: skip.toString(),
      search,
      date,
      user: user.toString()
    };
    return this.http.get<OrderItem[]>(`/api/order`, { params });
  }

  getUserOrders(user: number, max: number = 0) {
    let params = {
      user: user.toString(),
      max: max.toString()
    };
    return this.http.get<OrderItem[]>(`/api/order`, { params });
  }

  getShops() {
    return this.http.get<UserInfo[]>(`/api/order/shops`);
  }

  private normalizeOrder<T extends OrderInfo | FileOrderItem>(order?: T): T {
    if (order) {
      if (typeof order.params === 'string') {
        order.params = JSON.parse(order.params);
      } else {
        order.params = {};
      }
      order.params = order.params || {};
      if (order.client) {
        if (typeof order.client.params === 'string') {
          order.client.params = JSON.parse(order.client.params);
        } else {
          order.client.params = {};
        }
        order.client.params = order.client.params || {};
      }
    }
    return order;
  }

  getOrder(id: number, token?: string) {
    let params = new HttpParams();
    if (token) {
      params = params.set('token', token);
    }
    return this.http.get<OrderInfo>(`/api/order/${id}`, { params })
      .pipe(map(order => this.normalizeOrder(order)));
  }

  getFileOrder(id: number, token?: string) {
    let params = new HttpParams();
    if (token) {
      params = params.set('token', token);
    }
    return this.http.get<FileOrderItem>(`/api/order/${id}/fileandorder`, { params })
      .pipe(map(order => this.normalizeOrder(order)));
  }

  setOrder(id: number, order: OrderInfo) {
    let data = {...order};
    data.params = JSON.stringify(data.params);
    if (data.client) {
      data.client = {
        ...data.client,
        params: JSON.stringify(data.client.params || {})
      };
    }
    return this.http.post<OrderInfo>(`/api/order/${id}`, data);
  }

  processOrder(id: number, data: { price: number }) {
    return this.http.post<OrderInfo>(`/api/order/${id}/process`, data);
  }
}
