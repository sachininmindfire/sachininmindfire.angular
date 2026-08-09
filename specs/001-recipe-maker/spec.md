# Feature Specification: Recipe Maker Utility

**Feature Branch**: `main`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: Import Recipe Maker component from external project, apply standard CSS, create utilities navigation structure, and document requirements

## Overview

The Recipe Maker is an AI-powered cooking utility that suggests recipes based on user-provided ingredients. Users input ingredients they have available, and the system calls an external AI API to generate three creative recipe suggestions with ingredients lists and preparation instructions.

This feature introduces Signal Forms API (experimental Angular v21+ feature) for form handling and establishes a new "Utilities" section in the application navigation structure.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Recipe Maker from Navigation (Priority: P1)

As a user interested in cooking, I want to navigate to the Recipe Maker utility from the main navigation menu so that I can quickly access the recipe generation tool.

**Why this priority**: Navigation is the entry point - without it, users cannot discover or access the feature. This is foundational infrastructure.

**Independent Test**: Can be fully tested by clicking the navigation menu and verifying the Recipe Maker page loads.

**Acceptance Scenarios**:

1. **Given** user is on any page, **When** user clicks "Utilities" in the header navigation, **Then** a dropdown menu shows "Recipe Maker" option
2. **Given** user clicks "Recipe Maker" from dropdown, **When** navigation completes, **Then** Recipe Maker page loads at `/recipe-maker` route
3. **Given** user is on Recipe Maker page, **When** user views the page, **Then** the page displays ingredient input form with clear instructions

---

### User Story 2 - Input Ingredients and Generate Recipes (Priority: P1)

As a home cook, I want to enter ingredients I have available and get AI-suggested recipes so that I can discover what I can cook with my existing ingredients.

**Why this priority**: This is the core value proposition - the main functionality that delivers user benefit.

**Independent Test**: Can be fully tested by entering ingredients, submitting the form, and verifying recipe suggestions are displayed.

**Acceptance Scenarios**:

1. **Given** user is on Recipe Maker page, **When** user enters ingredient names and quantities (e.g., "flour" - 200g, "eggs" - 3), **Then** inputs accept and display the values correctly
2. **Given** user has entered at least one ingredient, **When** user clicks "Fetch Recipes" button, **Then** system sends ingredient data to AI API and displays loading indicator
3. **Given** API call succeeds, **When** recipes are returned, **Then** three recipe cards display with name, ingredients list, and preparation instructions
4. **Given** user submits with empty ingredients, **When** form validation runs, **Then** user sees validation message preventing submission

---

### User Story 3 - View Recipe Details (Priority: P2)

As a user evaluating recipe suggestions, I want to clearly see the ingredients needed and preparation steps for each suggested recipe so that I can decide which recipe to make.

**Why this priority**: Enhances user experience by presenting recipe information in an organized, readable format. Secondary to core recipe generation.

**Independent Test**: Can be tested by verifying recipe cards render correctly with all required information.

**Acceptance Scenarios**:

1. **Given** recipes have been generated, **When** recipe cards display, **Then** each card shows recipe name as heading, ingredients as bulleted list with quantities, and preparation instructions as text
2. **Given** multiple recipes are returned, **When** user views results, **Then** recipes are visually separated with distinct cards and consistent styling
3. **Given** a recipe has many ingredients, **When** displayed, **Then** all ingredients are visible and properly formatted

---

### User Story 4 - Handle Loading and Error States (Priority: P2)

As a user waiting for recipe suggestions, I want clear feedback when the system is processing my request or when errors occur so that I understand what's happening.

**Why this priority**: Critical for user experience - prevents confusion during API calls and provides graceful error handling.

**Independent Test**: Can be tested by simulating slow API responses and error conditions.

**Acceptance Scenarios**:

1. **Given** user clicks "Fetch Recipes", **When** API call is in progress, **Then** button shows "Fetching Recipes..." text, is disabled, and loading spinner displays
2. **Given** API call fails (network error, server error), **When** error occurs, **Then** user sees error message and can retry
3. **Given** recipes successfully load, **When** complete, **Then** loading indicator disappears and button becomes enabled again

---

### Edge Cases

