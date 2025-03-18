BlogSphere :rocket:

A modern blog platform with social features and robust content management. Built with TypeScript, Prisma, and PostgreSQL.

== Features ==

- User Authentication (OAuth + Email/Password)
- Rich text editor with Markdown support
- Social interactions (comments, likes, follows)
- Tag and category management
- Real-time notifications system
- Responsive mobile-first design

== Getting Started ==

**_ Prerequisites _**

- Node.js 18+
- PostgreSQL 14+
- Redis (for session management)

**_ Installation _**

# Clone repository

git clone https://github.com/yourusername/blogsphere.git

# Install dependencies

npm install

# Set up environment variables

cp .env.example .env

# Database setup

npx prisma migrate dev --name init

== Configuration ==
Configure your .env file:
DATABASE_URL="postgresql://user:password@localhost:5432/blogsphere"
NEXTAUTH_SECRET="your-secure-key"
GITHUB_CLIENT_ID="your-github-id"
GITHUB_CLIENT_SECRET="your-github-secret"

== API Documentation ==

| Endpoint        | Method | Description          |
| --------------- | ------ | -------------------- |
| /api/users      | GET    | List all users       |
| /api/posts      | POST   | Create new blog post |
| /api/comments   | POST   | Add comment to post  |
| /api/categories | GET    | List all categories  |

Example Request:
fetch('/api/posts')
.then(response => response.json())
.then(data => console.log(data));

== Contributing ==

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit changes (git commit -m 'Add some amazing feature')
4. Push to branch (git push origin feature/amazing-feature)
5. Open a Pull Request

== License ==
Distributed under the MIT License. See LICENSE for more information.

== Summary ==
BlogSphere is a full-stack blogging platform combining modern web technologies with social networking features. It offers secure authentication, real-time updates, and comprehensive content management tools with TypeScript, Prisma, and PostgreSQL at its core.
