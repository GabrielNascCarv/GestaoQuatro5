import { prisma } from '@gestao-quatro5/database';
import { IUserRepository } from '../contracts/repository/user-repository';
import { User } from '../entities/user';

export class PrismaUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    const newUser = new User({
      id: created.id,
      name: created.name,
      email: created.email,
      password: created.password,
      created_at: created.created_at,
      updated_at: created.updated_at,
      deleted_at: created.deleted_at,
    });

    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await prisma.user.findFirst({
      where: { email, deleted_at: null },
    });

    if (!found) return null;

    const newUser = new User({
      id: found.id,
      name: found.name,
      email: found.email,
      password: found.password,
      created_at: found.created_at,
      updated_at: found.updated_at,
      deleted_at: found.deleted_at,
    });

    return newUser;
  }

  async findById(id: string): Promise<User | null> {
    const found = await prisma.user.findFirst({
      where: { id, deleted_at: null },
    });

    if (!found) return null;

    const newUser = new User({
      id: found.id,
      name: found.name,
      email: found.email,
      password: found.password,
      created_at: found.created_at,
      updated_at: found.updated_at,
      deleted_at: found.deleted_at,
    });

    return newUser;
  }
}
