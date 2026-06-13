import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Asset } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  constructor(private api: ApiService) {}

  getAssets(): Observable<Asset[]> {
    return this.api.get<Asset[]>('/api/assets');
  }
}
