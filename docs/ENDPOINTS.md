# Routes & Pages

- `/login`: Email/password login with Student/Manager tabs.
- `/signup`: Signup; collects profile data and role.
- `/`: Landing; shows “You are logged in” then redirects to home.
- `/student`: Student Home (Upcoming events, announcements).
- `/student/events`: All Events (approved and upcoming).
- `/student/favourites`: Saved Events.
- `/student/registrations`: My Registrations.
- `/student/community`: Community/Discussions (optional).
- `/student/profile`: Student Profile.
- `/student/settings`: Settings (optional).
- `/student/search`: Detailed filters (department, type, category, date, location, status) with dynamic results.
- `/manager`: Manager home feed; extras shown, plus “Create Profile” when incomplete.
- `/manager/profile`: Manager profile creation.
- `/manager/create-event`: Event creation form.
   - Requires manager `profileComplete === true`. If not, the page displays an action to create the Society Profile first.
- `/events/:id`: Event detail: description, venue, time, RSVP, comments, share.
 - `/manager/favourites`: Manager saved posts.

Notes
- All student and manager routes are protected (auth required).
- Student and Manager dashboards share a fixed Navbar and Left Sidebar; only the central content scrolls.