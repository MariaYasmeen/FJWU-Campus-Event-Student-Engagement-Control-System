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

New/Updated
- `/society/:uid`: Society Profile page; circular logo, name, description, and grid/list of that society’s events.
- `/manager/your-events`: Manager list/table view of created events.
- `/manager/analytics`: Manager analytics placeholder.
- `/manager/settings`: Manager settings placeholder.
- `/manager/announcements`: Manager announcements placeholder; fixed announcements rail remains visible on layout.

Notes
- All student and manager routes are protected (auth required).
- Student and Manager dashboards share a fixed Navbar, Left Sidebar, and a fixed Announcements rail on the right; only the central content scrolls.
- Sidebar buttons now use router links and navigate correctly across student/manager panels (placeholders exist where content is pending).