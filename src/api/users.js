import prisma from '@/lib/prisma'

export const createUser = async (userData) => {
  try {
    const user = await prisma.user.create({
      data: userData
    })
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}
