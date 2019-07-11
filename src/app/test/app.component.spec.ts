import { AppComponent } from '../app.component';
import { Car, CarService } from '../car.service';
import { instance, mock, verify, when } from 'ts-mockito';
import { of } from 'rxjs/internal/observable/of';
import { Subject } from 'rxjs/internal/Subject';

describe('AppComponent', () => {

  const aBrownCar = {color: 'brown', brand: 'Ford'};
  const aRedFerrari = {color: 'red', brand: 'Ferrari'};
  const aRedPorsche = {color: 'red', brand: 'Porsche'};
  const aBlackCadillac = {color: 'black', brand: 'Cadillac'};

  let carService: CarService;

  let componentUnderTest: AppComponent;

  beforeEach(() => {
    carService = mock(CarService);

    componentUnderTest = new AppComponent(
      instance(carService)
    );
  });

  // Regular tests

  describe('getAllRedCars', () => {
    it('should only return the cars where the color is red', () => {
      when(carService.getCars()).thenReturn([aBrownCar, aRedFerrari, aRedPorsche, aBlackCadillac]);

      const actual = componentUnderTest.getAllRedCars();

      expect(actual).toEqual([aRedFerrari, aRedPorsche]);
      verify(carService.getCars()).once();
    });
  });

  describe('getAllBlackCars', () => {
    it('should only return the cars where the color is black', () => {
      when(carService.getCars()).thenReturn([aBrownCar, aRedFerrari, aRedPorsche, aBlackCadillac]);

      const actual = componentUnderTest.getAllBlackCars();

      expect(actual).toEqual([aBlackCadillac]);
      verify(carService.getCars()).once();
    });
  });

  // Promise tests

  describe('getAllRedCarsAsPromise', () => {

    it('should get the cars where the color is red', async done => {
      when(carService.getCarsAsPromise()).thenReturn(Promise.resolve([aRedPorsche, aBlackCadillac, aBrownCar]));

      try {
        const actual = await componentUnderTest.getAllRedCarsAsPromise();

        expect(actual).toEqual([aRedPorsche]);
      } catch (e) {
        fail(e);
      } finally {
        done();
      }
    });

    it('should set retrievalError to true if the promise is rejected', async done => {
      when(carService.getCarsAsPromise()).thenReturn(Promise.reject());

      try {
        await componentUnderTest.getAllRedCarsAsPromise();

        fail('Call should not have succeeded');
      } catch (e) {
        // nothing to expect here
      } finally {
        done();
      }
    });
  });

  describe('getAllRedCarsAsPromiseWithStuffHappeningInBetween', () => {

    it('should set all the red cars to the cars field and set loading field correctly', async done => {
      let promiseResolve: (cars: Array<Car>) => void;
      when(carService.getCarsAsPromise()).thenReturn(new Promise(resolve => {
        promiseResolve = resolve.bind(this);
      }));

      componentUnderTest.getAllRedCarsAsPromiseWithStuffHappeningInBetween();

      expect(componentUnderTest.loading).toBeTruthy();

      promiseResolve([aBlackCadillac, aRedPorsche]);

      setTimeout(() => {
        expect(componentUnderTest.cars).toEqual([aRedPorsche]);
        expect(componentUnderTest.loading).toBeFalsy();
        done();
      });
    });

    it('should set the retrievalError to true and loading states correctly if the promise is rejected', async done => {
      let promiseReject: (cars: Array<Car>) => void;
      when(carService.getCarsAsPromise()).thenReturn(new Promise((resolve, reject) => {
        promiseReject = reject.bind(this);
      }));

      componentUnderTest.getAllRedCarsAsPromiseWithStuffHappeningInBetween();

      expect(componentUnderTest.loading).toBeTruthy();

      promiseReject(undefined);

      setTimeout(() => {
        expect(componentUnderTest.cars).toEqual([]);
        expect(componentUnderTest.loading).toBeFalsy();
        expect(componentUnderTest.carRetrievalError).toBeTruthy();
        done();
      });
    });
  });

  // Observable tests

  describe('getAllRedCarsAsObservable', () => {

    it('should get the cars where the color is red', done => {
      when(carService.getCarsAsObservable()).thenReturn(of([aRedPorsche, aBlackCadillac, aBrownCar]));

      componentUnderTest
        .getAllRedCarsAsObservable()
        .subscribe(
          (actual: Array<Car>) => {
            expect(actual).toEqual([aRedPorsche]);
            done();
          },
          e => {
            fail(e);
            done();
          }
        );
    });

    it('should get the cars where the color is red (alternative way)', async done => {
      when(carService.getCarsAsObservable()).thenReturn(of([aRedPorsche, aBlackCadillac, aBrownCar]));

      try {
        const actual = await componentUnderTest.getAllRedCarsAsObservable().toPromise();
        expect(actual).toEqual([aRedPorsche]);
        done();
      } catch (e) {
        fail(e);
        done();
      }
    });
  });

  describe('getAllRedCarsAsObservableWithStuffHappeningInBetween', () => {

    it('should set all the red cars to the cars field and set loading field correctly', async done => {
      const carsSubject = new Subject<Array<Car>>();
      when(carService.getCarsAsObservable()).thenReturn(carsSubject.asObservable());

      componentUnderTest.getAllRedCarsAsObservablewithStuffHappeningInBetween();

      expect(componentUnderTest.loading).toBeTruthy();

      carsSubject.next([aBlackCadillac, aRedPorsche]);
      carsSubject.complete();

      expect(componentUnderTest.cars).toEqual([aRedPorsche]);
      expect(componentUnderTest.loading).toBeFalsy();
      done();
    });

    it('should set retrievalError to true if the observable throws an error', async done => {
      const carsSubject = new Subject<Array<Car>>();
      when(carService.getCarsAsObservable()).thenReturn(carsSubject.asObservable());

      componentUnderTest.getAllRedCarsAsObservablewithStuffHappeningInBetween();

      expect(componentUnderTest.loading).toBeTruthy();

      carsSubject.error(undefined);
      carsSubject.complete();

      expect(componentUnderTest.cars).toEqual([]);
      expect(componentUnderTest.carRetrievalError).toBeTruthy();
      expect(componentUnderTest.loading).toBeFalsy();
      done();
    });
  });
});
