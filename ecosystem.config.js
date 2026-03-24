module.exports = {
  apps: [
    {
      name: "card-app",
      script: "npm",
      args: "start",
      cwd: "./",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
