import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import Profile from '../models/Profile.js'
import auth from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { email = '', password = '' } = req.body
  const normalizedEmail = email.toLowerCase().trim()
  const admin = await Admin.findOne({ email: normalizedEmail, status: 'ACTIVE' })

  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const isValid = await bcrypt.compare(password, admin.password_hash)

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = jwt.sign({ email: admin.email, role: 'admin' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1d' })

  return res.json({ token })
})

router.use(auth)

router.get('/dashboard', async (_req, res) => {
  const [total_profiles, active_profiles, disabled_profiles, nfc_assigned_count] = await Promise.all([
    Profile.countDocuments(),
    Profile.countDocuments({ status: 'ACTIVE' }),
    Profile.countDocuments({ status: 'DISABLED' }),
    Profile.countDocuments({ nfc_uid: { $exists: true, $ne: '' } }),
  ])

  return res.json({
    total_profiles,
    active_profiles,
    disabled_profiles,
    nfc_assigned_count,
  })
})

router.get('/profiles', async (req, res) => {
  const { search = '', status = '', page = 1, limit = 10 } = req.query
  const numericPage = Number(page) || 1
  const numericLimit = Number(limit) || 10

  const filter = {}

  if (status === 'ACTIVE' || status === 'DISABLED') {
    filter.status = status
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i')
    filter.$or = [
      { full_name: searchRegex },
      { username: searchRegex },
      { email: searchRegex },
    ]
  }

  const [items, total] = await Promise.all([
    Profile.find(filter)
      .sort({ created_at: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit),
    Profile.countDocuments(filter),
  ])

  return res.json({
    items,
    page: numericPage,
    total,
    totalPages: Math.ceil(total / numericLimit) || 1,
  })
})

router.get('/profiles/:id', async (req, res) => {
  const profile = await Profile.findById(req.params.id)

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' })
  }

  return res.json(profile)
})

router.post('/profiles', async (req, res) => {
  try {
    const created = await Profile.create(req.body)
    return res.status(201).json(created)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username already exists' })
    }

    return res.status(400).json({ message: 'Unable to create profile', details: error.message })
  }
})

router.put('/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    return res.json(profile)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username already exists' })
    }

    return res.status(400).json({ message: 'Unable to update profile', details: error.message })
  }
})

router.patch('/profiles/:id/status', async (req, res) => {
  const { status } = req.body

  if (!['ACTIVE', 'DISABLED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' })
  }

  const profile = await Profile.findByIdAndUpdate(req.params.id, { status }, { new: true })

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' })
  }

  return res.json(profile)
})

export default router
