module.exports = {
  prettier: true,
  space: true,
  extends: ['xo-lass'],
  rules: {
    // Disable this rule due to compatibility issues with ESLint on Node.js 18
    'unicorn/expiring-todo-comments': 'off'
  }
};
