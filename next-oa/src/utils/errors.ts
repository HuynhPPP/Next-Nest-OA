import { AuthError } from "next-auth";

export class CustomAuthError extends AuthError {
    static type: string;

    constructor(message?: any) {
        super();

        if (message) {
            this.type = message;
        }
    }
}

export class InvalidEmailPasswordError extends CustomAuthError {
    static type = "Email/Password không hợp lệ";

}

export class InActiveUserError extends CustomAuthError {
    static type = "Tài khoản chưa được kích hoạt";

}