import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connect from "@/lib/mongodb";
import User from "@/models/Users";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Auth attempt for:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }
      
        try {
          await connect();
          console.log("Connected to MongoDB");
          
          const user = await User.findOne({
            $or: [
              { email: { $regex: new RegExp(`^${credentials.email}$`, 'i') } },
              { username: { $regex: new RegExp(`^${credentials.email}$`, 'i') } }
            ]
          });
          
          console.log("User ID:", user?._id?.toString());
          console.log("User creation date:", user?.created_at);
          
          if (!user) {
            console.log("User not found");
            return null;
          }
          
          console.log("User found, comparing passwords");
          console.log("User password hash:", user.password);
          console.log("Input password length:", credentials.password.length);
          console.log("Input password first/last chars:", 
            credentials.password.charAt(0) + "..." + 
            credentials.password.charAt(credentials.password.length-1));
          
          // Debug: Try different approaches to compare passwords
          const normalCompare = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          console.log("Normal password comparison result:", normalCompare);
          
          // Check if the stored password is actually a bcrypt hash
          const isValidBcryptHash = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/.test(user.password);
          console.log("Is password a valid bcrypt hash?", isValidBcryptHash);
          
          if (!isValidBcryptHash) {
            console.log("WARNING: Stored password is not a valid bcrypt hash!");
            
            // If it's not a bcrypt hash, try a direct string comparison (for development only)
            if (credentials.password === user.password) {
              console.log("Direct string comparison matched!");
              
              // THIS IS ONLY FOR DEBUGGING - SHOULD BE REMOVED IN PRODUCTION
              return {
                id: user._id.toString(),
                email: user.email,
                name: user.username,
              };
            }
          }
          
          // Use the normal bcrypt compare result for the actual decision
          if (!normalCompare) {
            console.log("Password does not match");
            return null;
          }
      
          console.log("Authentication successful");
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
          };
        } catch (error) {
          console.error("Auth error:", error);
          console.error("Auth error details:", error.message);
          console.error("Auth error stack:", error.stack);
          return null;
        }
      }
    })
  ],
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };