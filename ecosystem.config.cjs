module.exports = {
  apps: [
    {
      name: 'portos-server',
      script: 'server/index.js',
      cwd: __dirname,
      interpreter: 'node',
      env: {
        NODE_ENV: 'development',
        PORT: 5554,
        HOST: '127.0.0.1'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5554,
        HOST: '127.0.0.1'
      },
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'portos-client',
      script: 'node_modules/.bin/vite',
      cwd: `${__dirname}/client`,
      args: '--host 127.0.0.1 --port 5555',
      env: {
        NODE_ENV: 'development'
      },
      watch: false
    }
  ]
};
