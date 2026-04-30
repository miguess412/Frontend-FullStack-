// cypress/e2e/isp-manager.cy.js
// Pruebas End-to-End (E2E) para ISP-Manager

describe('ISP-Manager - Pruebas End-to-End', () => {
    
    // ============================================
    // PRUEBA 1: Login de Administrador
    // ============================================
    describe('1. Login de Administrador', () => {
        it('Debería iniciar sesión correctamente', () => {
            // Visitar la página de login
            cy.visit('http://localhost:4200/login');
            
            // Verificar que estamos en la página correcta
            cy.url().should('include', '/login');
            
            // Ingresar credenciales
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('admin123');
            
            // Hacer clic en el botón de login
            cy.get('button[type="submit"]').click();
            
            // Verificar que redirige al dashboard de admin
            cy.url().should('include', '/admin/dashboard');
            
            // Verificar que se ve el mensaje de bienvenida
            cy.contains('Bienvenido, Administrador').should('be.visible');
        });
    });
    
    // ============================================
    // PRUEBA 2: Login de Cliente
    // ============================================
    describe('2. Login de Cliente', () => {
        it('Debería iniciar sesión y redirigir al dashboard de cliente', () => {
            cy.visit('http://localhost:4200/login');
            
            cy.get('input[name="email"]').type('cliente@test.com');
            cy.get('input[name="password"]').type('cliente123');
            cy.get('button[type="submit"]').click();
            
            cy.url().should('include', '/cliente/dashboard');
            cy.contains('Mi ISP - Área de Cliente').should('be.visible');
        });
    });
    
    // ============================================
    // PRUEBA 3: Login fallido
    // ============================================
    describe('3. Login con credenciales incorrectas', () => {
        it('Debería mostrar mensaje de error', () => {
            cy.visit('http://localhost:4200/login');
            
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('contraseña_mal');
            cy.get('button[type="submit"]').click();
            
            // Verificar que aparece mensaje de error
            cy.contains('Credenciales incorrectas').should('be.visible');
            
            // Verificar que NO redirige al dashboard
            cy.url().should('include', '/login');
        });
    });
    
    // ============================================
    // PRUEBA 4: Cerrar sesión
    // ============================================
    describe('4. Cerrar sesión', () => {
        it('Debería cerrar sesión y redirigir al login', () => {
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('admin123');
            cy.get('button[type="submit"]').click();
            
            // Esperar a que cargue el dashboard
            cy.url().should('include', '/admin/dashboard');
            
            // Hacer clic en cerrar sesión
            cy.contains('Cerrar Sesión').click();
            
            // Verificar que redirige al login
            cy.url().should('include', '/login');
        });
    });
    
    // ============================================
    // PRUEBA 5: CRUD de Clientes
    // ============================================
    describe('5. CRUD de Clientes', () => {
        
        beforeEach(() => {
            // Login como admin antes de cada prueba
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('admin123');
            cy.get('button[type="submit"]').click();
            cy.url().should('include', '/admin/dashboard');
            
            // Navegar a gestión de clientes
            cy.contains('Gestionar Clientes').click();
            cy.url().should('include', '/admin/clientes');
        });
        
        it('5.1 Crear nuevo cliente', () => {
            // Hacer clic en botón Nuevo Cliente
            cy.contains('Nuevo Cliente').click();
            
            // Llenar el formulario
            cy.get('input[name="nombre"]').type('Cliente E2E Test');
            cy.get('input[name="email"]').type('e2e@test.com');
            cy.get('input[name="password"]').type('123456');
            cy.get('input[name="telefono"]').type('3112223344');
            cy.get('input[name="direccion"]').type('Calle E2E 123');
            cy.get('input[name="ciudad"]').type('Bogotá');
            cy.get('select[name="plan_id"]').select('Plan Básico');
            
            // Guardar cliente
            cy.contains('Guardar').click();
            
            // Verificar que el cliente aparece en la tabla
            cy.contains('Cliente E2E Test').should('be.visible');
        });
        
        it('5.2 Editar cliente', () => {
            // Buscar el cliente creado y hacer clic en editar (lápiz)
            cy.contains('Cliente E2E Test')
                .parent('tr')
                .within(() => {
                    cy.get('.btn-warning').click();
                });
            
            // Modificar datos
            cy.get('input[name="nombre"]').clear().type('Cliente E2E Modificado');
            cy.get('input[name="telefono"]').clear().type('3198765432');
            
            // Guardar cambios
            cy.contains('Guardar').click();
            
            // Verificar que se actualizó
            cy.contains('Cliente E2E Modificado').should('be.visible');
        });
        
        it('5.3 Eliminar cliente', () => {
            // Confirmar eliminación (cypress maneja el confirm automáticamente)
            cy.contains('Cliente E2E Modificado')
                .parent('tr')
                .within(() => {
                    cy.get('.btn-danger').click();
                });
            
            // Verificar que ya no está en la tabla
            cy.contains('Cliente E2E Modificado').should('not.exist');
        });
    });
    
    // ============================================
    // PRUEBA 6: Dashboard - Ver estadísticas
    // ============================================
    describe('6. Dashboard de Administrador', () => {
        beforeEach(() => {
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('admin123');
            cy.get('button[type="submit"]').click();
        });
        
        it('Debería mostrar las tarjetas de estadísticas', () => {
            // Verificar que se ven las tarjetas
            cy.contains('Clientes').should('be.visible');
            cy.contains('Facturas Pagadas').should('be.visible');
            cy.contains('Pendientes').should('be.visible');
            cy.contains('Tickets').should('be.visible');
        });
        
        it('Debería mostrar la tabla de últimos clientes', () => {
            cy.contains('Últimos Clientes').should('be.visible');
            cy.get('table').first().should('be.visible');
        });
    });
    
    // ============================================
    // PRUEBA 7: Dashboard de Cliente
    // ============================================
    describe('7. Dashboard de Cliente', () => {
        it('Debería mostrar el plan y facturas del cliente', () => {
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('cliente@test.com');
            cy.get('input[name="password"]').type('cliente123');
            cy.get('button[type="submit"]').click();
            
            // Verificar elementos del dashboard de cliente
            cy.contains('Mi Plan Actual').should('be.visible');
            cy.contains('Próximo Pago').should('be.visible');
            cy.contains('Mis Tickets').should('be.visible');
            cy.contains('Mis Facturas').should('be.visible');
        });
    });
});