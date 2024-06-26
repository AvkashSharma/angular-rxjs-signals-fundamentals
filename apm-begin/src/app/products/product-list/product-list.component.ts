import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { EMPTY, Subscription, catchError, tap } from 'rxjs';

@Component({
    selector: 'pm-product-list',
    templateUrl: './product-list.component.html',
    standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, NgClass, ProductDetailComponent]
})
export class ProductListComponent {
  pageTitle = 'Products';
  sub!: Subscription;

  private productService = inject(ProductService);

  // Products
  products = this.productService.products;
  errorMessage = this.productService.productsError;

  // Selected product id to highlight the entry
  //readonly selectedProductId$ = this.productService.productSelected$;
  selectedProductId = this.productService.selectedProductId;
  
  onSelected(productId: number): void {
    this.productService.productSelected(productId);
  }
}
