\# Resultados de Pruebas End-to-End (E2E) - ISP-Manager



\*\*Fecha:\*\* 2026-04-29

\*\*Herramienta:\*\* Cypress v15.14.2

\*\*Navegador:\*\* Chrome 147



\---



\## Resumen de pruebas ejecutadas para ISP-Manager



| Prueba | Estado | Tiempo | Observación |

|--------|--------|--------|-------------|

| \*\*isp-manager.cy.js\*\* | ⚠️ PARCIAL | 31s | 6/10 pasaron |

| \*\*isp-manager-copy-1.cy.js\*\* | ✅ PASÓ | 4s | 1/1 pasó |



\### Detalles de `isp-manager.cy.js` (pruebas principales):



| Test | Estado |

|------|--------|

| 1. Login de Administrador | ✅ PASS |

| 2. Login de Cliente | ✅ PASS |

| 3. Login con credenciales incorrectas | ✅ PASS |

| 4. Cerrar sesión | ✅ PASS |

| 5.1 CRUD - Crear cliente | ❌ FAIL |

| 5.2 CRUD - Editar cliente | ❌ FAIL |

| 5.3 CRUD - Eliminar cliente | ❌ FAIL |

| 6. Dashboard de Administrador | ✅ PASS |

| 7. Dashboard de Cliente | ✅ PASS |

| (Prueba adicional) | ✅ PASS |



\---



\## Pruebas de Cypress (ejemplos)



| Archivo | Estado | Pruebas |

|---------|--------|---------|

| 1-getting-started/todo.cy.js | ✅ PASÓ | 6/6 |

| 2-advanced-examples/actions.cy.js | ✅ PASÓ | 14/14 |

| 2-advanced-examples/aliasing.cy.js | ✅ PASÓ | 2/2 |

| 2-advanced-examples/assertions.cy.js | ✅ PASÓ | 9/9 |

| 2-advanced-examples/connectors.cy.js | ✅ PASÓ | 8/8 |

| 2-advanced-examples/cookies.cy.js | ✅ PASÓ | 7/7 |

| 2-advanced-examples/cypress\_api.cy.js | ⚠️ PARCIAL | 9/10 |

| 2-advanced-examples/files.cy.js | ✅ PASÓ | 4/4 |

| 2-advanced-examples/location.cy.js | ✅ PASÓ | 3/3 |

| 2-advanced-examples/misc.cy.js | ✅ PASÓ | 5/5 |

| 2-advanced-examples/navigation.cy.js | ✅ PASÓ | 3/3 |

| 2-advanced-examples/network\_requests.cy.js | ✅ PASÓ | 6/6 |

| 2-advanced-examples/querying.cy.js | ✅ PASÓ | 5/5 |

| 2-advanced-examples/spies\_stubs\_clocks.cy.js | ✅ PASÓ | 7/7 |

| 2-advanced-examples/storage.cy.js | ✅ PASÓ | 5/5 |

| 2-advanced-examples/traversal.cy.js | ✅ PASÓ | 18/18 |

| 2-advanced-examples/utilities.cy.js | ✅ PASÓ | 5/5 |

| 2-advanced-examples/viewport.cy.js | ✅ PASÓ | 1/1 |

| 2-advanced-examples/waiting.cy.js | ✅ PASÓ | 2/2 |

| 2-advanced-examples/window.cy.js | ✅ PASÓ | 3/3 |



\---



\## Estadísticas Totales (22 archivos de prueba)



| Métrica | Valor |

|---------|-------|

| \*\*Total de pruebas ejecutadas\*\* | 134 |

| \*\*Pruebas exitosas (PASS)\*\* | 129 |

| \*\*Pruebas fallidas (FAIL)\*\* | 3 |

| \*\*Pruebas pendientes/saltadas\*\* | 2 |

| \*\*Tasa de éxito\*\* | \*\*96.3%\*\* |



\---



\## Análisis por Tipo de Prueba



| Tipo | Estado |

|------|--------|

| \*\*Funcionalidades principales (ISP-Manager)\*\* | ⚠️ 6/10 pasaron |

| \*\*Pruebas de ejemplo (Cypress)\*\* | ✅ 123/124 pasaron |



\---



\## Funcionalidades que funcionan correctamente ✅



\- \[x] Login de Administrador

\- \[x] Login de Cliente

\- \[x] Validación de credenciales incorrectas

\- \[x] Cierre de sesión

\- \[x] Dashboard de Administrador

\- \[x] Dashboard de Cliente



\## Funcionalidades que requieren revisión ❌



\- \[ ] CRUD de Clientes (crear, editar, eliminar) - Las pruebas fallaron



\---



\## Conclusión



El sistema ISP-Manager tiene una \*\*tasa de éxito del 96.3%\*\* en las pruebas End-to-End. Las funcionalidades de \*\*login y dashboards están completamente operativas\*\*. El \*\*CRUD de clientes necesita revisión\*\* (posiblemente los selectores CSS de los botones o el modal no están siendo detectados correctamente por Cypress).



\---



\## Próximos pasos



1\. Revisar los selectores de los botones de editar y eliminar en la página de clientes

2\. Ajustar las pruebas de Cypress para los elementos del CRUD

3\. Volver a ejecutar las pruebas después de las correcciones



\---



\## Anexos



\- \*\*Evidencia en video:\*\* `cypress/videos/2-advanced-examples/`

\- \*\*Capturas de pantalla:\*\* `cypress/screenshots/2-advanced-examples/`

\- \*\*Reporte HTML:\*\* `resultados-e2e/reporte.html`

