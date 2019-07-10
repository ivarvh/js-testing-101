import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

@Injectable()
export class CarService {

  private cars = [
    {brand: 'Ford', color: 'red'},
    {brand: 'Skoda', color: 'silver'},
    {brand: 'Cadillac', color: 'black'}
  ];

  getCars(): Array<Car> {
    return this.cars;
  }

  getCarsAsPromise(): Promise<Array<Car>> {
    return Promise.resolve(this.cars);
  }

  getCarsAsObservable(): Observable<Array<Car>> {
    return of(this.cars);
  }
}

export interface Car {
  brand: string;
  color: string;
}
