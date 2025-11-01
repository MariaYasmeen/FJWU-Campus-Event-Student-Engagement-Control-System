# Database Schema — Events

- Collection `events`
  - `title`: string
  - `description`: string
  - `eventCategory`: string (one of: Seminar, Workshop, Sports, Cultural, Academic, Competition)
  - `eventType`: string (Online | Offline | Hybrid)
  - `eventDate`: Firestore Timestamp or ISO date string
  - `startTime`: string (HH:mm)
  - `endTime`: string (HH:mm)
  - `duration`: number (minutes)
  - `venue`: string
  - `campus`: string (optional)
  - `locationLink`: string (optional)
  - `registrationDeadline`: Firestore Timestamp or ISO date string
  - `isRegistrationRequired`: boolean
  - `registrationLink`: string (optional)
  - `registrationFee`: number (optional)
  - `maxParticipants`: number (optional)
  - `posterURL`: string (image URL or uploaded file URL)
  - `brochureLink`: string (optional)
  - `organizerId`: string (creator UID)
  - `organizerName`: string
  - `organizerDepartment`: string (optional)
  - `organizerEmail`: string
  - `organizerContact`: string (email or phone)
  - `visibility`: string (public | private)
  - `status`: string (Published | Draft | Cancelled)
  - `approvalStatus`: string (default: pending)
  - `tags`: string[] (optional)
  - `attendeesCount`: number (aggregate)
  - `dateTime`: string (ISO shortcut built from `eventDate` + `startTime`)
  - `createdBy`: string (manager UID)
  - `createdAt`: Firestore Timestamp
  - `updatedAt`: Firestore Timestamp

Example document in `events`:

```
{
  "title": "Women In Tech Seminar",
  "description": "Join us for a talk on innovation and leadership.",
  "eventCategory": "Seminar",
  "eventType": "Offline",
  "eventDate": "2025-11-30T00:00:00.000Z",
  "startTime": "14:00",
  "endTime": "16:00",
  "duration": 120,
  "venue": "Auditorium A",
  "campus": "Main Campus",
  "locationLink": "https://maps.google.com/?q=Auditorium+A",
  "registrationDeadline": "2025-11-28T00:00:00.000Z",
  "isRegistrationRequired": true,
  "registrationLink": "https://forms.gle/abc123",
  "registrationFee": 0,
  "maxParticipants": 200,
  "posterURL": "https://example.com/posters/tech.jpg",
  "brochureLink": "https://example.com/brochures/tech.pdf",
  "organizerId": "uid_manager_123",
  "organizerName": "Tech Society",
  "organizerDepartment": "Computer Science",
  "organizerEmail": "tech.society@fjwu.edu.pk",
  "organizerContact": "tech.society@fjwu.edu.pk",
  "visibility": "public",
  "status": "Published",
  "approvalStatus": "pending",
  "tags": ["innovation", "leadership"],
  "attendeesCount": 0,
  "dateTime": "2025-11-30T14:00:00.000Z",
  "createdBy": "uid_manager_123",
  "createdAt": {"seconds": 1762000000, "nanoseconds": 0},
  "updatedAt": {"seconds": 1762000000, "nanoseconds": 0}
}
```

Notes
- Keep existing collections (e.g., `users`, `events/*/comments`, `events/*/likes`, `events/*/attendees`) unchanged.
- Collections are created automatically on first document write.