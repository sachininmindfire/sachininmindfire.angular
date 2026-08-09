# Feature Specification: Recipe Maker Improvements

**Feature Branch**: `002-recipe-maker-improvements`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: Enhance Recipe Maker with dynamic ingredient management and unit selection

## Overview

This feature improves the Recipe Maker utility by enabling users to dynamically add and remove ingredient rows and select specific measurement units for each ingredient quantity. Users will have full control over the number of ingredients and precise unit selection (kg, litre, dozen, etc.), making the feature more flexible and realistic for diverse recipes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add More Ingredient Rows Dynamically (Priority: P1)

As a user preparing recipes with many ingredients, I want to add more ingredient input rows beyond the initial three so that I can enter all ingredients for complex recipes without limitation.

**Why this priority**: Core functionality enhancement - essential for recipes with 4+ ingredients. Foundational to improved UX.

**Independent Test**: Can be fully tested by clicking "Add Ingredient" button and verifying new row appears and is functional.

**Acceptance Scenarios**:

1. **Given** Recipe Maker form has 3 ingredient rows, **When** user clicks "Add Ingredient" button, **Then** a new ingredient row appears below existing rows
2. **Given** user has added multiple ingredient rows, **When** form is submitted, **Then** all ingredients (including newly added) are included in the API request
3. **Given** form is displayed, **When** user adds 10+ ingredients, **Then** all rows render without layout issues and form remains responsive
4. **Given** user is on mobile device, **When** user adds new ingredients, **Then** rows stack cleanly and button remains accessible

---

### User Story 2 - Remove Individual Ingredient Rows (Priority: P1)

As a user managing ingredients, I want to remove specific ingredient rows I don't need so that I can maintain a clean ingredient list without pre-defined limits.

**Why this priority**: Essential for flexibility and user control - prevents need to submit incomplete forms or refresh to remove mistakes.

**Independent Test**: Can be tested by adding ingredients, clicking remove on specific rows, and verifying only desired ingredients remain in form state.

**Acceptance Scenarios**:

1. **Given** Recipe Maker form has multiple ingredient rows, **When** last ingredient row is visible, **Then** a "Remove" button/icon displays next to it
2. **Given** form has 5+ ingredient rows, **When** user clicks "Remove" on any row (except potentially the last), **Then** that specific row is deleted and form updates
3. **Given** form has only 1 ingredient row, **When** user attempts to remove it, **Then** either prevent deletion or maintain minimum 1 row requirement with clear user feedback
4. **Given** form has removed ingredients, **When** form is submitted, **Then** only remaining ingredients are sent to API

---

### User Story 3 - Select Measurement Units for Each Ingredient (Priority: P1)

As a user entering ingredients, I want to select a measurement unit (kg, litre, dozen, etc.) for each ingredient so that the API receives precise quantity information and suggestions are more accurate.

**Why this priority**: High - improves recipe accuracy significantly. Different ingredients use different units; this standardizes input across the application.

**Independent Test**: Can be tested by selecting different units from dropdown and verifying form state captures correct unit values.

**Acceptance Scenarios**:

1. **Given** Recipe Maker form is displayed, **When** user clicks unit dropdown for an ingredient, **Then** dropdown shows predefined unit options (kg, g, litre, ml, dozen, piece, cup, tbsp, tsp, etc.)
2. **Given** user has selected a unit (e.g., "kg"), **When** form is submitted, **Then** API request includes the selected unit in ingredient object (e.g., `{ name: "flour", quantity: 200, unit: "g" }`)
3. **Given** more units are needed in future, **Then** unit list remains configurable without code changes (ideally from config or constants)
4. **Given** existing form data is displayed, **When** user views form, **Then** previously selected units remain selected in dropdowns

---

### User Story 4 - Improved Ingredient Input Layout (Priority: P2)

As a user entering many ingredients, I want a clearer visual organization of ingredient inputs with unit selection so that the form remains easy to use even with many rows.

**Why this priority**: Enhances UX - makes managing many ingredients more intuitive and less overwhelming.

**Independent Test**: Can be tested by adding 5+ ingredients and verifying layout clarity, proper spacing, and alignment of name/quantity/unit inputs.

**Acceptance Scenarios**:

1. **Given** form has 5+ ingredient rows, **When** user views form, **Then** all input fields (name, quantity, unit) are clearly aligned in columns
2. **Given** multiple ingredient rows are displayed, **When** user hovers/focuses on any row, **Then** row is visually highlighted or indicated to show which row is being edited
3. **Given** form is displayed on desktop, **When** user views the ingredient section, **Then** name, quantity, and unit fields are in a single horizontal row with appropriate spacing

---

### Edge Cases

