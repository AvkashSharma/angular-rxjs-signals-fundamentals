import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, filter, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product, Result } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';


  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  // private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  // readonly productSelected$ = this.productSelectedSubject.asObservable();

  selectedProductId = signal<number | undefined>(undefined);

  // For the constructor to treat this parameters as part of dependency injection 
  // add accessability keyword at the beginning
  // constructor(private http: HttpClient)
  // {}

  private productsResults$ = this.http.get<Product[]>(this.productsUrl)
  .pipe(
    map(p => ({data: p} as Result<Product[]>)),
    tap((p) => console.log(JSON.stringify(p))),
    shareReplay(1),
    catchError(err => of({
      data: [], 
      error: this.errorService.formatError(err)
    } as Result<Product[]>))
  );

  private productsResult = toSignal(this.productsResults$, 
    { initialValue: ({data: []} as Result<Product[]>) });
    
    products = computed(() => this.productsResult().data);
    productsError = computed(() => this.productsResult(). error);

  // products = computed(() => {
  //   try {
  //     return toSignal(this.products$, {initialValue: [] as Product[] })();
  //   }
  //   catch(error)
  //   {
  //     return [] as Product[];
  //   }
  // })


  // readonly product$ = this.productSelected$
  // .pipe(
  //   filter(Boolean),
  //   switchMap(id => {
  //     const productUrl = this.productsUrl + '/' +id;
  //     return this.http.get<Product>(productUrl)
  //       .pipe(
  //         switchMap(product => this.getProductWithReviews(product)),
  //         catchError(err => this.handleError(err))
  //     );
  //   })
  // );

   private productResult$ = toObservable(this.selectedProductId)
  .pipe(
    filter(Boolean),
    switchMap(id => {
      const productUrl = this.productsUrl + '/' +id;
      return this.http.get<Product>(productUrl)
        .pipe(
          switchMap(product => this.getProductWithReviews(product)),
          catchError(err => of({
            data: undefined,
            error: this.errorService.formatError(err)
          } as Result<Product>))
      );
    }),
    map(p => ({data: p} as Result<Product>))
  );

  private productResult = toSignal(this.productResult$);
  product = computed(() => this.productResult()?.data);
  productError = computed(() => this.productResult()?.error);


  // product$ = combineLatest([
  //   this.productSelected$,
  //   this.products$
  // ]).pipe(
  //   map(([selectedProductId, products]) => 
  //     products.find(product => product.id === selectedProductId)
  //   ),
  //   filter(Boolean),
  //   switchMap(product => this.getProductWithReviews(product)),
  //   catchError(err => this.handleError(err))
  // );

  
  productSelected(selectedProductId: number): void {
    //this.productSelectedSubject.next(selectedProductId);
    this.selectedProductId.set(selectedProductId);
  }

  private getProductWithReviews(product: Product): Observable<Product> {
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
