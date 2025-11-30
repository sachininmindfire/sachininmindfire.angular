import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonPrettifierComponent } from './json-prettifier.component';

describe('JsonPrettifierComponent', () => {
  let component: JsonPrettifierComponent;
  let fixture: ComponentFixture<JsonPrettifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonPrettifierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonPrettifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
