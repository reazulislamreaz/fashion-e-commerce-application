module.exports = {
  apps: [
    {
      name: 'easy-fashion-backend',
      cwd: './backend',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 9978,
      },
    },
    {
      name: 'easy-fashion-frontend',
      cwd: './frontend',
      script: '.next/standalone/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 9977,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
