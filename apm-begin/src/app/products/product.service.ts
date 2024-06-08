import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/productss';


  private http = inject(HttpClient);
  private errorService = inject(HttpErrorResponse);

  // For the constructor to treat this parameters as part of dependency injection 
  // add accessability keyword at the beginning
  // constructor(private http: HttpClient)
  // {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(() => console.log('In http.get pipeline')),
      catchError(err => 
        {
          console.error(err)
          return of(ProductData.products);
        })
    )
  }

  getProduct(id: number) {
    const productUrl = this.productsUrl + '/' +id;
    return this.http.get<Product>(productUrl)
    .pipe(
      tap(() => console.log('In http.get by id pipeline'))
    )

  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    return throwError()
  }

}
