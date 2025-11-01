# Routes & Pages

- `/login`: Email/password login with Student/Manager tabs.
- `/signup`: Signup; collects profile data and role.
- `/`: Landing; shows “You are logged in” then redirects to home.
- `/student`: Student home feed.
- `/manager`: Manager home feed; extras shown, plus “Create Profile” when incomplete.
- `/manager/profile`: Manager profile creation.
- `/manager/create-event`: Event creation form.
   - Requires manager `profileComplete === true`. If not, the page displays an action to create the Society Profile first.
- `/events/:id`: Event detail: description, venue, time, RSVP, comments, share.