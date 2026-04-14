import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateAuthDto {
    @IsNotEmpty({ message: "Email không được để trống" })
    @IsEmail({}, { message: "Email không đúng định dạng" })
    email: string;

    @IsNotEmpty({ message: "Password không được để trống" })
    password: string;

    @IsOptional()
    name: string;
}
