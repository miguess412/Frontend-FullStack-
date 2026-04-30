const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4200',
        supportFile: false,
        setupNodeEvents(on, config) {},
        // Configurar capturas automáticas
        screenshotOnRunFailure: true,
        video: true,
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
});