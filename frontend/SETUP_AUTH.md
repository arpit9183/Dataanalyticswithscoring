# Adding accounts and History to the backend

The folder `backend/` here mirrors your own. Copy each file into the same place in your repo.
`upload.py` and `main.py` REPLACE yours. If you changed them yourself, merge instead of replacing.

| File | New or replaced |
|---|---|
| app/core/security.py | new (password hashing, login tokens) |
| app/core/deps.py | new (who is signed in) |
| app/core/scoring.py | new (the weighted score) |
| app/models/user.py | new (users table) |
| app/models/batch.py | replaced (adds user_id and scoring_result) |
| app/routers/auth.py | new (sign up, sign in, sign out, me) |
| app/routers/batches.py | new (History) |
| app/routers/upload.py | replaced |
| app/main.py | replaced |

## Steps (from the backend folder, with (venv) showing)

1. Install the three new packages and save them:

       pip install argon2-cffi PyJWT email-validator
       pip freeze > requirements.txt

2. Make a secret key and add it to `backend/.env` (never commit this file):

       python -c "import secrets; print(secrets.token_urlsafe(32))"

   Then add these lines to `.env`, pasting your key:

       SECRET_KEY=paste-the-long-string-here
       FRONTEND_ORIGIN=http://localhost:5173

   Add the same two names, with empty values, to `.env.example`.

3. Start the server once so it creates the `users` table:

       uvicorn app.main:app --reload

   `create_all` only creates tables that are missing. It never changes a table that
   already exists, so `batches` still has its old columns.

4. Add the two new columns to `batches` (stop the server first, or use a second terminal):

       psql dq_monitor

       ALTER TABLE batches ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
       ALTER TABLE batches ADD COLUMN scoring_result JSON;
       CREATE INDEX ix_batches_user_id ON batches (user_id);
       \q

   Old rows keep working. They just belong to nobody, so they won't show in anyone's History.
   If you don't need the old rows, `DROP TABLE batches;` and restarting also works.

5. Restart the server and open http://localhost:8000/docs. You should see /auth/signup,
   /auth/login, /auth/logout, /auth/me, /batches and /upload.
