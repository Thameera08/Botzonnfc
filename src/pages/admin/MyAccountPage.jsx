import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { getMe, getMyProfile, updateMe, updateMyPassword, updateMyProfile } from '../../services/api/authApi'
import { setAuthUser } from '../../utils/auth'

const accountSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  profile_image_url: z.string().optional(),
})

const passwordSchema = z
  .object({
    current_password: z.string().min(6, 'Current password is required'),
    password: z.string().min(6, 'New password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Confirm your new password'),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  company_name: z.string().optional(),
  designation: z.string().optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().min(1, 'Phone is required'),
  location: z.string().optional(),
  bio: z.string().optional(),
  profile_image_url: z.string().optional(),
  linkedin_url: z.string().url('Enter a valid URL').or(z.literal('')),
  facebook_url: z.string().url('Enter a valid URL').or(z.literal('')),
  instagram_url: z.string().url('Enter a valid URL').or(z.literal('')),
  twitter_url: z.string().url('Enter a valid URL').or(z.literal('')),
  whatsapp_url: z.string().url('Enter a valid URL').or(z.literal('')),
  nfc_uid: z.string().optional(),
  public_theme: z.enum(['DARK_MINIMAL', 'LIGHT_GLASS', 'CLASSIC_BLUE']),
})

