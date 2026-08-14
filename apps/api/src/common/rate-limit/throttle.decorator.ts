import { Throttle } from '@nestjs/throttler';

/**
 * Limitador de taxa customizado para endpoints de autenticação.
 * Mais restritivo: 5 requisições por 15 minutos
 */
export const AuthThrottle = () => Throttle({ default: { limit: 5, ttl: 900 } });

/**
 * Limitador de taxa para criação de recursos.
 * 50 requisições por hora
 */
export const CreateThrottle = () => Throttle({ default: { limit: 50, ttl: 3600 } });

/**
 * Limitador de taxa padrão.
 * 100 requisições por 15 minutos
 */
export const DefaultThrottle = () => Throttle({ default: { limit: 100, ttl: 900 } });
