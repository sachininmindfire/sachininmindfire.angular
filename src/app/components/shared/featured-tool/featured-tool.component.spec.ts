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
    component.tool = {
      id: 1,
      title: 'Featured Tool',
      description: 'Test Description',
      link: 'https://example.com',
      date: '2026-08-14',
      type: 'tool'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
