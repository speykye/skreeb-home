import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalDoc } from './legal-doc';

describe('LegalDoc', () => {
  let component: LegalDoc;
  let fixture: ComponentFixture<LegalDoc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalDoc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalDoc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
