import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeApiComponent } from './free-api.component';

describe('FreeApiComponent', () => {
  let component: FreeApiComponent;
  let fixture: ComponentFixture<FreeApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreeApiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreeApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});