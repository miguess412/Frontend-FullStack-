import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteTickets } from './cliente-tickets';

describe('ClienteTickets', () => {
  let component: ClienteTickets;
  let fixture: ComponentFixture<ClienteTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteTickets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteTickets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
