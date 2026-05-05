// cypress/e2e/isp-manager.cy.js
// Pruebas End-to-End (E2E) para ISP-Manager

describe('ISP-Manager - Pruebas End-to-End', () => {
    
    // ============================================
    // 1. Login de Administrador
    // ============================================
    describe('1. Login de Administrador', () => {
        it('Debería iniciar sesión correctamente', () => {
            cy.visit('http://localhost:4200/login');
            cy.url().should('include', '/login');
            
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('admin123');
            cy.get('button[type="submit"]').click();
            
            cy.url().should('include', '/admin/dashboard');
            cy.contains('Bienvenido, Administrador').should('be.visible');
        });
    });
    
    // ============================================
    // 2. Login de Cliente
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
    // 3. Login con credenciales incorrectas
    // ============================================
    describe('3. Login con credenciales incorrectas', () => {
        it('Debería mostrar mensaje de error', () => {
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('contraseña_mal');
            cy.get('button[type="submit"]').click();
            
            // Buscar cualquier elemento que contenga el texto de error
            cy.contains('Credenciales incorrectas', { timeout: 10000 }).should('be.visible');
            
            cy.url().should('include', '/login');
        });
    });
        
    // ============================================
    // 4. Cerrar sesión
    // ============================================
    describe('4. Cerrar sesión', () => {
        it('Debería cerrar sesión y redirigir al login', () => {
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('admin123');
            cy.get('button[type="submit"]').click();
            cy.url().should('include', '/admin/dashboard');
            cy.contains('Cerrar Sesión').click();
            cy.url().should('include', '/login');
        });
    });
    
    // ============================================
    // 5. Dashboard - Gráficas (NUEVO)
    // ============================================
    describe('5. Dashboard de Administrador - Gráficas', () => {
        beforeEach(() => {
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('admin123');
            cy.get('button[type="submit"]').click();
        });
        
        it('5.1 Debería mostrar las tarjetas de estadísticas', () => {
            cy.contains('Clientes').should('be.visible');
            cy.contains('Facturas Pagadas').should('be.visible');
            cy.contains('Pendientes').should('be.visible');
            cy.contains('Tickets').should('be.visible');
        });
        
        it('5.2 Debería mostrar el gráfico de líneas (evolución de facturas)', () => {
            cy.contains('Evolución de Facturas').should('be.visible');
            cy.get('canvas').first().should('be.visible');
        });
        
        it('5.3 Debería mostrar el gráfico de pastel (planes populares)', () => {
            cy.contains('Planes Populares').should('be.visible');
            cy.get('canvas').eq(1).should('be.visible');
        });
    });
    
    // ============================================
    // 6. Reportes PDF (NUEVO)
    // ============================================
    describe('6. Reportes PDF', () => {
        beforeEach(() => {
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('admin123');
            cy.get('button[type="submit"]').click();
        });
        
        it('6.1 Debería exportar clientes a PDF', () => {
            cy.contains('Exportar Clientes a PDF').click();
            // Verificar que se genera la descarga (no podemos verificar el archivo, pero sí que no hay error)
            cy.wait(2000);
        });
        
        it('6.2 Debería exportar facturas a PDF', () => {
            cy.contains('Exportar Facturas a PDF').click();
            cy.wait(2000);
        });
    });
    
    // ============================================
    // 7. CRUD de Clientes
    // ============================================
    // 7. CRUD Clientes - CORREGIDO
    describe('7. CRUD de Clientes', () => {
        beforeEach(() => {
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('admin@ispmanager.com');
            cy.get('input[name="password"]').type('admin123');
            cy.get('button[type="submit"]').click();
            cy.contains('Ir a Gestión de Clientes').click();
            cy.url().should('include', '/admin/clientes');
        });
        
        it('7.1 Crear nuevo cliente', () => {
            cy.contains('Nuevo Cliente').click();
            
            cy.get('#clienteModal').should('be.visible');
            
            cy.get('#clienteModal').within(() => {
                // Ver cuántos inputs nombre hay
                cy.get('input[name="nombre"]').then(($inputs) => {
                    console.log('Cantidad de inputs con name="nombre":', $inputs.length);
                    $inputs.each((i, el) => {
                        console.log(`Input ${i}:`, el.outerHTML);
                    });
                });
                
                // Escribir y verificar carácter por carácter
                const nombre = 'Cliente E2E Test';
                cy.get('input[name="nombre"]').then(($input) => {
                    console.log('Valor ANTES de escribir:', $input.val());
                });
                
                cy.get('input[name="nombre"]').type(nombre);
                
                cy.get('input[name="nombre"]').then(($input) => {
                    console.log('Valor DESPUÉS de escribir:', $input.val());
                    console.log('Longitud:', $input.val().length);
                });
                
                cy.get('input[name="email"]').type('e2e@test.com');
                cy.get('input[name="password"]').eq(0).type('123456');
                cy.get('input[name="telefono"]').type('3112223344');
                cy.get('input[name="direccion"]').type('Calle E2E 123');
                cy.get('input[name="ciudad"]').type('Bogotá');
                cy.get('select[name="plan_id"]').select('1');
                cy.contains('Guardar').click();
            });

            cy.wait(2000);
            cy.reload();

            // Ver el nombre guardado en la tabla
            cy.get('table').contains('td', 'Cliente').then(($el) => {
                console.log('Nombre guardado en BD:', $el.text());
            });
        });

        it('7.2 Editar cliente', () => {
            cy.reload();
            
            cy.contains('td', 'Cliente')
                .parent('tr')
                .within(() => {
                    cy.get('.btn-warning').click();
                });
            
            cy.get('#clienteModal', { timeout: 5000 }).should('be.visible');
            
            cy.get('#clienteModal').within(() => {
                // Usar invoke en lugar de type
                cy.get('input[name="nombre"]')
                    .clear()
                    .invoke('val', 'E2EModif')
                    .trigger('input')
                    .trigger('change');
                
                cy.get('input[name="telefono"]')
                    .clear()
                    .invoke('val', '3198765432')
                    .trigger('input');
                
                cy.contains('Guardar').click();
            });
            
            cy.wait(2000);
            cy.reload();
            cy.contains('E2EModif').should('be.visible');
        });

        it('7.3 Eliminar cliente', () => {
            cy.reload();
            
            cy.contains('td', 'E2EM')
                .parent('tr')
                .within(() => {
                    cy.get('.btn-danger').click();
                });
            
            cy.on('window:confirm', () => true);
            cy.wait(2000);
            cy.reload();
            cy.contains('E2EModif').should('not.exist');
        });
    });
    
    // ============================================
    // 8. Tickets de Soporte - Cliente 
    // ===========================================
    describe('8. Tickets de Soporte - Cliente', () => {
        beforeEach(() => {
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('cliente@test.com');
            cy.get('input[name="password"]').type('cliente123');
            cy.get('button[type="submit"]').click();
            cy.contains('Gestionar Tickets').click();
            cy.url().should('include', '/cliente/tickets');
        });
        
        it('8.1 Crear nuevo ticket', () => {
            cy.contains('Nuevo Ticket').click();
            
            cy.intercept('POST', '/api/tickets/crear').as('crearTicket');
            
            cy.get('.modal:visible', { timeout: 5000 }).should('be.visible');
            
            cy.get('.modal:visible').within(() => {
                // Asignar valor directamente sin tipear
                cy.get('input[name="asunto"]')
                    .invoke('val', 'Problema de velocidad E2E')
                    .trigger('input')
                    .trigger('change');
                
                cy.get('textarea[name="descripcion"]')
                    .invoke('val', 'La velocidad no alcanza los 50 Mbps')
                    .trigger('input');
                
                cy.get('select[name="prioridad"]').select('alta');
                cy.contains('Crear Ticket').click();
            });
            
            cy.wait('@crearTicket', { timeout: 5000 });
            cy.wait(2000);
            cy.reload();
            cy.contains('Problema de velocidad E2E').should('be.visible');
        });
        
        it('8.2 Ver detalle del ticket', () => {
            cy.reload();
            
            cy.contains('Problema de velocidad E2E')
                .parent('tr')
                .within(() => {
                    cy.get('.btn-info').click();
                });
            
            cy.get('.modal:visible', { timeout: 5000 }).should('be.visible');
            cy.contains('Detalle del Ticket').should('be.visible');
            
            // Cerrar el modal
            cy.get('.modal:visible .btn-secondary').click();
        });
    });
    
    // ============================================
    // 9. Tickets de Soporte - Administrador 
    // ============================================
    describe('9. Tickets de Soporte - Administrador', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200/login');
        cy.get('input[name="email"]').type('admin@ispmanager.com');
        cy.get('input[name="password"]').type('admin123');
        cy.get('button[type="submit"]').click();
        // Navegar haciendo clic en el botón, no con visit()
        cy.contains('Gestionar Tickets').click();
        cy.url().should('include', '/admin/tickets');
    });
    
    it('9.1 Ver lista de tickets', () => {
        cy.contains('Todos los Tickets de Soporte').should('be.visible');
        cy.get('table').should('be.visible');
    });
    
    it('9.2 Ver detalle del ticket', () => {
        cy.get('tbody tr').first().within(() => {
            cy.get('.btn-info').click();
        });
        cy.contains('Detalle del Ticket').should('be.visible');
        cy.get('.btn-secondary').click();
    });
    
    it('9.3 Cambiar estado del ticket', () => {
        cy.get('tbody tr').first().within(() => {
            cy.get('.btn-success').click();
        });
        cy.get('.modal:visible select').select('en_proceso');
        cy.get('.modal:visible').contains('Actualizar').click();
    });
});
    
    // ============================================
    // 10. Dashboard de Cliente (Facturas y Plan)
    // ============================================
    describe('10. Dashboard de Cliente', () => {
        beforeEach(() => {
            cy.visit('http://localhost:4200/login');
            cy.get('input[name="email"]').type('cliente@test.com');
            cy.get('input[name="password"]').type('cliente123');
            cy.get('button[type="submit"]').click();
        });
        
        it('10.1 Debería mostrar el plan actual', () => {
            cy.contains('Mi Plan Actual').should('be.visible');
            cy.contains('Velocidad').should('be.visible');
            cy.contains('Precio').should('be.visible');
        });
        
        it('10.2 Debería mostrar las facturas', () => {
            cy.contains('Mis Facturas').should('be.visible');
            cy.get('table').should('be.visible');
        });
    });
});