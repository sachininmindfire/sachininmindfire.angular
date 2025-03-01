# Adding Free JSON API Tool to Homepage

## Overview
Add a link for the Free JSON API tool that opens in a new browser tab when clicked.

## Implementation Plan

### 1. Update ContentService
Add the new tool to the tools signal array in ContentService:
```typescript
{
  id: 2,
  title: 'Free JSON API',
  description: 'Access free JSON APIs for testing and prototyping',
  date: '2024-03-01',
  link: 'https://sachininmindfire.github.io/free-api/',
  type: 'tool'
}
```

### 2. Update Content Card Component
The content-card component needs to be implemented to display content items:
- Add input property for ContentItem
- Create template with title, description, and link
- Add target="_blank" for external tool links
- Style appropriately for different content types

### 3. Update Featured Tool Component
Implement the featured-tool component:
- Use content-card to display tool items
- Add input property for tool ContentItem
- Style to highlight featured tools

### 4. Update Home Component
Update home component to display tools:
- Inject ContentService
- Get latest tools using getLatestTools signal
- Display tools using featured-tool component
- Add section for featured tools

### 5. Update Tools Component
Implement tools component to show all tools:
- Inject ContentService
- Get tools using getLatestTools signal
- Display tools using content-card component
- Add grid/list layout for multiple tools

## Technical Considerations
- External links should open in new tabs (target="_blank")
- Consider adding rel="noopener noreferrer" for security on external links
- Ensure responsive design for tool cards
- Add appropriate hover states and animations for better UX

## Next Steps
1. Switch to Code mode to implement these changes
2. Start with ContentService update as it's the foundation
3. Implement components in order: content-card, featured-tool, home, tools
4. Test all links and interactions