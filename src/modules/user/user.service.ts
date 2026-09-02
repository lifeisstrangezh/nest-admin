import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, Repository } from 'typeorm'
import { User } from './user.entity'
import { CreateUserDto } from './create-user-dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findOne(id: number): Promise<User> {
    // console.log('this.userRepository', this.userRepository);
    // 可以直接执行sql语句
    // this.userRepository.query('SELECT * FROM user WHERE id = 1');
    return this.userRepository.findOneBy({ id })
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User()
    const { username, password, role, nickname, avatar } = createUserDto
    Object.assign(user, {
      username,
      password,
      role,
      nickname,
      avatar,
      active: 1,
    })
    return this.userRepository.save(user)
  }

  remove(id: number): Promise<DeleteResult> {
    return this.userRepository.delete(id)
  }
}
