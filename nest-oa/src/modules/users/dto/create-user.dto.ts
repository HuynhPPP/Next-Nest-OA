import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({
        message: 'Name không được để trống'
    })
    name: string;

    @IsNotEmpty({
        message: 'Email không được để trống'
    })
    @IsEmail({}, {
        message: 'Email không đúng định dạng'
    })
    email: string;

    @IsNotEmpty({
        message: 'Password không được để trống'
    })
    password: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    image?: string;
}
