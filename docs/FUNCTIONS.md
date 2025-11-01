# Functions & Usage Notes

- `isValidFjwuEmail(email: string): boolean`
  - Ensures email ends with `.fjwu.edu.pk` (subdomains allowed).
  - Usage: Signup client-side validation.

- `AuthContext` exports
  - `signup({ firstName, lastName, email, department, semester, password, role })`
    - Creates Firebase Auth user.
    - Saves profile into `users/{uid}` with `createdAt` and `profileComplete`.
    - Sends email verification, signs out, sets message.
  - `login({ email, password, role })`
    - Signs in, enforces `emailVerified`.
    - Loads `users/{uid}` and enforces role match; otherwise signs out.
  - `logout()`
    - Signs out current user.

- Firestore interactions
  - Event creation: `addDoc(collection(db, 'events'), {...})`
  - Likes: `setDoc(doc(db, 'events', eventId, 'likes', uid), { uid })` or delete.
  - Favorites: `setDoc(doc(db, 'users', uid, 'favorites', eventId), { eventId })` or delete.
  - Comments: `addDoc(collection(db, 'events', eventId, 'comments'), { uid, text, createdAt })`.
  - RSVP: `addDoc(collection(db, 'events', eventId, 'attendees'), { uid, createdAt })` + `updateDoc(events/{id}, { attendeesCount: increment(1) })`.