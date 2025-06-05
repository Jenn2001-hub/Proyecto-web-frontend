// Re-exporta el módulo para facilitar imports
export * from './core.module';

// Exportaciones de servicios
export { AuthService } from './service/auth.service';

// Exportaciones de modelos/interfaces
export { User } from './models/user';
export { InConfiguration } from './models/config.interface';
