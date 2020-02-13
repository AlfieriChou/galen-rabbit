module.exports = {
  '*.{ts,js}': [
    'eslint . --ext .ts,.js --fix',
    'git add',
  ],
};
