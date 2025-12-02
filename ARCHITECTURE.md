# Arquitectura de la Aplicación - GestionPredios

Esta aplicación sigue una **arquitectura orientada a features** (Feature-Based Architecture) para Angular, que permite una mejor organización, escalabilidad y mantenibilidad del código.

## 📁 Estructura de Carpetas

```
src/
├── app/
│   ├── core/                 # Servicios singleton, Guards, Interceptors, Configuraciones globales
│   │   ├── auth/            # Servicios de autenticación
│   │   ├── interceptors/    # HTTP Interceptors
│   │   ├── guards/          # Route Guards
│   │   └── core.module.ts   # (Opcional si usas Standalone)
│   │
│   ├── shared/              # Componentes UI reusables, Pipes, Directivas (Dumb Components)
│   │   ├── components/      # Botones, Inputs, Modales, etc.
│   │   ├── pipes/           # Pipes personalizados
│   │   ├── directives/      # Directivas personalizadas
│   │   └── shared.module.ts # (O exporta todo si usas Standalone)
│   │
│   ├── features/            # Módulos de Funcionalidad (Lógica de negocio)
│   │   ├── home/           # Feature: Página de inicio
│   │   ├── dashboard/      # Feature: Dashboard
│   │   ├── users/          # Feature: Gestión de usuarios (ejemplo completo)
│   │   │   ├── components/ # Componentes presentacionales (tontos)
│   │   │   ├── pages/      # Smart Components (Vistas de ruta)
│   │   │   ├── models/     # Interfaces específicas de usuario
│   │   │   ├── services/   # Servicios específicos de usuario
│   │   │   ├── state/      # (Opcional) Store, Signals, NgRx
│   │   │   ├── users-routing.module.ts
│   │   │   └── users.module.ts
│   │   └── ...             # Otras features
│   │
│   ├── layout/              # Estructuras principales de la aplicación
│   │   ├── header/         # Componente de cabecera
│   │   ├── footer/         # Componente de pie de página
│   │   └── sidebar/        # Componente de barra lateral
│   │
│   ├── app-routing.module.ts # Carga perezosa (Lazy Loading) de las features
│   ├── app.config.ts        # Configuración de la aplicación
│   └── app.ts               # Componente raíz
│
├── assets/                  # Recursos estáticos (imágenes, iconos, etc.)
├── environments/            # Configuraciones de entorno
└── styles/                  # Estilos globales
```

## 🎯 Principios de la Arquitectura

### 1. **Core Module**

- Contiene servicios singleton que se usan en toda la aplicación
- Se importa **una sola vez** en el módulo raíz
- Incluye: autenticación, guards, interceptors, configuraciones globales

### 2. **Shared Module**

- Componentes, directivas y pipes **reutilizables**
- **No contiene lógica de negocio**
- Puede ser importado por cualquier feature module
- Componentes "tontos" (presentacionales)

### 3. **Features Modules**

- Cada feature es **independiente y autocontenida**
- Contiene toda la lógica relacionada con una funcionalidad específica
- Se cargan de forma **lazy** (perezosa) para optimizar el rendimiento
- Estructura interna:
  - **components/**: Componentes presentacionales específicos de la feature
  - **pages/**: Componentes inteligentes que se asocian a rutas
  - **models/**: Interfaces y tipos específicos
  - **services/**: Servicios específicos de la feature
  - **state/**: Gestión de estado (opcional)

### 4. **Layout Module**

- Componentes de estructura principal (header, footer, sidebar)
- Define la disposición visual de la aplicación
- Puede tener diferentes layouts (AuthLayout, MainLayout, etc.)

## 🚀 Ventajas de esta Arquitectura

✅ **Escalabilidad**: Fácil agregar nuevas features sin afectar las existentes  
✅ **Mantenibilidad**: Código organizado y fácil de encontrar  
✅ **Reutilización**: Componentes shared disponibles para todas las features  
✅ **Lazy Loading**: Carga bajo demanda para mejor rendimiento  
✅ **Separación de responsabilidades**: Cada módulo tiene un propósito claro  
✅ **Testing**: Más fácil de testear módulos independientes

## 📝 Convenciones

### Nomenclatura de Archivos

- **Componentes**: `nombre.component.ts`
- **Servicios**: `nombre.service.ts`
- **Guards**: `nombre.guard.ts`
- **Interceptors**: `nombre.interceptor.ts`
- **Pipes**: `nombre.pipe.ts`
- **Directivas**: `nombre.directive.ts`
- **Modelos**: `nombre.model.ts` o `nombre.interface.ts`

### Componentes Smart vs Dumb

**Smart Components (Inteligentes)**:

- Ubicados en `features/*/pages/`
- Contienen lógica de negocio
- Se comunican con servicios
- Gestionan estado
- Se asocian a rutas

**Dumb Components (Tontos/Presentacionales)**:

- Ubicados en `shared/components/` o `features/*/components/`
- Solo presentan datos
- Reciben datos vía `@Input()`
- Emiten eventos vía `@Output()`
- No tienen lógica de negocio
- Altamente reutilizables

## 🔄 Flujo de Datos

```
Usuario → Page Component (Smart) → Service → Backend API
                ↓
        Components (Dumb) ← @Input/@Output
```

## 📦 Próximos Pasos

1. Crear componentes base en `layout/`
2. Configurar rutas con lazy loading en `app-routing.module.ts`
3. Desarrollar features individuales
4. Implementar servicios en `core/` y `features/*/services/`
5. Crear componentes reutilizables en `shared/`

---

**Nota**: Esta arquitectura está preparada tanto para módulos tradicionales como para componentes standalone de Angular.
