import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdPdfConvertorComponent } from './md-pdf-convertor.component';

describe('MdPdfConvertorComponent', () => {
  let component: MdPdfConvertorComponent;
  let fixture: ComponentFixture<MdPdfConvertorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdPdfConvertorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MdPdfConvertorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
