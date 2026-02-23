import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Admin from '../models/Admin.js'
import { connectDB } from '../config/db.js'
import Profile from '../models/Profile.js'

dotenv.config()

const seedProfiles = [
  {
    full_name: 'John Doe',
    company_name: 'BlueWave Technologies',
    designation: 'Business Development Manager',
    username: 'john-doe',
    email: 'john.doe@bluewave.com',
    phone: '+1-202-555-0101',
    location: 'San Francisco, CA',
    bio: 'Helping brands grow through strategic partnerships and NFC-enabled networking.',
    profile_image_url: 'https://i.pravatar.cc/300?img=12',
    linkedin_url: 'https://www.linkedin.com/in/john-doe',
    facebook_url: 'https://www.facebook.com/john.doe',
    instagram_url: 'https://www.instagram.com/johndoe',
    twitter_url: 'https://x.com/johndoe',
    whatsapp_url: 'https://wa.me/12025550101',
    nfc_uid: 'NFC-UID-1001',
    qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://www.domain.com/john-doe',
    status: 'ACTIVE',
  },
  {
    full_name: 'Jane Smith',
    company_name: 'Nova Retail Group',
    designation: 'Marketing Director',
    username: 'jane-smith',
    email: 'jane.smith@novaretail.com',
    phone: '+1-202-555-0102',
    location: 'Austin, TX',
    bio: 'Driving omnichannel campaigns and customer engagement strategies.',
    profile_image_url: 'https://i.pravatar.cc/300?img=25',
    linkedin_url: 'https://www.linkedin.com/in/jane-smith',
    facebook_url: 'https://www.facebook.com/jane.smith',
    instagram_url: 'https://www.instagram.com/janesmith',
    twitter_url: 'https://x.com/janesmith',
    whatsapp_url: 'https://wa.me/12025550102',
    nfc_uid: 'NFC-UID-1002',
    qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://www.domain.com/jane-smith',
    status: 'ACTIVE',
  },
  {
    full_name: 'Alex Lee',
    company_name: 'Vertex Consulting',
    designation: 'Senior Consultant',
    username: 'alex-lee',
    email: 'alex.lee@vertexconsulting.com',
    phone: '+1-202-555-0103',
    location: 'Seattle, WA',
    bio: 'Advising startups on growth, operations, and product-market fit.',
    profile_image_url: 'https://i.pravatar.cc/300?img=33',
    linkedin_url: 'https://www.linkedin.com/in/alex-lee',
    facebook_url: 'https://www.facebook.com/alex.lee',
    instagram_url: 'https://www.instagram.com/alexlee',
    twitter_url: 'https://x.com/alexlee',
    whatsapp_url: 'https://wa.me/12025550103',
    nfc_uid: 'NFC-UID-1003',
    qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://www.domain.com/alex-lee',
    status: 'DISABLED',
  },
]

const run = async () => {
  try {
    await connectDB()
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@demo.com').toLowerCase().trim()
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const password_hash = await bcrypt.hash(adminPassword, 10)

    await Admin.findOneAndUpdate(
      { email: adminEmail },
      { email: adminEmail, password_hash, status: 'ACTIVE' },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    )

    for (const profile of seedProfiles) {
      await Profile.findOneAndUpdate({ username: profile.username }, profile, {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      })
    }

    console.log(`Seed complete. Upserted 1 admin and ${seedProfiles.length} profiles.`)
  } catch (error) {
    console.error('Seed failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

run()
