import {AppComponent} from '../app.component';
import {Car, CarService} from '../car.service';
import {instance, mock, verify, when} from 'ts-mockito';

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
      when(carService.getCarsAsPromise()).thenResolve([aRedPorsche, aBlackCadillac, aBrownCar]);

      const actual = await componentUnderTest.getAllRedCarsAsPromise();

      expect(actual).toEqual([aRedPorsche]);
      done();
    });
  });

  describe('getAllRedCarsAsPromiseWithStuffHappeningInBetween', () => {

    it('should set all the red cars to the cars field and set loading field correctly', async done => {
      let promiseResolve: (cars: Array<Car>) => void;
      when(carService.getCarsAsPromise()).thenReturn(new Promise(resolve => {
        promiseResolve = resolve.bind(this);
      }));

      componentUnderTest.getAllRedCarsAsPromiseWithStuffHappeningInBetween();
      promiseResolve([aBlackCadillac, aRedPorsche]);

      // expect(componentUnderTest.loading).toBeTruthy();


      expect(componentUnderTest.cars).toEqual([aRedPorsche]);
      expect(componentUnderTest.loading).toBeFalsy();
      done();
    });
  });
});