function MyAccountPage() {
  const [loading, setLoading] = useState(true)
  const [linkedProfileMessage, setLinkedProfileMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const accountForm = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { full_name: '', email: '', profile_image_url: '' },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', password: '', confirm_password: '' },
  })

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      company_name: '',
      designation: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      profile_image_url: '',
      linkedin_url: '',
      facebook_url: '',
      instagram_url: '',
      twitter_url: '',
      whatsapp_url: '',
      nfc_uid: '',
      public_theme: 'DARK_MINIMAL',
    },
  })

  const toDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Unable to read file'))
      reader.readAsDataURL(file)
    })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const me = await getMe()
        accountForm.reset({
          full_name: me.full_name || '',
          email: me.email || '',
          profile_image_url: me.profile_image_url || '',
        })

        try {
          const linkedProfile = await getMyProfile()
          profileForm.reset({
            full_name: linkedProfile.full_name || '',
            company_name: linkedProfile.company_name || '',
            designation: linkedProfile.designation || '',
            email: linkedProfile.email || '',
            phone: linkedProfile.phone || '',
            location: linkedProfile.location || '',
            bio: linkedProfile.bio || '',
            profile_image_url: linkedProfile.profile_image_url || '',
            linkedin_url: linkedProfile.linkedin_url || '',
            facebook_url: linkedProfile.facebook_url || '',
            instagram_url: linkedProfile.instagram_url || '',
            twitter_url: linkedProfile.twitter_url || '',
            whatsapp_url: linkedProfile.whatsapp_url || '',
            nfc_uid: linkedProfile.nfc_uid || '',
            public_theme: linkedProfile.public_theme || 'DARK_MINIMAL',
          })
          setLinkedProfileMessage('')
        } catch (error) {
          setLinkedProfileMessage(error.response?.data?.message || 'No linked business profile found.')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [accountForm, profileForm])

  const saveAccount = accountForm.handleSubmit(async (values) => {
    setStatusMessage('')
    try {
      const updated = await updateMe(values)
      setAuthUser(updated)
      setStatusMessage('Account details updated successfully.')
    } catch (error) {
      setStatusMessage(error.response?.data?.message || 'Unable to update account details.')
    }
  })

  const savePassword = passwordForm.handleSubmit(async (values) => {
    setPasswordMessage('')
    try {
      const result = await updateMyPassword({
        current_password: values.current_password,
        password: values.password,
      })
      setPasswordMessage(result?.message || 'Password updated successfully.')
      passwordForm.reset({ current_password: '', password: '', confirm_password: '' })
    } catch (error) {
      setPasswordMessage(error.response?.data?.message || 'Unable to update password.')
    }
  })

  const saveProfile = profileForm.handleSubmit(async (values) => {
    setLinkedProfileMessage('')
    try {
      await updateMyProfile(values)
      setLinkedProfileMessage('Linked business profile updated successfully.')
    } catch (error) {
      setLinkedProfileMessage(error.response?.data?.message || 'Unable to update linked profile.')
    }
  })

  if (loading) {
    return <Card className="p-5 text-sm text-slate-600">Loading account...</Card>
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">My Account</h2>
        <p className="mt-1 text-sm text-slate-600">Edit your admin login details and profile photo.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={saveAccount}>
          <Input label="Full Name" error={accountForm.formState.errors.full_name?.message} {...accountForm.register('full_name')} />
          <Input label="Email" error={accountForm.formState.errors.email?.message} {...accountForm.register('email')} />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-700">Profile Image</p>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm text-slate-600"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const dataUrl = await toDataUrl(file)
                accountForm.setValue('profile_image_url', dataUrl, { shouldDirty: true })
              }}
            />
            {accountForm.watch('profile_image_url') ? (
              <img src={accountForm.watch('profile_image_url')} alt="Admin profile" className="mt-2 h-12 w-12 rounded-full object-cover" />
            ) : null}
          </div>
          <div className="md:col-span-3">
            <Button type="submit" loading={accountForm.formState.isSubmitting}>
              Save Account
            </Button>
            {statusMessage ? <p className="mt-2 text-sm text-emerald-700">{statusMessage}</p> : null}
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={savePassword}>
          <Input
            type="password"
            label="Current Password"
            error={passwordForm.formState.errors.current_password?.message}
            {...passwordForm.register('current_password')}
          />
          <Input type="password" label="New Password" error={passwordForm.formState.errors.password?.message} {...passwordForm.register('password')} />
          <Input
            type="password"
            label="Confirm Password"
            error={passwordForm.formState.errors.confirm_password?.message}
            {...passwordForm.register('confirm_password')}
          />
          <div className="md:col-span-3">
            <Button type="submit" loading={passwordForm.formState.isSubmitting}>
              Update Password
            </Button>
            {passwordMessage ? <p className="mt-2 text-sm text-blue-700">{passwordMessage}</p> : null}
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-slate-900">My Business Profile</h3>
        <p className="mt-1 text-sm text-slate-600">These details are visible on your public profile page.</p>

        {linkedProfileMessage && linkedProfileMessage.includes('No linked') ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{linkedProfileMessage}</p>
        ) : (
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={saveProfile}>
            <Input label="Full Name" error={profileForm.formState.errors.full_name?.message} {...profileForm.register('full_name')} />
            <Input label="Company Name" error={profileForm.formState.errors.company_name?.message} {...profileForm.register('company_name')} />
            <Input label="Designation" error={profileForm.formState.errors.designation?.message} {...profileForm.register('designation')} />
            <Input label="Email" error={profileForm.formState.errors.email?.message} {...profileForm.register('email')} />
            <Input label="Phone" error={profileForm.formState.errors.phone?.message} {...profileForm.register('phone')} />
            <Input label="Location" error={profileForm.formState.errors.location?.message} {...profileForm.register('location')} />
            <Input label="LinkedIn URL" error={profileForm.formState.errors.linkedin_url?.message} {...profileForm.register('linkedin_url')} />
            <Input label="Facebook URL" error={profileForm.formState.errors.facebook_url?.message} {...profileForm.register('facebook_url')} />
            <Input label="Instagram URL" error={profileForm.formState.errors.instagram_url?.message} {...profileForm.register('instagram_url')} />
            <Input label="Twitter/X URL" error={profileForm.formState.errors.twitter_url?.message} {...profileForm.register('twitter_url')} />
            <Input label="WhatsApp URL" error={profileForm.formState.errors.whatsapp_url?.message} {...profileForm.register('whatsapp_url')} />
            <Input label="NFC UID" error={profileForm.formState.errors.nfc_uid?.message} {...profileForm.register('nfc_uid')} />
            <label className="md:col-span-2 flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Bio</span>
              <textarea
                rows={4}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-300 transition focus:border-sky-500 focus:ring-2"
                {...profileForm.register('bio')}
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Public Theme</span>
              <select
                {...profileForm.register('public_theme')}
                className="h-11 rounded-xl border border-slate-200 bg-white/95 px-3 text-sm outline-none ring-blue-200 transition focus:border-blue-500 focus:ring-2"
              >
                <option value="DARK_MINIMAL">Dark Minimal</option>
                <option value="LIGHT_GLASS">Light Glass</option>
                <option value="CLASSIC_BLUE">Classic Blue</option>
              </select>
            </label>
            <div className="md:col-span-2">
              <Button type="submit" loading={profileForm.formState.isSubmitting}>
                Save Business Profile
              </Button>
              {linkedProfileMessage ? <p className="mt-2 text-sm text-blue-700">{linkedProfileMessage}</p> : null}
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}

export default MyAccountPage