- **Minimum ingredients**: Form requires at least 1 ingredient to submit (cannot remove all)
- **Maximum ingredients**: No hard limit, but API should handle 10+ ingredients gracefully
- **No unit selected**: Default unit or required field validation to ensure unit selection
- **Invalid quantity with unit**: Validation ensures quantity is valid number for selected unit
- **Special unit names**: Support units with special characters or spaces (e.g., "per dozen", "per piece")
- **Duplicate units in list**: Unit dropdown is deduplicated and sorted for clarity
- **Mobile overflow**: Long unit names or many fields don't break layout on small screens
- **Keyboard navigation**: Users can tab through name → quantity → unit fields smoothly

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide "Add Ingredient" button that creates new ingredient row dynamically
- **FR-002**: System MUST provide "Remove" button/icon for each ingredient row (except when only 1 row remains)
- **FR-003**: System MUST prevent removal of the last ingredient row with clear user message
- **FR-004**: System MUST include unit dropdown for each ingredient row with predefined unit options
- **FR-005**: Unit list MUST include: kg, g, litre (L), millilitre (ml), dozen, piece, cup, tablespoon (tbsp), teaspoon (tsp)
- **FR-006**: System MUST allow unit selection as optional field with sensible default or required validation
- **FR-007**: System MUST include selected unit in ingredient data sent to API (new property: `unit`)
- **FR-008**: System MUST maintain form state when adding/removing ingredients (preserve existing entries)
- **FR-009**: System MUST align three input fields (ingredient name, quantity, unit) horizontally when space permits
- **FR-010**: System MUST provide visual feedback when hovering/focusing on ingredient rows
- **FR-011**: System MUST support unlimited ingredient rows (tested to at least 10+ rows)
- **FR-012**: Added/removed ingredients MUST be reflected immediately in form visualization
- **FR-013**: Unit dropdown MUST close after selection or allow manual closure

### Non-Functional Requirements

- **NFR-001**: Add/remove ingredient actions MUST complete instantly (< 50ms) without API calls
- **NFR-002**: Form layout MUST remain responsive on screens 320px+ width
- **NFR-003**: Unit dropdown MUST render and respond within 100ms
- **NFR-004**: Component MUST maintain performance with 10+ ingredient rows (no noticeable lag)
- **NFR-005**: Unit list MUST be easily configurable for future expansion
- **NFR-006**: TypeScript MUST maintain strict typing for ingredient objects with unit property

### Key Entities

- **Ingredient (Updated)**: Represents cooking ingredient with properties:
  - `name`: string (ingredient name)
  - `quantity`: number (quantity value)
  - `unit`: string (measurement unit, e.g., "kg", "litre") - **NEW**
  
- **UnitOption**: Represents available measurement unit:
  - `id`: string (e.g., "kg")
  - `label`: string (display name, e.g., "Kilogram")

## Assumptions

- Unit dropdown list is predefined and managed in component (not from external API)
- Default unit selection behavior: either no default (user must select) or "piece" as sensible default
- Ingredient row removal is immediate without confirmation dialog (unless quantity > 0, then optional confirmation)
- Form API consumer (make.com webhook) can handle variable number of ingredients and new `unit` property
- Ingredient order in list doesn't matter (order not sent to API or handled as array)

## Constraints

- Must maintain backward compatibility with existing Recipe Maker functionality
- Unit data stored locally in form state, not persisted to database
- Signal Forms API experimental limitations apply (see original spec)

## Out of Scope

- User-defined custom units
- Unit conversion or calculation
- Unit-specific validation (e.g., max quantity per unit)
- Persisting ingredient lists as templates
- Bulk ingredient import/export

## Success Criteria

- Users can add 10+ ingredients without form performance degradation
- At least 1 ingredient always remains to prevent empty submissions
- Unit selection is visible and intuitive on all device sizes
- Unit data is captured in form state and sent in API request
- Add/remove operations complete instantly with visual feedback
- All unit options are clearly labeled and accessible from dropdown
- Form layout remains clean and organized with up to 15 ingredient rows

## Technical Implementation Notes

**Updated Data Model**:
```typescript
type Ingredient = {
  name: string;
  quantity: number;
  unit: string;  // NEW: e.g., "kg", "litre", "piece"
}

const UNIT_OPTIONS = [
  { id: 'kg', label: 'Kilogram (kg)' },
  { id: 'g', label: 'Gram (g)' },
  { id: 'litre', label: 'Litre (L)' },
  { id: 'ml', label: 'Millilitre (ml)' },
  { id: 'dozen', label: 'Dozen' },
  { id: 'piece', label: 'Piece' },
  { id: 'cup', label: 'Cup' },
  { id: 'tbsp', label: 'Tablespoon (tbsp)' },
  { id: 'tsp', label: 'Teaspoon (tsp)' }
];
```

**Form Template Changes**:
- Add "Add Ingredient" button above or below ingredient list
- Modify each ingredient row to include 3 inputs: name, quantity, unit dropdown
- Add "Remove" button/icon to each row (with conditional disable on last row)
- Maintain responsive layout using flexbox with appropriate wrapping

**Signal Form Integration**:
- Update `form()` initialization to handle new `unit` property
- Ensure Signal Forms properly manages unit dropdown state
- Test form submission with new unit data

**Testing Strategy**:
- Unit test: Add/remove 10 ingredients verifies array manipulation
- Unit test: Unit selection updates form state correctly
- Integration test: Full workflow with 5+ ingredients and various units
- E2E test: Form submission includes all ingredients with units

**Backward Compatibility**:
- If API returns recipes without expecting `unit` field, provide default or handle gracefully
- Form should remain functional if unit data is optional in API

---

**Version**: 1.0.0 | **Status**: Ready for Planning | **Next**: `/speckit.plan`
