import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionTier } from './commission-tier';

describe('CommissionTier', () => {
  let component: CommissionTier;
  let fixture: ComponentFixture<CommissionTier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommissionTier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionTier);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
