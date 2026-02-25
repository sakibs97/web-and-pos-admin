import { inject, Inject, Injectable } from '@angular/core';
import moment from 'moment';
import { DOCUMENT } from '@angular/common';
import { StorageService } from "./storage.service";
import { DATABASE_KEY } from "../../core/utils/global-variable";
import { PixelUserData } from "../../interfaces/core/analytics.interface";
import sha256 from 'crypto-js/sha256';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  userLocalSavedData: any;

  private readonly storageService = inject(StorageService);

  constructor(
    @Inject(DOCUMENT) private document: Document,

  ) {
  }

  checkObjectDeepEqual(obj1: any, obj2: any, ignoredField?: string): boolean {
    if (ignoredField) {
      if (obj1) {
        delete obj1[ignoredField];
      }
      if (obj2) {
        delete obj2[ignoredField];
      }
    }
    // If both are the same reference, they are equal
    if (obj1 === obj2) {
      return true;
    }

    // If either is null or not an object, they are not equal
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
      return false;
    }

    // Get the keys of both objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // If they don't have the same number of keys, they are not equal
    if (keys1.length !== keys2.length) {
      return false;
    }

    // Compare each key recursively
    for (let key of keys1) {
      if (!keys2.includes(key) || !this.checkObjectDeepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }

  removeUrlQuery(url: string): string {
    if (url) {
      return url.replace(/\?.*/, '');
    }
    return '';
  }
  /**
   * UTILS
   */

  getDateToDayAgo(date: Date) {
    return moment(date).fromNow();
  }

  getDateString(date: Date, format?: string): string {
    const fm = format ? format : 'YYYY-MM-DD';
    return moment(date).format(fm);
  }

  getEndOfDate(date: Date): Date {
    return moment(date).endOf('day').toDate();
  }

  getCurrentTime(): string {
    return moment(new Date()).format('hh:mm a');
  }
  getDateWithCurrentTime(date: Date): Date {
    const _ = moment();
    // const newDate = moment(date).add({hours: _.hour(), minutes:_.minute() , seconds:_.second()});
    const newDate = moment(date).add({ hours: _.hour(), minutes: _.minute() });
    return newDate.toDate();
  }

  getNextDateString(date: Date, day) {
    return moment(date).add(day, 'days').toDate();
  }


  getNextDateStringForProject(date: Date, day) {
    return moment(date).add(day, 'days').format('YYYY-MM-DD');
  }

  getDateMonth(fromZero: boolean, date?: any): number {
    let d;
    if (date) {
      d = new Date(date)
    } else {
      d = new Date();
    }
    const month = d.getMonth();
    return fromZero ? month : month + 1;
  }

  getDateYear(date?: Date): number {
    return date.getFullYear();
  }


  mergeUniqueImages(originalImages: string[], newImages: string[]) {
    const uniqueImages = new Set<string>(originalImages);
    newImages.forEach(image => {
      if (!uniqueImages.has(image)) {
        uniqueImages.add(image);
      }
    });
    return Array.from(uniqueImages);
  }

  /**
   * GET RANDOM NUMBER
   */
  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getImageName(originalName: string): string {
    const array = originalName.split('.');
    array.pop();
    return array.join('');
  }

  mergeArrayString(array1: string[], array2: string[]): string[] {
    const c = array1.concat(array2);
    return c.filter((item, pos) => c.indexOf(item) === pos);
  }

  /**
   * URL
   */

  getHostnameFromUrl(url: string): string {
    try {
      if (url) {
        const urlObject = new URL(url);
        const hostname = urlObject.hostname;
        if (hostname.startsWith('www.')) {
          return hostname.substring(4);
        }
        return urlObject.hostname;
      } else {
        return null
      }

    } catch (err) {
      return null;
    }

  }

  calculateDaysRemaining(deleteDateString: string): number {
    if (!deleteDateString) {
      throw new Error('deleteDateString is required.');
    }

    // Parse deleteDateString into a Date object
    const deleteDate = new Date(deleteDateString);

    // Get the current date without time (to ensure accurate comparison)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds
    const timeDifference = deleteDate.getTime() - currentDate.getTime();

    // Convert milliseconds to days
    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysRemaining;
  }
  /**
   * SEARCH
   */
  searchWithRegex = (collection: any[], term: string, opts: { caseSensitive: boolean, includedKeys: string[] }) => {
    const filterBy = () => {
      const searchTerms = (!opts.caseSensitive) ? new RegExp(term, 'i') : new RegExp(term)
      return (obj: any) => {
        for (const key of Object.keys(obj)) {
          if (searchTerms.test(obj[key]) &&
            opts.includedKeys.includes(key)) return true
        }
        return false
      }
    }
    return collection.filter(filterBy())
  }

  urlToRouter(url: string, removeHost?: boolean): string {
    const baseUrl = new URL(document.location.href).origin;
    const d = decodeURIComponent(url);
    const ru = d.replace(/\?.*/, '');
    let res;
    if (removeHost) {
      res = ru.replace(baseUrl, '');
    } else {
      res = ru;
    }
    return res;
  }

  extractPath(url: string): string {
    try {
      const urlObject = new URL(url);
      return urlObject.pathname;
    } catch (error) {
      if (!url.startsWith('/')) {
        url = '/' + url;
      }
      return url;
    }
  }


  roundNumber(num: number): number {
    const integer = Math.floor(num);
    const fractional = num - integer;

    //Converting the fractional to the integer
    const frac2int = (fractional * 100) / 5;
    const fracCeil = Math.ceil(frac2int);

    //transforming inter into fractional
    const FracOut = (fracCeil * 5) / 100;
    const ans = integer + FracOut;

    return Number((Math.round(ans * 100) / 100).toFixed(2));
  }

  // 🔹 Final user_data generator method
  getUserData(pixelUserData: PixelUserData): { em?: string; ph?: string } {
    const { email, phoneNo, firstName, lastName, gender, dob, city, zip, external_id } = pixelUserData;
    const userData: any = {};

    if (phoneNo) {
      const formattedPhone = this.formatPhoneNumber('88' + phoneNo);
      userData.ph = this.hashDataSha256(formattedPhone);
    } else {
      userData.ph = this.hashDataSha256('8801700000000');
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      userData.em = this.hashDataSha256(normalizedEmail);
    } else {
      userData.em = this.hashDataSha256('noemail@gmail.com');
    }

    if (city) {
      const normalizedCity = city.trim().toLowerCase();
      userData.ct = [this.hashDataSha256(normalizedCity)];
    } else {
      userData.ct = [this.hashDataSha256('global')];
    }

    userData.country = [this.hashDataSha256('bd')];
    userData.fn = [this.hashDataSha256(firstName ?? 'Mr')];
    userData.ln = [this.hashDataSha256(lastName ?? 'Unknown')];
    // userData.ge = this.hashDataSha256(gender ?? 'm');
    userData.st = [this.hashDataSha256('bd')];
    // userData.zp = this.hashDataSha256(zip ?? '1200');
    // userData.db = this.hashDataSha256(dob ?? '19970216');
    userData.external_id = [this.hashDataSha256(external_id ?? `${Date.now()}`)];

    return { ...userData, ...this.getFbCookies() };
  }


  generateEventId(): string {
    return Math.random().toString(36).substring(2, 15); // Generate unique event ID
  }
  formatPhoneNumber(phone: string): string {
    // Ensure phone is in E.164 format (e.g., +1234567890)
    return phone?.replace(/\D/g, ''); // Remove non-numeric characters
  }
  // Hashing method
  hashDataSha256(value: string): string {
    return sha256(value).toString();
  }


  getFbCookies(): { fbp?: string; fbc?: string } | {} {
    const cookies = Object.fromEntries(
      document.cookie.split(';').map(cookie => {
        const [key, ...valParts] = cookie.trim().split('=');
        return [key, valParts.join('=')];
      })
    );

    const result: { fbp?: string; fbc?: string } = {};
    if (cookies['_fbp']) result.fbp = cookies['_fbp'];
    if (cookies['_fbc']) result.fbc = cookies['_fbc'];

    return result;
  }


  /**
   * MERGE TWO SAME OBJECT ARRAY UNIQUE
   */

  mergeArrayUnique(array1: any[], array2: any[]): any[] {
    const array = array1.concat(array2);
    const a = array.concat();
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i]._id === a[j]._id) {
          a.splice(j--, 1);
        }
      }
    }
    return a;
  }

  /**
   * GROUP ARRAY BY FIELD
   */
  arrayGroupByField<T>(dataArray: T[], field: string, totalField?: string): any[] {
    const data = dataArray.reduce((group, product) => {
      const uniqueField = product[field];
      group[uniqueField] = group[uniqueField] ?? [];
      group[uniqueField].push(product);
      return group;
    }, {});

    const final = [];

    for (const key in data) {
      let obj;
      if (totalField) {
        const total = data[key].map((t: any) => t[totalField] ?? 0).reduce((acc: number, value: number) => acc + value, 0);
        obj = {
          _id: key,
          total: total,
          data: data[key]
        };
      } else {
        obj = {
          _id: key,
          data: data[key]
        };
      }
      final.push(obj);
    }
    return final as T[];
  }

  /**
   * Array Group By Field Complex Calculation
   */
  arrayGroupByFieldComplexCalc<T>(dataArray: T[], field: string, calculationFor: 'purchase_history' | 'sale_return' | 'damage_history' | 'sale' | 'pre_order' | 'sale-statement'): any[] {
    const data = dataArray.reduce((group, product) => {
      const uniqueField = product[field];
      group[uniqueField] = group[uniqueField] ?? [];
      group[uniqueField].push(product);
      return group;
    }, {});

    const final = [];

    for (const key in data) {
      let obj;

      switch (calculationFor) {
        case 'sale': {
          const total = data[key].map(t => t['total'] ?? 0).reduce((acc, value) => acc + value, 0);
          const subTotal = data[key].map(t => t['subTotal'] ?? 0).reduce((acc, value) => acc + value, 0);
          const discount = data[key].map(t => t['discount'] ?? 0).reduce((acc, value) => acc + value, 0);
          const vat = data[key].map(t => t['vatAmount'] ?? 0).reduce((acc, value) => acc + value, 0);
          obj = {
            _id: key,
            total: total,
            subTotal: subTotal,
            discount: discount,
            vat: vat,
            data: data[key]
          };
          break;
        }
        default: {
          obj = {
            _id: key,
            data: data[key]
          };
          break;
        }
      }
      final.push(obj);
    }
    return final;
  }

  /**
   * Get Product Name
   */
  getProductName(data: any): string {
    if (!data) return '';
    let name = data.name || '';
    if (data.colors) {
      name += ` - ${data.colors?.name || data.colors}`;
    }
    if (data.sizes) {
      name += ` - ${data.sizes?.name || data.sizes}`;
    }
    if (data.model) {
      name += ` - ${data.model}`;
    }
    if (data.others) {
      name += ` - ${data.others}`;
    }
    if (data.sku) {
      name += ` - (${data.sku})`;
    }
    if (!name && typeof data === 'string') {
      return data;
    }
    return name || 'Product';
  }

  // getDateYear(date?: Date): number {
  //   if (!date) {
  //     date = new Date();
  //   }
  //   return date.getFullYear();
  // }

}
