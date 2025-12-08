# Portal do Romeiro - Design Guidelines

## Core Design Principle
**NEVER alter the base style from the initial prototype.** Only expand and continue with the same visual language. All new screens and components must be indistinguishable from the original prototype in terms of style, spacing, typography, and visual hierarchy.

## Visual Identity (Fixed & Consistent)

### Color System
- **Primary Blue**: #4169E1
- Use the exact same color palette from the prototype
- Maintain consistent color usage across all screens

### Typography
- Use the same font family, weights, and sizes from the prototype
- Maintain identical hierarchy for titles and subtitles
- Keep the same text styling for labels and microtexts

### Spacing & Layout
- Follow the exact same spacing system from the prototype
- Use identical proportions and margins
- Maintain the same comfortable spacing between elements

### Component Styling
- **Cards**: Same rounded corners, shadows, padding, and visual treatment
- **Buttons**: Same style, borders, hover states, and feedback
- **Banners**: Same dimensions, image treatment, and overlay styles
- **Icons**: Same icon set and sizing
- All components must match the prototype exactly

## Navigation Structure

### Bottom Tab Navigation
Fixed tabs matching the prototype:
- **Home**: Main feed with hero banner and content sections
- **Reza**: Prayer/spiritual content
- **Notícias**: News articles
- **Mais**: More options/menu

### Navigation Behavior
- Maintain the exact same transition patterns from the prototype
- Use the same button behaviors and touch interactions
- Keep identical navigation logic between screens
- Always connect new screens properly to the existing flow

## Screen Development Standards

### Every Screen Must Include:
- Complete interface implementation
- All necessary components
- Proper scroll behavior where needed
- Clear visual hierarchy
- Comfortable spacing
- Intuitive touch targets
- Direct and functional actions
- Consistent visual feedback

### Content Sections Required:
- **História**: Timeline and educational religious content
- **TV Ao Vivo**: Live streaming
- **Roteiros**: Pilgrimage routes and guides
- **Info**: General information
- **Hospedagem**: Booking-style accommodation listings with filters
- **Serviços**: Available pilgrim services
- **Notícias**: Categorized news articles with images and dates
- **Vídeos**: Featured video content with categories

## Component Reusability
- Always use existing components when possible
- When creating new components, follow the exact same visual pattern
- Maintain identical borders, shadows, and spacing from the prototype
- Standardize all icons, labels, and microtexts
- Everything must look like part of a single design system

## Layout Patterns

### Home Screen Elements:
- Hero banner at top
- Navigation grid (6 items: História, TV Ao Vivo, Roteiros, Info, Hospedagem, Serviços)
- Latest news section with cards
- Featured videos section
- All with the same card style and spacing from prototype

### Content Cards:
- Consistent rounded corners
- Same shadow treatment
- Identical padding and content structure
- Standardized image aspect ratios
- Uniform title/subtitle/meta styling

### Lists & Grids:
- Same pattern for displaying collections
- Consistent item spacing
- Identical card treatments
- Standardized empty states

## Mobile-First Requirements
- Design for touch interactions
- Ensure comfortable tap targets
- Optimize for vertical scrolling
- Maintain responsive layouts
- Consider thumb-reachable zones

## Development Approach
When adding any new feature or screen:
1. Reference the existing prototype style
2. Use the same visual components
3. Maintain the established hierarchy
4. Connect navigation properly to existing flow
5. Never reinvent layouts - only expand them
6. Ensure seamless integration with existing screens

**The entire app must feel like a cohesive, single design system with no visual inconsistencies.**