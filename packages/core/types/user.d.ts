import * as mongoose from "mongoose"

interface User {
  credentials: Credentials
  active: boolean
  mailid: number
  resetpasswordtoken: number
  resetpasswordmdp: number
  job: string
  society: string
  name: string
  stripeID: string
  workspaces: Array<WorkspaceReference>
  admin: boolean
  dates: {
    created_at: Date
    updated_at: Date
  },
  googleToken: string
  googleId: string
  credit: number
  discount: number
  secret_stripe: string
}

interface Credentials {
  email: string
  hashed_password: string
}

interface WorkspaceReference {
  _id: string
  role: string
}

interface UserDocument extends User, mongoose.Document {
}