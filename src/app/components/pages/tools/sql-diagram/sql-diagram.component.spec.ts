import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlDiagramComponent } from './sql-diagram.component';

describe('SqlDiagramComponent', () => {
  let component: SqlDiagramComponent;
  let fixture: ComponentFixture<SqlDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SqlDiagramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SqlDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
