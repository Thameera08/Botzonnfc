import { zodResolver } from '@hookform/resolvers/zod'
import { Download } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Toggle from '../../components/ui/Toggle'
import { createProfile, getProfileById, updateProfile } from '../../services/api/profileApi'
import { downloadImage } from '../../utils/download'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  company_name: z.string().optional(),
  designation: z.string().optional(),
  username: z
    .string()
    .min(1, 'Username is required')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphen only'),
  email: z.string().email('Enter a valid email address'),
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
  status: z.enum(['ACTIVE', 'DISABLED']),
})

const initialValues = {
  full_name: '',
  company_name: '',
  designation: '',
  username: '',
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
  status: 'ACTIVE',
}

function ProfileFormPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loadingProfile, setLoadingProfile] = useState(mode === 'edit')
  const [qrImage, setQrImage] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  })

  const status = watch('status')

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Unable to read image file'))
      reader.readAsDataURL(file)
    })

  useEffect(() => {
    if (mode !== 'edit') return

    const loadProfile = async () => {
      setLoadingProfile(true)
      try {
        const profile = await getProfileById(id)

        if (!profile) return

        reset({
          ...initialValues,
          ...profile,
          status: profile.status || 'ACTIVE',
          linkedin_url: profile.linkedin_url || '',
          facebook_url: profile.facebook_url || '',
          instagram_url: profile.instagram_url || '',
          twitter_url: profile.twitter_url || '',
          whatsapp_url: profile.whatsapp_url || '',
        })

        setQrImage(profile.qr_image_url || '')
        setImagePreview(profile.profile_image_url || '')
      } finally {
        setLoadingProfile(false)
      }
    }

    loadProfile()
  }, [id, mode, reset])

  const formTitle = useMemo(() => (mode === 'edit' ? 'Edit Profile' : 'Create Profile'), [mode])

  const onSubmit = async (values) => {
    if (mode === 'edit') {
      await updateProfile(id, values)
    } else {
      await createProfile(values)
    }

    navigate('/admin/profiles')
  }

  if (loadingProfile) {
    return <Card className="p-6 text-sm text-slate-600">Loading profile...</Card>
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{formTitle}</h2>
          <p className="text-sm text-slate-600">Manage business card details, contact links, and profile status.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/profiles">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" form="profile-form" loading={isSubmitting}>
            Save
          </Button>
        </div>
      </div>

      <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Input label="Full Name *" error={errors.full_name?.message} {...register('full_name')} />
        <Input label="Company Name" error={errors.company_name?.message} {...register('company_name')} />
        <Input label="Designation" error={errors.designation?.message} {...register('designation')} />
        <Input label="Username *" error={errors.username?.message} {...register('username')} />
        <Input label="Email *" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone *" error={errors.phone?.message} {...register('phone')} />
        <Input label="Location" error={errors.location?.message} {...register('location')} />
        <Input label="NFC UID" error={errors.nfc_uid?.message} {...register('nfc_uid')} />

        <label className="md:col-span-2 flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Bio</span>
          <textarea
            rows={4}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-300 transition focus:border-sky-500 focus:ring-2"
            {...register('bio')}
          />
          {errors.bio?.message ? <span className="text-xs text-rose-600">{errors.bio?.message}</span> : null}
        </label>

        <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
          <Input label="LinkedIn URL" error={errors.linkedin_url?.message} {...register('linkedin_url')} />
          <Input label="Facebook URL" error={errors.facebook_url?.message} {...register('facebook_url')} />
          <Input label="Instagram URL" error={errors.instagram_url?.message} {...register('instagram_url')} />
          <Input label="Twitter/X URL" error={errors.twitter_url?.message} {...register('twitter_url')} />
          <Input label="WhatsApp URL" error={errors.whatsapp_url?.message} {...register('whatsapp_url')} />
        </div>

        <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Profile Image Upload (UI only)</p>
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm text-slate-600"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (file) {
                const dataUrl = await fileToDataUrl(file)
                setImagePreview(dataUrl)
                setValue('profile_image_url', dataUrl, { shouldDirty: true })
              }
            }}
          />
          {imagePreview ? (
            <img src={imagePreview} alt="Profile preview" className="mt-3 h-20 w-20 rounded-full object-cover ring-2 ring-white" />
          ) : null}
        </div>

        <div className="md:col-span-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <Toggle
            checked={status === 'ACTIVE'}
            onChange={(checked) => setValue('status', checked ? 'ACTIVE' : 'DISABLED')}
            label="Profile status"
          />
          <span className="text-sm text-slate-700">Status: {status}</span>
        </div>
      </form>

      {qrImage ? (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">QR Preview</p>
          <img src={qrImage} alt="QR code" className="mt-3 h-36 w-36 rounded bg-white p-2" />
          <Button className="mt-3" variant="secondary" onClick={() => downloadImage(qrImage, `${watch('username') || 'profile'}-qr.png`)}>
            <Download size={16} className="mr-2" /> Download QR
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

export default ProfileFormPage
