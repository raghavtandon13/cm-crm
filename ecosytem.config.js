module.exports = {
    apps: [
        {
            name: "server",
            script: "server.js",
            cwd: "/home/ec2-user/crm/current",
            env: {
                NODE_ENV: "production",
                HOST: "127.0.0.1",
                PORT: 3000,
            },
        },
    ],
};