- **Empty ingredient list**: Form validation prevents submission when no ingredients are provided
- **Single ingredient**: System handles minimal input and returns recipes using that single ingredient
- **Very long ingredient names**: Input fields handle long text gracefully without breaking layout
- **API timeout**: Loading state has timeout (30 seconds); shows error if API doesn't respond
- **API returns no recipes**: Display user-friendly "No recipes found" message with suggestion to try different ingredients
- **Special characters in ingredients**: Properly encode and handle special characters in API requests
- **Duplicate ingredients**: System handles duplicate ingredient entries gracefully

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide ingredient input form with dynamic rows for ingredient name and quantity
- **FR-002**: System MUST use Angular Signal Forms API (`@angular/forms/signals`) for form state management
- **FR-003**: System MUST call external AI API (make.com webhook) with ingredient JSON payload
- **FR-004**: System MUST display exactly 3 recipe suggestions returned from API
- **FR-005**: System MUST show loading indicator during API calls with disabled submit button
- **FR-006**: System MUST handle API errors gracefully with user-friendly error messages
- **FR-007**: System MUST display recipe cards with name, ingredients list (with quantities), and preparation instructions
- **FR-008**: System MUST include "Recipe Maker" in Utilities dropdown menu in header navigation
- **FR-009**: System MUST route `/recipe-maker` to Recipe Maker component
- **FR-010**: System MUST apply consistent styling matching existing tool pages (cards, buttons, forms)
- **FR-011**: Form MUST validate that at least one ingredient has a non-empty name before submission
- **FR-012**: System MUST support minimum 3 ingredient input rows (expandable if needed)

### Non-Functional Requirements

- **NFR-001**: Recipe suggestions MUST appear within 10 seconds under normal network conditions
- **NFR-002**: Form inputs MUST be responsive and usable on mobile devices
- **NFR-003**: Component MUST use `ChangeDetectionStrategy.OnPush` for optimal performance
- **NFR-004**: All TypeScript code MUST be strictly typed with no `any` types
- **NFR-005**: Component MUST include unit tests covering form validation and API calls
- **NFR-006**: Styles MUST use SCSS and follow existing project conventions
- **NFR-007**: Component MUST be standalone (no NgModules)
- **NFR-008**: Signal Forms usage MUST be documented as experimental with fallback notes

### Key Entities

- **Ingredient**: Represents a single cooking ingredient with name (string) and quantity (number)
- **Recipe**: Represents a cooking suggestion with name (string), ingredients (array of Ingredient), and instructions (string)
- **ApiResponse**: API response structure containing array of Recipe objects
- **Recipe Maker Form**: Signal-based form model managing ingredient array state

## Assumptions

- External AI API (make.com webhook) is available and reliable
- Users have basic cooking knowledge to interpret recipe suggestions
- Ingredient quantities use numeric values (grams, cups, pieces, etc.)
- Users access application via modern web browsers with JavaScript enabled
- Network connectivity is available for API calls

## Constraints

- Signal Forms API is experimental (Angular v21.2.8) - may change in future versions
- External API is third-party service with no SLA guarantee
- Recipe suggestions limited to 3 per request by API design
- No user authentication or recipe saving functionality in initial version

## Out of Scope

- User accounts or saved recipes
- Recipe rating or feedback system
- Ingredient substitution suggestions
- Dietary restriction filtering (vegetarian, gluten-free, etc.)
- Recipe image display
- Shopping list generation
- Recipe sharing or social features

## Success Criteria

- Users can navigate to Recipe Maker from main menu in under 2 clicks
- 90% of API requests return 3 valid recipes within 10 seconds
- Form validation prevents empty submissions 100% of the time
- Loading and error states display correctly in all scenarios
- Component passes all unit tests with >80% code coverage
- Visual design matches existing tool pages (Text Diff, JSON Prettifier, etc.)
- No console errors or TypeScript compilation errors

## Technical Notes

**Signal Forms API Usage**:
- Import `FormRoot`, `FormField`, `form` from `@angular/forms/signals`
- Use `form()` function to create signal-based form model
- Use `[formRoot]` directive on form element
- Use `[formField]` directive on input elements
- Leverage signal-based submission handler

**API Integration**:
- Endpoint: `https://hook.us2.make.com/ybidwyfcxg9syplv73qholv336fdgaxs`
- Method: GET with query parameter `catagory` (URL-encoded JSON prompt)
- Response format: `{ recipes: Recipe[] }`

**Migration Path**:
If Signal Forms API changes before stable release, migration to reactive forms documented in implementation plan.

---

**Version**: 1.0.0 | **Status**: Ready for Planning | **Next**: `/speckit.plan`
