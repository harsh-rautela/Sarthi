# REST API

Base URL: `http://localhost:5000/api`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

## Profile
- `GET /profile`
- `PUT /profile`

## Schemes
- `GET /schemes?q=&category=&level=&state=&page=&limit=`
- `GET /schemes/:idOrSlug`
- `POST /schemes` admin
- `PUT /schemes/:id` admin
- `DELETE /schemes/:id` admin (soft archive)

## Recommendations
- `GET /recommendations`
- `POST /recommendations/check`

## Bookmarks
- `GET /bookmarks`
- `POST /bookmarks/:schemeId`
- `DELETE /bookmarks/:schemeId`

## Notifications
- `GET /notifications`
- `PATCH /notifications/:id/read`

## Assistant
- `POST /assistant/chat`
