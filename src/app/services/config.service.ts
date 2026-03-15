import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public readonly API_BASE_URL: string;

  constructor() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.API_BASE_URL = 'https://sql-poco-dffpbpdncbdmd0f3.centralus-01.azurewebsites.net/';
    } else {
      this.API_BASE_URL = 'https://sql-poco-dffpbpdncbdmd0f3.centralus-01.azurewebsites.net/';
    }
  }
}
