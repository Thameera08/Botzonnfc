import { Router } from 'express'
import Profile from '../models/Profile.js'

const router = Router()

router.get('/profile/:username', async (req, res) => {
  const rawUsername = decodeURIComponent(req.params.username || '')
  const username = rawUsername.trim().replace(/^@/, '').replace(/\/+$/, '').toLowerCase()

  if (!username) {
    return res.status(400).json({ message: 'Username is required' })
  }

  const profile = await Profile.findOne({ username })

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' })
  }

  return res.json(profile)
})

export default router
