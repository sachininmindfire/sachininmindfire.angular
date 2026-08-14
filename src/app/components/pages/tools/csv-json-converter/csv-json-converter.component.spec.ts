import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { CsvJsonConverterComponent } from './csv-json-converter.component';

describe('CsvJsonConverterComponent', () => {
  let component: CsvJsonConverterComponent;
  let fixture: ComponentFixture<CsvJsonConverterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, CsvJsonConverterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CsvJsonConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert CSV to JSON', () => {
    component.mode = 'csv-to-json';
    component.inputText = 'name,age\nAlice,30\nBob,25';

    component.convert();

    expect(component.outputText).toContain('"name": "Alice"');
    expect(component.outputText).toContain('"age": "30"');
    expect(component.errorMessage).toBe('');
  });

  it('should convert JSON to CSV', () => {
    component.mode = 'json-to-csv';
    component.inputText = JSON.stringify([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ]);

    component.convert();

    expect(component.outputText).toContain('name,age');
    expect(component.outputText).toContain('Alice,30');
    expect(component.errorMessage).toBe('');
  });
});
