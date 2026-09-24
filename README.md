# CrediTrack

CrediTrack es una API REST dedicada a administrar préstamos informales, facilitando el trabajo de los prestamistas de la calle.

La API permite gestionar usuarios, clientes, préstamos, cuotas y pagos, manteniendo un registro organizado de las operaciones realizadas.

## Tecnologías

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* JWT
* Jest
* Supertest

## Modelos

### Usuario

Representa al usuario del sistema, es decir, la persona que administra los préstamos.

Un usuario puede tener múltiples préstamos.

### Cliente

Representa a la persona que recibe un préstamo.

Un cliente puede tener múltiples préstamos.

### Préstamo

Representa el dinero prestado a un cliente.

Un préstamo pertenece a un usuario y a un cliente, y puede tener múltiples cuotas.

### Cuota

Representa una parte del préstamo que debe ser pagada en una fecha determinada.

Una cuota pertenece a un préstamo y puede tener múltiples pagos.

### Pago

Representa un pago realizado por el cliente. Permite registrar pagos completos o parciales de una cuota.

## Relaciones

```text
Usuario 1 ─────── N Préstamos
Cliente 1 ─────── N Préstamos
Préstamo 1 ─────── N Cuotas
Cuota 1 ────────── N Pagos
```

## Endpoints

### Usuarios / Autenticación

| Método | Endpoint         | Descripción                 | Acceso  |
| ------ | ---------------- | --------------------------- | ------- |
| POST   | `/auth/register` | Registrar usuario           | Público |
| POST   | `/auth/login`    | Iniciar sesión              | Público |
| GET    | `/auth/me`       | Obtener usuario autenticado | Usuario |

### Clientes

| Método | Endpoint        | Descripción                | Acceso  |
| ------ | --------------- | -------------------------- | ------- |
| GET    | `/clientes`     | Obtener todos los clientes | Usuario |
| GET    | `/clientes/:id` | Obtener un cliente         | Usuario |
| POST   | `/clientes`     | Registrar cliente          | Usuario |
| PUT    | `/clientes/:id` | Actualizar cliente         | Usuario |
| DELETE | `/clientes/:id` | Eliminar cliente           | Usuario |

### Préstamos

| Método | Endpoint         | Descripción         | Acceso  |
| ------ | ---------------- | ------------------- | ------- |
| GET    | `/prestamos`     | Obtener préstamos   | Usuario |
| GET    | `/prestamos/:id` | Obtener un préstamo | Usuario |
| POST   | `/prestamos`     | Crear préstamo      | Usuario |
| PUT    | `/prestamos/:id` | Actualizar préstamo | Usuario |
| DELETE | `/prestamos/:id` | Eliminar préstamo   | Usuario |

### Cuotas

| Método | Endpoint                | Descripción                   | Acceso  |
| ------ | ----------------------- | ----------------------------- | ------- |
| GET    | `/prestamos/:id/cuotas` | Obtener cuotas de un préstamo | Usuario |
| GET    | `/cuotas/:id`           | Obtener una cuota             | Usuario |
| PUT    | `/cuotas/:id`           | Actualizar una cuota          | Usuario |

### Pagos

| Método | Endpoint            | Descripción                | Acceso  |
| ------ | ------------------- | -------------------------- | ------- |
| GET    | `/cuotas/:id/pagos` | Obtener pagos de una cuota | Usuario |
| GET    | `/pagos/:id`        | Obtener un pago            | Usuario |
| POST   | `/cuotas/:id/pagos` | Registrar un pago          | Usuario |
| PUT    | `/pagos/:id`        | Actualizar un pago         | Usuario |
| DELETE | `/pagos/:id`        | Eliminar un pago           | Usuario |

## Autenticación

La API utiliza JWT para autenticar a los usuarios.

Los endpoints protegidos requieren enviar el token mediante el header:

```text
Authorization: Bearer <token>
```

## Ejemplo del flujo

Un flujo normal dentro de CrediTrack sería:

```text
1. El usuario se registra
        ↓
2. Inicia sesión
        ↓
3. Registra un cliente
        ↓
4. Crea un préstamo para el cliente
        ↓
5. El préstamo genera sus cuotas
        ↓
6. El cliente realiza un pago
        ↓
7. El pago se registra en la cuota
        ↓
8. La cuota actualiza su estado
        ↓
9. Cuando todas las cuotas están pagadas,
   el préstamo pasa a estado completado
```

## Estados

### Préstamo

```text
ACTIVO
COMPLETADO
VENCIDO
CANCELADO
```

### Cuota

```text
PENDIENTE
PAGADA
VENCIDA
```

## Instalación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd CrediTrack
```

Instalar las dependencias:

```bash
npm install
```

Configurar las variables de entorno en `.env`:

```env
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
JWT_SECRET="tu_secreto"
PORT=3000
```

Ejecutar las migraciones:

```bash
npx prisma migrate dev
```

Iniciar el servidor:

```bash
npm run dev
```

## Autor

Proyecto desarrollado como práctica de Programación Aplicada 2.
