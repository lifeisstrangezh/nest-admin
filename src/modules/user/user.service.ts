import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindOptionsWhere,
  Like,
  QueryDeepPartialEntity,
  Repository,
} from 'typeorm'
import { User } from './entities/user.entity'
import * as md5 from 'md5'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  createUser(createUserDto: CreateUserDto) {
    // const user = new User()
    // user.username = createUserDto.username
    // user.password = md5(createUserDto.password).toUpperCase()
    // user.nickname = createUserDto.nickname || createUserDto.username
    // user.role = createUserDto.role
    // user.avatar = createUserDto.avatar
    // user.active = 1
    
    const user = this.userRepository.create({
      ...createUserDto,
      password: md5(createUserDto.password).toUpperCase(),
      nickname: createUserDto.nickname || createUserDto.username,
      active: 1,
    })
    return this.userRepository.save(user)
  }

  async getUserList(params) {
    let page = +params.page || 1
    let pageSize = +params.pageSize || 20
    const { id = '', username = '', active } = params
    if (page <= 0) {
      page = 1
    }
    if (pageSize <= 0) {
      pageSize = 20
    }

    const where: FindOptionsWhere<User> = {}
    if (id) {
      where.id = id
    }
    if (username) {
      where.username = Like(`%${username}%`)
    }
    if (active) {
      where.active = active
    }

    const [items, total] = await this.userRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return {
      items,
      total,
    }
  }

  update(params) {
    // const { username, nickname, active, role, id } = params
    // const partial: QueryDeepPartialEntity<User> = {
    //   ...params
    // }
    // if (nickname) {
    //   partial.nickname = nickname
    // }
    // if (active !== undefined && active !== null) {
    //   partial.active = active
    // }
    // if (role) {
    //   partial.role = role
    // }
    const { id, ...rest } = params
    return this.userRepository.update(id, rest)
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id } })
  }

  remove(id: number) {
    return this.userRepository.delete(id)
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } })
  }
}
