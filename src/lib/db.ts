import { PrismaClient } from '@prisma/client'

// const prismaClientSingleton = () => {
//     return new PrismaClient()
// }

const prisma = new PrismaClient()

export default prisma

