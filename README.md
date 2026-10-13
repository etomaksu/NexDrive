# Team Web App Workflow: VS Code + GitHub

Oct 13, 2026 · @master

## 1. One-time setup

One person creates the repo; everyone else clones it and works from VS Code.

- One person creates the repo on GitHub and adds everyone as collaborators (Settings → Collaborators).
- Everyone clones it with `git clone <repo-url>`, then opens the folder in VS Code.
- Keep the structure simple, for example `/client` (React) and `/server` (Node/Express) in one repo.
- Add a `.gitignore` (at least `node_modules/` and `.env`) and a `README.md` with setup steps.
- Never commit `.env` files. Share secrets privately and commit a `.env.example` instead.
- Install the **GitHub Pull Requests** and **GitLens** extensions in VS Code.

## 2. Branching

`main` always holds working code, and nobody commits to it directly.

- Optionally add a `dev` branch where features merge first, then merge `dev` into `main` when stable.
- Each task gets its own branch, named by type and topic:
  - `feature/login-page`
  - `feature/user-api`
  - `fix/navbar-overflow`

## 3. Daily loop for each person

Every task follows the same seven steps, from sync to merge.

1. Sync before starting: `git checkout dev`, then `git pull`.
2. Create your branch: `git checkout -b feature/login-page`.
3. Code, and commit small and often: `git add .`, then `git commit -m "Add login form validation"`.
4. Push: `git push -u origin feature/login-page`.
5. Open a **Pull Request** on GitHub into `dev`.
6. A teammate reviews it, comments, and approves.
7. Merge, delete the branch, and everyone pulls the updated `dev`.

If your branch falls behind, run `git pull origin dev` on your branch and fix any conflicts in VS Code. Its merge editor offers Accept Current, Accept Incoming, and Accept Both.

## 4. Team rules that prevent problems

A few shared habits avoid most merge pain.

- **Protect `main`** (Settings → Branches): require a pull request and at least 1 approval.
- **One task, one branch, one PR.** Keep PRs small so they are easy to review.
- **Pull before you push**, and pull again before you start work each day.
- **Write useful commit messages** that say what changed ("Add POST /api/users route"), not "update" or "fix".
- **Use GitHub Issues and a Projects board** (To Do / In Progress / Review / Done). Assign each issue to one person.

## 5. Splitting work by role

Agree on the API contract first, so frontend and backend never block each other.

| Role | Responsibility |
| --- | --- |
| Backend | Builds API routes and database models; documents each endpoint (method, URL, request body, response) in the README or an issue |
| Frontend | Builds against the agreed contract, using mock data until the endpoint is ready |
| UI/UX designers | Share Figma links in issues; open PRs for assets or CSS tweaks; comment on frontend PRs to check the UI matches the design |

## 6. Useful VS Code features

These built-in tools and extensions cover most of the Git work.

- **Source Control panel** (Ctrl+Shift+G) for stage, commit, push and pull.
- **Live Share** extension for pair programming or debugging together.
- **Prettier + ESLint** with a shared config committed to the repo, so everyone's code style matches.
- **Integrated terminal** (Ctrl+` ) with  `npm run dev\` for the client and server running side by side.
