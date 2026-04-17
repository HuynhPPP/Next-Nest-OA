import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                console.log(">>> check credentials", credentials)
                let user = null

                // call backend

                // user = {
                //     _id: '123',
                //     username: 'huynhphan',
                //     email: 'huynhphan',
                //     isVerify: true,
                //     type: 'local',
                //     role: 'admin',
                // };

                if (!user) {
                    throw new Error("Invalid credentials.")
                }

                return user
            },
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
})