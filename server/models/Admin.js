import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id
        delete ret.password_hash
        return ret
      },
    },
  },
)

const Admin = mongoose.model('Admin', adminSchema)

export default Admin
