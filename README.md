### Setup

- Install dependencies: `npm install`
- Create `.env` from `.env.example`
- Run dev server: `npm run dev`
- Visit: http://localhost:3000/auth/login.html

### API Routes

- `GET /api/health`
- `POST /user/register-teacher`
- `POST /user/login-teacher`
- `POST /user/login-student`
- `POST /user/logout`
- `GET /teacher/:teacherId/students`
- `POST /teacher/:teacherId/students`
- `DELETE /teacher/:teacherId/students/:studentId`
- `PUT /teacher/:teacherId/attendance`
- `GET /teacher/:teacherId/attendance`
- `GET /teacher/:teacherId/summary`
- `GET /student/:studentId/attendance`
- `PATCH /student/:studentId/password`
