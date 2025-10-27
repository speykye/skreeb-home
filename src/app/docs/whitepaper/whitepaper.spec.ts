import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Whitepaper } from './whitepaper';

describe('Whitepaper', () => {
  let component: Whitepaper;
  let fixture: ComponentFixture<Whitepaper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Whitepaper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Whitepaper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
