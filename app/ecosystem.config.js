module.exports = {
  apps : [{
    name   : "kp-app",
    script : "node_modules/next/dist/bin/next",
    args   : "start",
    env: {
      NODE_ENV: "production",
      PORT: 3005
    }
  }]
}
