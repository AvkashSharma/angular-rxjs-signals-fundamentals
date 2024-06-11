import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';


  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  // For the constructor to treat this parameters as part of dependency injection 
  // add accessability keyword at the beginning
  // constructor(private http: HttpClient)
  // {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(() => console.log('In http.get pipeline')),
      catchError(err => this.handleError(err))
    );
  }

  getProduct(id: number) {
    const productUrl = this.productsUrl + '/' +id;
    return this.http.get<Product>(productUrl)
    .pipe(
      tap(() => console.log('In http.get by id pipeline')),
      catchError(err => this.handleError(err))
    )
  }

  private getProductWithReview(product: Product): Observable<Product> {
    if(product.hasReviews) {
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
      .pipe(
        map(reviews => ({...product, reviews} as Product))
      )
    } else {
      return of(product);
    }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
     return throwError(() => formattedMessage);
    // throw formattedMessage;
  }

}
