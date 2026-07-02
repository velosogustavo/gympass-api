import type { UsersRepository } from '@/repositories/users-repository.js'
import type { User } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error.js'

interface GetUserPofileUseCaseRequest {
  userdId: string
}

interface GetUserPofileUseCaseResponse {
  user: User
}

export class GetUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userdId,
  }: GetUserPofileUseCaseRequest): Promise<GetUserPofileUseCaseResponse> {
    const user = await this.usersRepository.findById(userdId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    return {
      user,
    }
  }
}
