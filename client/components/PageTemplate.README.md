# PageTemplate Component

A flexible, reusable page template system that provides consistent styling and structure across all app pages while allowing customization for different page types.

## Features

- Consistent visual design with customizable gradients
- Section-based content system (stats, actions, metrics, calendar, custom)
- Pull-to-refresh support
- Responsive grid layouts
- Built-in header with optional back button and custom right content
- Follows app theme and design tokens

## Usage

### Basic Example

```tsx
import { PageTemplate, PageSection } from '@/components/PageTemplate';

const MyPage = () => {
  const sections: PageSection[] = [
    {
      type: 'stats',
      data: {
        items: [
          { icon: 'flame', label: 'Calories', value: '1500' },
          { icon: 'water', label: 'Water', value: '2.5L' },
        ],
        columns: 2,
      },
    },
  ];

  return (
    <PageTemplate
      pageName="mypage"
      title="My Page"
      subtitle="Page description"
      sections={sections}
    />
  );
};
```

## Section Types

### 1. Stats Section

Display key metrics in a grid layout with icons.

```tsx
{
  type: 'stats',
  data: {
    items: [
      {
        icon: 'flame',
        label: 'Calories',
        value: '1500',
        color: '#EF4444', // optional
      },
    ],
    columns: 2, // 2, 3, or 4
  },
}
```

### 2. Actions Section

Interactive cards for navigation or actions.

```tsx
{
  type: 'actions',
  data: {
    items: [
      {
        icon: 'camera',
        label: 'Scan Food',
        onPress: () => {},
        color: '#10B981', // optional
      },
    ],
    columns: 2, // 2 or 3
  },
}
```

### 3. Metrics Section

Detailed metric cards with title, value, and subtitle.

```tsx
{
  type: 'metrics',
  data: {
    items: [
      {
        title: 'Average Calories',
        value: '1800',
        subtitle: 'This week',
        icon: 'flame', // optional
        color: '#EF4444', // optional
      },
    ],
  },
}
```

### 4. Calendar Section

Custom calendar component.

```tsx
{
  type: 'calendar',
  data: {
    component: <MyCalendarComponent />,
  },
}
```

### 5. Custom Section

Any custom component.

```tsx
{
  type: 'custom',
  data: {
    component: <MyCustomComponent />,
  },
}
```

## Props

### PageTemplate Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| pageName | string | Yes | Unique identifier for the page |
| title | string | Yes | Page title displayed in header |
| subtitle | string | No | Optional subtitle under title |
| headerIcon | IconName | No | Icon displayed in header |
| sections | PageSection[] | Yes | Array of page sections |
| refreshing | boolean | No | Pull-to-refresh loading state |
| onRefresh | () => void | No | Pull-to-refresh callback |
| headerGradient | string[] | No | Custom gradient colors for header |
| showBackButton | boolean | No | Show back button in header |
| onBackPress | () => void | No | Back button callback |
| headerRight | ReactNode | No | Custom content for header right side |

## Examples

See `PageTemplateExamples.tsx` for complete implementations:

- **Home Page**: Stats + Actions sections
- **Statistics Page**: Metrics + Stats + Custom sections
- **Calendar Page**: Stats + Calendar sections
- **Profile Page**: Metrics + Actions sections

## Customization

### Custom Header Gradient

```tsx
<PageTemplate
  headerGradient={['#10B981', '#059669', '#047857']}
  // ...other props
/>
```

### Custom Header Right Content

```tsx
<PageTemplate
  headerRight={
    <Pressable onPress={onSettings}>
      <Ionicons name="settings" size={24} color="#fff" />
    </Pressable>
  }
  // ...other props
/>
```

### Page-Specific Styling

Each section automatically gets consistent styling, but you can customize colors:

```tsx
{
  type: 'stats',
  data: {
    items: [
      {
        icon: 'flame',
        label: 'Custom',
        value: '100',
        color: '#FF6B6B', // Custom color for this item
      },
    ],
  },
}
```

## Design Tokens

The template uses app-wide design tokens from `@/constants/theme`:

- **Colors**: Primary greens, semantic colors, chart colors
- **Spacing**: 8px grid system (xs to 8xl)
- **Border Radius**: Consistent rounded corners
- **Typography**: Font sizes and weights
- **Shadows**: Elevation system

## Best Practices

1. **Keep sections focused**: Each section should display related content
2. **Use appropriate section types**: Choose the right section type for your data
3. **Maintain consistency**: Use the same patterns across similar pages
4. **Customize minimally**: Override defaults only when necessary
5. **Test refresh behavior**: Implement onRefresh for data fetching pages

## Migration Guide

To migrate an existing page to use PageTemplate:

1. Identify your page's sections (header, stats, actions, content)
2. Map each section to a section type
3. Extract data into section data structures
4. Replace SafeAreaView/ScrollView/LinearGradient with PageTemplate
5. Pass sections array to PageTemplate
6. Remove custom header and refresh logic (now handled by template)

### Before

```tsx
<SafeAreaView>
  <LinearGradient colors={['#10B981', '#059669']}>
    <Text>My Page</Text>
  </LinearGradient>
  <ScrollView refreshControl={...}>
    <View>{/* Stats cards */}</View>
    <View>{/* Action cards */}</View>
  </ScrollView>
</SafeAreaView>
```

### After

```tsx
<PageTemplate
  pageName="mypage"
  title="My Page"
  sections={[
    { type: 'stats', data: { items: [...] } },
    { type: 'actions', data: { items: [...] } },
  ]}
  refreshing={refreshing}
  onRefresh={handleRefresh}
/>
```
