# Contributing to DeadManPing

Thank you for your interest in contributing to DeadManPing! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## Getting Started

**Prefer using the hosted service?** [Get started at deadmanping.com](https://deadmanping.com) - no setup required.

**Want to contribute to the codebase?** Follow the setup instructions in [README.md](README.md).

## How to Contribute

### Reporting Bugs

Before reporting a bug:
1. Check if the issue already exists in the [Issues](https://github.com/DeadManPing/DeadManPing/issues) section
2. For hosted service issues, contact [support@deadmanping.com](mailto:support@deadmanping.com)

When reporting a bug, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, browser if applicable)
- Relevant logs or error messages

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) when creating an issue.

### Proposing Features

We welcome feature proposals! Before proposing:
1. Check if a similar feature request already exists
2. Consider if the feature aligns with DeadManPing's core values:
   - "Keep your cron. Keep your scripts. We only verify the result."
   - Result-aware monitoring
   - Simple integration (one curl line)

When proposing a feature:
- Describe the problem it solves
- Explain how it fits with existing functionality
- Provide use cases or examples

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) when creating an issue.

### Submitting Pull Requests

1. **Fork the repository** and create a branch from `main`
2. **Make your changes** following the code style guidelines below
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit your changes** using conventional commit messages
6. **Push to your fork** and create a Pull Request

#### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventional format
- [ ] PR description explains the changes and motivation

Use the [Pull Request template](.github/pull_request_template.md) when creating a PR.

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Avoid `any` - use `unknown` if type is truly unknown
- Define types for all function parameters and return values
- Use `as const` for readonly values
- Follow existing patterns in the codebase

### React / Next.js

- Use Server Components by default (Next.js 15 App Router)
- Client Components only when needed (`'use client'`)
- Component naming: PascalCase
- Props: TypeScript interfaces
- Prefer existing components over creating new ones

### File Naming

- Components: `PascalCase.tsx` (e.g., `MonitorDetail.tsx`)
- Utilities: `camelCase.ts` (e.g., `payload-validator.ts`)
- API Routes: `route.ts` in endpoint folder
- Pages: `page.tsx` for routes

### Code Organization

- Components: `components/`
- Utilities: `lib/`
- Hooks: `hooks/`
- Types: `lib/types/` or locally in file

### API Routes

- Always use `errorResponse` and `successResponse` from `lib/api/response`
- Always validate input (Zod schemas)
- Always handle errors (try/catch)
- Use `checkRateLimit` for public endpoints
- Set `export const dynamic = 'force-dynamic'` for dynamic routes

### Database Queries

- Use Supabase client from `lib/supabase/admin` or `lib/supabase/client`
- Always handle errors
- Use parameterized queries (Supabase handles this)

## Testing Guidelines

- Manual testing for new features
- API testing via curl/Postman
- Test edge cases and error scenarios
- Verify backward compatibility

## Commit Message Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(monitors): add payload validation rules

Add support for custom payload validation rules with multiple fields.
Users can now define up to 5 validation rules per monitor.

Closes #123
```

```
fix(alerts): prevent duplicate alert emails

Fix issue where multiple alerts were sent for the same monitor failure.
Added 24h cooldown period between alerts of the same type.

Fixes #456
```

## Questions?

- Check existing [Issues](https://github.com/DeadManPing/DeadManPing/issues)
- Use the [Question template](.github/ISSUE_TEMPLATE/question.md)
- Contact [support@deadmanping.com](mailto:support@deadmanping.com) for hosted service questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

