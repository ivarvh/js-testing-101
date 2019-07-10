import {Component} from '@angular/core';
import {Car, CarService} from './car.service';
import {Observable} from 'rxjs';
import {finalize, map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  loading = false;
  cars: Array<Car> = [];
  carRetrievalError = false;

  constructor(private carService: CarService) {
  }

  getAllRedCars(): Array<Car> {
    return this.carService.getCars().filter((car: Car) => car.color === 'red');
  }

  getAllBlackCars(): Array<Car> {
    return this.carService.getCars().filter((car: Car) => car.color === 'black');
  }

  async getAllRedCarsAsPromise(): Promise<Array<Car>> {
    const redCars = await this.carService.getCarsAsPromise();
    return redCars.filter((car: Car) => car.color === 'red');
  }

  async getAllRedCarsAsPromiseWithStuffHappeningInBetween(): Promise<void> {
    this.loading = true;
    console.log(this.cars);
    this.cars = await this.getAllRedCarsAsPromise();
    this.loading = false;
  }

  getAllRedCarsAsObservable(): Observable<Array<Car>> {
    return this.carService
      .getCarsAsObservable()
      .pipe(
        map((cars: Array<Car>) => cars.filter((car: Car) => car.color === 'red'))
      );
  }

  getAllRedCarsAsObservablewithStuffHappeningInBetween(): void {
    this.loading = true;

    this.getAllRedCarsAsObservable()
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe(
        (cars: Array<Car>) => this.cars = cars,
        () => this.carRetrievalError = true
      );
  }
}
