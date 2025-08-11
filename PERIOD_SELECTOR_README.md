# Period Selector Component

## Overview
The Period Selector is a custom UI component that provides an intuitive way to select date ranges for the Revenue Dashboard. It replaces the previous `EnhancedDateRangePicker` with a more user-friendly interface that matches the design requirements.

## Features

### 1. **Dual Calendar Interface**
- **Start Date Calendar**: Select the beginning of your date range
- **End Date Calendar**: Select the end of your date range
- Both calendars are synchronized to prevent invalid date selections

### 2. **Predefined Period Buttons**
Quick selection buttons for common time periods:
- **Today** - Current date only
- **Yesterday** - Previous day
- **This week** - From start of current week to today
- **Last week** - Previous week (Monday to Sunday)
- **This month** - From start of current month to today
- **Last month** - Previous month
- **This year** - From start of current year to today
- **Last Year** - Previous year

### 3. **Visual Period Display**
- Shows the currently selected period at the top in a blue banner
- Format: "01-Aug-25 - 10-Aug-25"
- Updates in real-time as you make selections

### 4. **Modal Interface**
- Full-screen overlay for better user experience
- Responsive design that works on all screen sizes
- OK/Cancel buttons for confirming or discarding changes

## Implementation Details

### Component Location
```
src/components/ui/period-selector.tsx
```

### Integration in RevenueDashboard
The component is integrated into the Revenue Dashboard at:
```
src/pages/RevenueDashboard.tsx
```

### Key Props
```typescript
interface PeriodSelectorProps {
  dateRange: DateRange | undefined;           // Current date range
  onDateRangeChange: (range: DateRange | undefined) => void;  // Callback for changes
  onClose?: () => void;                       // Optional close handler
  isOpen?: boolean;                           // Controls modal visibility
}
```

### State Management
- Uses local state for temporary selections
- Only updates parent component when OK is clicked
- Cancel button reverts to original selection

## Usage

### 1. **Opening the Selector**
Click the "Period" button in the Revenue Dashboard filters section.

### 2. **Selecting Dates**
- Use the left calendar to select start date
- Use the middle calendar to select end date
- Dates are automatically validated (start ≤ end)

### 3. **Quick Selection**
Click any predefined period button for instant date range selection.

### 4. **Confirming Selection**
- Click "OK" to apply the selected period
- Click "Cancel" to discard changes and close

## Technical Features

### Dependencies
- **React**: Core component framework
- **date-fns**: Date formatting and manipulation
- **react-day-picker**: Calendar component
- **lucide-react**: Icons (Check, X, ChevronLeft, ChevronRight)
- **Tailwind CSS**: Styling

### Responsive Design
- Mobile-friendly with `max-w-[95vw]`
- Proper z-index management (`z-50`)
- Flexible width with `w-[900px]` and responsive constraints

### Accessibility
- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- Focus management for modal interactions

## Styling

### Color Scheme
- **Primary Blue**: `bg-blue-100 text-blue-800` for period display
- **Modal Overlay**: `bg-black bg-opacity-50` for backdrop
- **Buttons**: Standard shadcn/ui button variants

### Layout
- **Grid Layout**: 3-column responsive grid for calendars and buttons
- **Spacing**: Consistent margins and padding using Tailwind classes
- **Typography**: Clear hierarchy with proper font weights and sizes

## Future Enhancements

Potential improvements that could be added:
1. **Date Range Presets**: Save custom date ranges for frequent use
2. **Keyboard Shortcuts**: Hotkeys for quick navigation
3. **Date Validation**: More sophisticated date validation rules
4. **Localization**: Support for different date formats and languages
5. **Animation**: Smooth transitions and micro-interactions

## Troubleshooting

### Common Issues
1. **Calendar not showing**: Check if `react-day-picker` is properly installed
2. **Date formatting errors**: Ensure `date-fns` is available
3. **Modal not opening**: Verify `isOpen` prop is being set correctly
4. **Styling issues**: Check Tailwind CSS classes and custom CSS conflicts

### Debug Mode
The component includes proper error handling and can be debugged by:
- Checking browser console for errors
- Verifying prop values in React DevTools
- Testing with different date ranges and edge cases
