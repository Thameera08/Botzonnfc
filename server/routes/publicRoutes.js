import { Router } from 'express'
import Profile from '../models/Profile.js'

const router = Router()

router.get('/profile/:username', async (req, res) => {
  const username = req.params.username.toLowerCase()
  const profile = await Profile.findOne({ username })

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' })
  }

  return res.json(profile)
})

export default router
