import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormRoot, FormField, form } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
};

type Recipe = {
  name: string;
  ingredients: Ingredient[];
  instructions: string;
};

interface ApiResponse {
  recipes: Recipe[];
}

interface UnitOption {
  id: string;
  label: string;
}

const UNIT_OPTIONS: UnitOption[] = [
  { id: 'kg', label: 'Kilogram (kg)' },
  { id: 'g', label: 'Gram (g)' },
  { id: 'litre', label: 'Litre (L)' },
  { id: 'ml', label: 'Millilitre (ml)' },
  { id: 'dozen', label: 'Dozen' },
  { id: 'piece', label: 'Piece' },
  { id: 'cup', label: 'Cup' },
  { id: 'tbsp', label: 'Tablespoon (tbsp)' },
  { id: 'tsp', label: 'Teaspoon (tsp)' },
];

@Component({
  selector: 'app-recipe-maker',
  imports: [FormRoot, FormField, CommonModule],
  templateUrl: './recipe-maker.component.html',
  styleUrl: './recipe-maker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeMakerComponent {
  ingredients = signal<Ingredient[]>([
    { name: '', quantity: 0, unit: 'piece' },
    { name: '', quantity: 0, unit: 'piece' },
    { name: '', quantity: 0, unit: 'piece' },
  ]);

  recipesResponse = signal<ApiResponse>({ recipes: [] });
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  
  unitOptions = UNIT_OPTIONS;

  // Create a signal form
  recipeForm = form(this.ingredients, {
    submission: {
      action: async () => {
        const model = this.ingredients();
        
        // Validate at least one ingredient has a name
        const hasValidIngredient = model.some(ing => ing.name.trim().length > 0);
        if (!hasValidIngredient) {
          this.errorMessage.set('Please enter at least one ingredient');
          return;
        }

        this.errorMessage.set(null);
        
        // Call API to get recipes
        await this.fetchRecipes(model);

        return undefined;
      },
    },
  });

  addIngredient(): void {
    const currentIngredients = this.ingredients();
    this.ingredients.set([
      ...currentIngredients,
      { name: '', quantity: 0, unit: 'piece' },
    ]);
  }

  removeIngredient(index: number): void {
    const currentIngredients = this.ingredients();
    
    // Prevent removal of last ingredient
    if (currentIngredients.length <= 1) {
      this.errorMessage.set('At least one ingredient is required');
      return;
    }

    const updatedIngredients = currentIngredients.filter((_, i) => i !== index);
    this.ingredients.set(updatedIngredients);
    this.errorMessage.set(null);
  }

  async fetchRecipes(ingredients: Ingredient[]): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      // Build the prompt with current ingredients
      const ingredientsList = JSON.stringify(ingredients);
      const prompt = `Suggest 3 cooking recipes along with brief preparation instructions around 200 words with the ingredients and quantities mentioned in the json list: ${ingredientsList}`;
      
      const url = `https://hook.us2.make.com/ybidwyfcxg9syplv73qholv336fdgaxs?catagory=${encodeURIComponent(prompt)}&count=3`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      console.log('Recipes:', data);
      this.recipesResponse.set(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      this.errorMessage.set('Failed to fetch recipes. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
