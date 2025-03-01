import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedToolComponent } from './featured-tool.component';

describe('FeaturedToolComponent', () => {
  let component: FeaturedToolComponent;
  let fixture: ComponentFixture<FeaturedToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedToolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
