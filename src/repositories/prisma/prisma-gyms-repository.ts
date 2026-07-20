import type { Gym, Prisma } from '@prisma/client'
import type {
  FindManyNearbyParams,
  GymsRepository,
} from '../gyms-repository.js'
import { prisma } from '@/lib/prisma.js'

export class PrismaGymsRepository implements GymsRepository {
  async findById(id: string) {
    const gym = await prisma.gym.findUnique({
      where: {
        id,
      },
    })
    return gym
  }

  async findManyNearby({ latitude, longitude }: FindManyNearbyParams) {
    const gyms = await prisma.$queryRaw<Gym[]>`
    SELECT * FROM gyms
    WHERE ( 6371 * 2 * asin( sqrt(
      power( sin( radians( (${latitude} - latitude) / 2 ) ), 2 )
      + cos( radians(latitude) ) * cos( radians(${latitude}) )
      * power( sin( radians( (${longitude} - longitude) / 2 ) ), 2 )
    ) ) ) <= 10
    `

    return gyms
  }

  async searchMany(query: string, page: number) {
    const gyms = await prisma.gym.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return gyms
  }

  async create(data: Prisma.GymCreateInput) {
    const gym = await prisma.gym.create({
      data,
    })
    return gym
  }
}
