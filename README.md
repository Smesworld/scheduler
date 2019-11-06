# Interview Scheduler

Interview Scheduler uses React to render a page displaying, creating, removing, and editing interviews. It uses a webpack server to serve pages, maintain state, and make calls to a postgres server to persist the data. This implementation takes advantage of web-sockets to ensure all users are updated with changes made by others.

## Setup

Install dependencies with `npm install`.

## Running Webpack Development Server

```sh
npm start
```

## Running Jest Test Framework

```sh
npm test
```

## Running Storybook Visual Testbed

```sh
npm run storybook
```

## Dependencies

- Axios 0.19.0
- Classnames 2.2.6
- Normalize.css 8.0.1
- React 16.9.0
- React-dom 16.9.0
- React-scripts 3.0.0
