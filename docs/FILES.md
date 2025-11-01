# Files Created

- `/app/src/firebase.js`: Initializes Firebase app; exports `auth`, `db`, and `storage`.
- `/app/src/context/AuthContext.jsx`: Signup/login, email verification enforcement, role checking, profile loading.
- `/app/src/utils/validators.js`: `isValidFjwuEmail(email)` for domain validation.
- `/app/src/routes/ProtectedRoute.jsx`: Guards routes and redirects to `/login` if unauthenticated.
- `/app/src/pages/Login.jsx`: Role-tabbed login form.
- `/app/src/pages/Signup.jsx`: Role-tabbed signup form with profile collection save.
- `/app/src/pages/Landing.jsx`: Post-login confirmation and redirect.
- `/app/src/components/Navbar.jsx`: Logo, search, icons, manager-only plus.
- `/app/src/components/Sidebar.jsx`: Base sidebar content (filters, manager extras).
- `/app/src/components/LeftSidebar.jsx`: Fixed left rail wrapper shared by Student and Manager layouts.
- `/app/src/components/EventFeed.jsx`: Loads events newest→oldest; supports search and filters.
- `/app/src/components/EventCard.jsx`: Displays event summaries with Like/Share/Save actions.
- `/app/src/components/PostCard.jsx`: Alias of EventCard for universal post naming.
- `/app/src/components/PostDescription.jsx`: Reusable description/meta section used on Event Detail.
- `/app/src/pages/StudentHome.jsx`: Main student feed.
- `/app/src/pages/ManagerHome.jsx`: Same feed + manager tools and prompts.
- `/app/src/pages/ManagerProfile.jsx`: Manager profile form; sets `profileComplete`.
- `/app/src/pages/CreateEvent.jsx`: Create event form; gated by `profileComplete`; saves to `events` with server timestamps.
- `/app/src/pages/EventDetail.jsx`: Full event detail with RSVP, add to calendar, share, contact, comments.
- `/app/tailwind.config.js`, `/app/postcss.config.js`, `/app/src/index.css`: Tailwind v3 setup and base styles.
 
## Utilities
- `/app/src/utils/storage.js`: File upload helper; uploads to Firebase Storage and returns download URL.