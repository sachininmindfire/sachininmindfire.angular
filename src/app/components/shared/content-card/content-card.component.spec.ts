import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentCardComponent } from './content-card.component';

describe('ContentCardComponent', () => {
  let component: ContentCardComponent;
  let fixture: ComponentFixture<ContentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentCardComponent);
    component = fixture.componentInstance;
    component.content = {
      id: 1,
      title: 'Test Title',
      description: 'Test Description',
      link: 'https://example.com',
      date: '2026-08-14',
      type: 'article'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
