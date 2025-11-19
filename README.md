# Tasker - Modern Todo List App

A modern, feature-rich todo list application with a beautiful post-it note style interface. Built with Next.js 15, TypeScript, Tailwind CSS, and Zustand for state management.

## Features

- 📝 **Task Management**: Create, edit, complete, and delete tasks with ease
- 📋 **Multiple Lists**: Organize tasks into different lists
- 📁 **List Grouping**: Group related lists together for better organization
- 🎨 **Modern UI**: Beautiful post-it note style task cards with multiple colors
- 💾 **Local Storage**: All data persists in browser localStorage
- ☁️ **Cloud-Ready**: Architecture supports future migration to cloud database
- 🎯 **Drag & Drop**: Visual indicators for task positioning (future enhancement)
- 📱 **Responsive**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand

### Storage
- **Current**: Browser localStorage
- **Future**: Cloud database (Firebase, Supabase, or similar)

## Project Structure

```
tasker/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main dashboard
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── TaskCard.tsx        # Individual task component
│   │   ├── ListComponent.tsx   # List container
│   │   └── GroupComponent.tsx  # Group container
│   ├── store/
│   │   └── useStore.ts         # Zustand state management
│   ├── lib/
│   │   └── storage.ts          # Storage service with cloud migration support
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── public/                     # Static assets
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or your preferred package manager

### Installation

1. Clone or navigate to the project directory:
```bash
cd tasker
```

2. Dependencies are already installed. If you need to reinstall:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating Groups and Lists

1. **Add a Group**: Click "Add Group" to create a container for related lists
2. **Add a List**: Click "Add List" (within a group or "Add Ungrouped List")
3. **Add Tasks**: Click "Add Task" within any list

### Managing Tasks

- **Complete**: Click the circle icon to mark a task as complete
- **Edit**: Click on the task title or description to edit inline
- **Delete**: Hover over a task and click the trash icon
- **Colors**: Tasks are automatically assigned random post-it note colors

### Organizing

- **Group Lists**: Create groups to organize related lists
- **Collapse Groups**: Click the chevron icon to collapse/expand groups
- **Delete Groups**: Click the trash icon (lists will become ungrouped)

## Data Persistence

Currently, all data is stored in browser localStorage. Your tasks persist across sessions but are local to your browser.

### Future Cloud Database Migration

The architecture is designed for easy migration to cloud storage:

1. Implement authentication (Auth0, Clerk, Firebase Auth, etc.)
2. Update `storage.ts` cloud methods (`syncToCloud`, `loadFromCloud`)
3. Choose a database (Firebase, Supabase, MongoDB, PostgreSQL)
4. Add sync functionality to the store

Example services to consider:
- **Firebase Firestore**: Real-time database with excellent SDK
- **Supabase**: Open-source Firebase alternative with PostgreSQL
- **MongoDB Atlas**: Flexible NoSQL database
- **PlanetScale**: MySQL-compatible serverless database

## Development Scripts

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Customization

### Colors

Task colors can be customized in `src/components/TaskCard.tsx`:

```typescript
const COLORS = {
  yellow: 'bg-yellow-200 border-yellow-300',
  pink: 'bg-pink-200 border-pink-300',
  blue: 'bg-blue-200 border-blue-300',
  // Add more colors...
};
```

### Styling

The app uses Tailwind CSS. Modify styles directly in components or extend the theme in `tailwind.config.ts`.

## Future Enhancements

- [ ] Drag and drop for reordering tasks, lists, and groups
- [ ] Task priorities and due dates
- [ ] Tags and filters
- [ ] Search functionality
- [ ] Dark mode
- [ ] Export/import data
- [ ] Cloud sync with user authentication
- [ ] Collaborative lists (multi-user support)
- [ ] Mobile app (React Native)
- [ ] Task templates
- [ ] Recurring tasks

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Responsive design

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the project repository.

---

Built with ❤️ using Next.js and TypeScript
