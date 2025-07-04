import * as mongoose from "./mongoose"

interface Authentication {
  token: string
  user: string
  dates: {
    created_at: Date
  }
}

interface AuthenticationDocument extends Authentication, mongoose.Document {
}

interface Interface extends Document {

}