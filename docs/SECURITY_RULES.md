# Security Rules (Guidance)

Firestore rules should enforce:
- Only authenticated and verified users can read/write sensitive collections.
- Only event creators (`createdBy`/`organizerId`) can edit or delete their events.
- Users can only write their own `users/{uid}` document, and managers can update their profile fields.
- Likes/attendees/comments write access limited to authenticated users.

Example sketch (adapt to console):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthed() { return request.auth != null; }
    function isVerified() { return isAuthed() && request.auth.token.email_verified == true; }

    match /users/{uid} {
      allow read: if isVerified();
      allow write: if isVerified() && request.auth.uid == uid;
    }

    match /events/{eventId} {
      allow read: if true;
      allow create: if isVerified();
      allow update, delete: if isVerified() && request.resource.data.createdBy == request.auth.uid;

      match /comments/{commentId} {
        allow read: if true;
        allow create: if isVerified();
      }
      match /likes/{uid} {
        allow read, write: if isVerified() && request.auth.uid == uid;
      }
      match /attendees/{uid} {
        allow read, write: if isVerified() && request.auth.uid == uid;
      }
    }

    match /users/{uid}/favorites/{eventId} {
      allow read, write: if isVerified() && request.auth.uid == uid;
    }
  }
}
```
```