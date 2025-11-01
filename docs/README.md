# airelpier — FJWU Student Events Platform

This app provides role-based access for Students and Event Managers at FJWU.

Choices and assumptions:
- Email verification is mandatory before access; unverified users are signed out.
- University email must end with `.fjwu.edu.pk` (e.g., `name@cs.fjwu.edu.pk`).
- Firestore is used for all core data (users, events, comments, likes). Realtime Database is not used initially.
- Server timestamps are used for `createdAt` fields.
- Managers can create events; only event creators can edit their events (see security notes).
 - Managers must complete their Society Profile before creating events. The dashboard and Create Event page enforce this dependency.

See `FILES.md`, `DATABASE.md`, and `FUNCTIONS.md` for structure and usage.