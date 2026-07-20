import type { FastifyInstance } from 'fastify'
import { register } from './register.js'
import { authenticate } from './authenticate.js'
import { profile } from './profile.js'
import { verifyJWT } from '@/http/middlewares/verify-jwt.js'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  /** Authenticated */
  app.get('/me', { onRequest: [verifyJWT] }, profile)
}
