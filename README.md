### Setup

- Install dependencies: `npm install`
- Create `.env` from `.env.example`
- Run dev server: `npm run dev`
- Build + run (prod-like): `npm run build` then `npm start`
- Visit: http://localhost:3000/auth/login.html

### Auth

- Passwords are stored as bcrypt hashes (new and updated passwords).
- Login sets an `accessToken` httpOnly JWT cookie; `/teacher/*` and `/student/*` routes require it.
- Optional: if `TEACHER_REGISTRATION_TOKEN` is set, `POST /user/register-teacher` requires it (send `registrationToken` in body or `x-registration-token` header).

### API Routes

- `GET /api/health`
- `POST /user/register-teacher`
- `POST /user/login-teacher`
- `POST /user/login-student`
- `POST /user/logout`
- `GET /teacher/profile`
- `GET /teacher/students`
- `POST /teacher/students`
- `DELETE /teacher/students/:studentId`
- `PATCH /teacher/password`
- `PUT /teacher/attendance`
- `GET /teacher/attendance`
- `GET /teacher/summary`
- `GET /teacher/students/:studentId/attendance-history`
- `GET /student/profile`
- `GET /student/attendance`
- `PATCH /student/password`
