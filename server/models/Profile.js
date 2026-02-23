import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    company_name: { type: String, default: '' },
    designation: { type: String, default: '' },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    profile_image_url: { type: String, default: '' },
    linkedin_url: { type: String, default: '' },
    facebook_url: { type: String, default: '' },
    instagram_url: { type: String, default: '' },
    twitter_url: { type: String, default: '' },
    whatsapp_url: { type: String, default: '' },
    nfc_uid: { type: String, default: '' },
    qr_image_url: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true, versionKey: false, transform: (_, ret) => {
      delete ret._id
      return ret
    } },
  },
)

profileSchema.index({ full_name: 'text', username: 'text', email: 'text' })

const Profile = mongoose.model('Profile', profileSchema)

export default Profile
