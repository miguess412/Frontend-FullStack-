import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoRetorno } from './pago-retorno';

describe('PagoRetorno', () => {
  let component: PagoRetorno;
  let fixture: ComponentFixture<PagoRetorno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoRetorno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoRetorno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
