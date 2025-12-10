# Análisis de Brechas: Frontend vs Historias de Usuario

Este documento detalla las funcionalidades descritas en `HISTORIAS_USUARIO.md` que faltan o están incompletas en la implementación actual del frontend.

## 🔴 Funcionalidades Faltantes (Prioridad Alta/Crítica)

### 1. Gestión de Direcciones (HU-C04)
- **Estado Actual**: No existe UI para gestionar direcciones.
- **Faltante**:
  - Modal o página para listar direcciones guardadas.
  - Formulario para agregar una nueva dirección (calle, número, ciudad).
  - Selector de dirección al momento de coordinar la entrega (Checkout).

### 2. Panel de Administración (HU-P03, HU-P04, HU-A01)
- **Estado Actual**: No existe ninguna interfaz para usuarios "Administrador" u "Operador".
- **Faltante**:
  - Gestión de Productos (CRUD): Crear, editar, eliminar productos.
  - Gestión de Categorías: Crear y organizar categorías.
  - Dashboard de Diagnóstico (Health Check): Visualización del estado del sistema (DB, Redis).

### 3. Módulo de Facturación (HU-F01)
- **Estado Actual**: No hay opción para generar o visualizar facturas.
- **Faltante**:
  - Interfaz para el "Operador de Pedidos" para generar facturas.
  - Vista para el cliente de su factura generada.

### 4. Búsqueda y Paginación Avanzada (HU-P01)
- **Estado Actual**: Se cargan los primeros 100 productos. No hay barra de búsqueda ni filtros.
- **Faltante**:
  - Paginación real (botones Anterior/Siguiente interactuando con `skip`/`limit`).
  - Barra de búsqueda por nombre.
  - Filtros por categoría.

## 🟡 Funcionalidades Parciales o Mejorables

### 1. Validación de Formularios (HU-C01, HU-C03)
- **Estado Actual**: Validaciones básicas de HTML5.
- **Mejora**: Implementar validaciones de formato estricto para Teléfono (E.164) y Feedback visual de errores específicos del backend (ej: 422 Unprocessable Entity).

### 2. Gestión de Pedidos (HU-O01, HU-O02)
- **Estado Actual**: El pedido se crea en un solo paso (`createOrder` con items).
- **Nota**: El backend parece requerir `POST /order_details` separado según la historia HU-O02, pero el frontend actual envía todo junto. Si el backend lo soporta, está bien; si no, el frontend debe adaptarse para crear la orden primero y luego iterar creando los detalles.
- **Faltante**: Selección de método de entrega (Drive-thru, etc.) en el Checkout. Actualmente no se le pregunta al usuario.

## ✅ Funcionalidades Implementadas

- **Registro e Inicio de Sesión (HU-C01, HU-C02)**: Funcional.
- **Perfil de Usuario (HU-C03)**: Edición básica funcional.
- **Catálogo (HU-P01)**: Visualización básica funcional.
- **Detalle de Producto (HU-P02)**: Funcional (Modal).
- **Carrito y Checkout (HU-O01)**: Funcional (con método simplificado).
- **Mis Pedidos y Cancelación (HU-O03, HU-O04)**: Funcional.
- **Reseñas (HU-R01)**: Listado y creación funcional.

---
**Conclusión**: El frontend está bien encaminado para el "Cliente Final", pero carece totalmente del **Panel Administrativo** y la gestión de **Direcciones**.
