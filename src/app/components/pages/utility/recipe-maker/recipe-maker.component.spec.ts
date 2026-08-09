import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeMakerComponent } from './recipe-maker.component';

describe('RecipeMakerComponent', () => {
  let component: RecipeMakerComponent;
  let fixture: ComponentFixture<RecipeMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeMakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with 3 empty ingredient slots', () => {
    const ingredients = component.ingredients();
    expect(ingredients.length).toBe(3);
    expect(ingredients.every(ing => ing.name === '' && ing.unit === 'piece')).toBe(true);
  });

  it('should start with no recipes loaded', () => {
    const response = component.recipesResponse();
    expect(response.recipes.length).toBe(0);
  });

  it('should start with loading state false', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('should start with no error message', () => {
    expect(component.errorMessage()).toBeNull();
  });

  it('should add a new ingredient row', () => {
    const initialLength = component.ingredients().length;
    component.addIngredient();
    const newLength = component.ingredients().length;
    expect(newLength).toBe(initialLength + 1);
    expect(component.ingredients()[newLength - 1].name).toBe('');
    expect(component.ingredients()[newLength - 1].unit).toBe('piece');
  });

  it('should prevent removal of the last ingredient', () => {
    component.ingredients.set([{ name: 'flour', quantity: 200, unit: 'g' }]);
    component.removeIngredient(0);
    expect(component.ingredients().length).toBe(1);
    expect(component.errorMessage()).toBe('At least one ingredient is required');
  });

  it('should remove an ingredient at specified index', () => {
    component.ingredients.set([
      { name: 'flour', quantity: 200, unit: 'g' },
      { name: 'eggs', quantity: 3, unit: 'piece' },
      { name: 'milk', quantity: 250, unit: 'ml' }
    ]);
    component.removeIngredient(1);
    const ingredients = component.ingredients();
    expect(ingredients.length).toBe(2);
    expect(ingredients[0].name).toBe('flour');
    expect(ingredients[1].name).toBe('milk');
  });

  it('should have predefined unit options', () => {
    expect(component.unitOptions.length).toBeGreaterThan(0);
    expect(component.unitOptions.some(u => u.id === 'kg')).toBe(true);
    expect(component.unitOptions.some(u => u.id === 'piece')).toBe(true);
  });
});
