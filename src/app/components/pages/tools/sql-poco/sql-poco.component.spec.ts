import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlPocoComponent } from './sql-poco.component';

describe('SqlPocoComponent', () => {
  let component: SqlPocoComponent;
  let fixture: ComponentFixture<SqlPocoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SqlPocoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SqlPocoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
