import { ChangePasswordDto, CodeAuthDto } from '@/auth/dto/create-auth.dto';
import { hashPasswordHelper } from '@/helpers/utils';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import dayjs from 'dayjs';
import mongoose, { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name)
  private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) { }

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;

    // check email
    const isEmailExist = await this.isEmailExist(email);
    if (isEmailExist === true) {
      throw new BadRequestException(`Email ${email} đã tồn tại. Vui lòng sử dụng email khác`);
    }

    // hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      image,
    });
    return {
      _id: user._id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) {
      current = filter.current;
      delete filter.current;
    }
    if (filter.pageSize) {
      pageSize = filter.pageSize;
      delete filter.pageSize;
    }
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const result = await this.userModel
      .find(filter)
      .sort(sort as any)
      .skip(skip)
      .select('-password')
      .limit(pageSize)

    return { result, totalPages };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto }
    );
  }

  async remove(_id: string) {
    // check id
    if (mongoose.isValidObjectId(_id)) {
      // delete
      const user = await this.userModel.findById(_id);
      if (!user) {
        throw new BadRequestException(`User ${_id} không tồn tại`);
      }
      return await this.userModel.deleteOne({ _id: _id });
    } else {
      throw new BadRequestException(`ID ${_id} không đúng định dạng mongodb`);
    }
  }

  async register(registerDto: CreateUserDto) {
    const { name, email, password } = registerDto;

    // check email
    const isEmailExist = await this.isEmailExist(email);
    if (isEmailExist === true) {
      throw new BadRequestException(`Email ${email} đã tồn tại. Vui lòng sử dụng email khác`);
    }

    // hash password
    const hashPassword = await hashPasswordHelper(password);
    const codeID = uuidv4()
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      isActive: false,
      codeId: codeID,
      codeExpired: dayjs().add(5, 'minutes').toDate(),
    });

    // send email
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Kích hoạt tài khoản tại @huynhphanIT',
      template: "register",
      context: {
        name: user?.name ?? user?.email,
        activationCode: codeID,
      }
    })

    // trả ra phản hồi
    return {
      _id: user._id,
    };
  }

  async handleActive(data: CodeAuthDto) {
    const user = await this.userModel.findOne({
      _id: data._id,
      codeId: data.code,
    });

    if (!user) {
      throw new BadRequestException(`Mã kích hoạt không tồn tại hoặc đã hết hạn`);
    }

    // check expired
    const isBeforeCheck = dayjs().isBefore(user.codeExpired);

    if (isBeforeCheck) {
      await this.userModel.updateOne(
        { _id: user._id },
        { isActive: true }
      );
      return {
        message: 'Kích hoạt tài khoản thành công',
      };
    } else {
      throw new BadRequestException(`Mã kích hoạt đã hết hạn`);
    }

  };

  async resendCode(email: string) {
    // check email
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException(`Email ${email} không tồn tại`);
    }

    if (user.isActive) {
      throw new BadRequestException(`Email ${email} đã được kích hoạt`);
    }

    // send email
    const codeID = uuidv4()
    await user.updateOne({
      codeId: codeID,
      codeExpired: dayjs().add(5, 'minutes').toDate(),
    });
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Kích hoạt tài khoản tại @huynhphanIT',
      template: "register",
      context: {
        name: user?.name ?? user?.email,
        activationCode: codeID,
      }
    })

    return {
      _id: user._id,
    };
  }

  async retryPassword(email: string) {
    // check email
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException(`Email ${email} không tồn tại`);
    }

    // send email
    const codeID = uuidv4()
    await user.updateOne({
      codeId: codeID,
      codeExpired: dayjs().add(5, 'minutes').toDate(),
    });
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Đổi mật khẩu tài khoản tại @huynhphanIT',
      template: "forgot-password",
      context: {
        name: user?.name ?? user?.email,
        activationCode: codeID,
      }
    })

    return {
      _id: user._id,
      email: user.email,
    };
  }

  async changePassword(data: ChangePasswordDto) {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException(`Mật khẩu không khớp`);
    }

    const user = await this.userModel.findOne({ email: data.email });

    if (!user) {
      throw new BadRequestException(`User không tồn tại`);
    }

    const isBeforeCheck = dayjs().isBefore(user.codeExpired);

    if (isBeforeCheck) {
      const newPassword = await hashPasswordHelper(data.password);
      await user.updateOne({
        password: newPassword
      });
      return {
        message: 'Đổi mật khẩu thành công',
      };
    } else {
      throw new BadRequestException(`Mã kích hoạt không hợp lệ hoặc đã hết hạn`);
    }
  }
}
