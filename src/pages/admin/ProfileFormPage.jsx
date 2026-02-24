import { zodResolver } from '@hookform/resolvers/zod'
import { Download } from 'lucide-react'
import { toPng } from 'html-to-image'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  public_theme: z.enum(['DARK_MINIMAL', 'LIGHT_GLASS', 'CLASSIC_BLUE']),
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
  public_theme: 'DARK_MINIMAL',
  status: 'ACTIVE',
}

function ProfileFormPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loadingProfile, setLoadingProfile] = useState(mode === 'edit')
  const [qrImage, setQrImage] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [downloadingCard, setDownloadingCard] = useState('')
  const [cardStyle, setCardStyle] = useState('BOLD_BLUE')
  const cardFrontRef = useRef(null)
  const cardBackRef = useRef(null)

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
  const selectedTheme = watch('public_theme')
  const fullName = watch('full_name')
  const designation = watch('designation')
  const companyName = watch('company_name')
  const usernameValue = watch('username')

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
          public_theme: profile.public_theme || 'DARK_MINIMAL',
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

  const downloadCardPng = async (targetRef, side) => {
    if (!targetRef.current) return

    try {
      setDownloadingCard(side)
      const dataUrl = await toPng(targetRef.current, { cacheBust: true, pixelRatio: 3 })
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${usernameValue || 'profile'}-nfc-card-${side}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } finally {
      setDownloadingCard('')
    }
  }

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

        <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Public Profile Theme</p>
          <p className="mt-1 text-xs text-slate-500">Select which public profile style this user should see.</p>

          <select
            {...register('public_theme')}
            className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 text-sm outline-none ring-blue-200 transition focus:border-blue-500 focus:ring-2"
          >
            <option value="DARK_MINIMAL">Dark Minimal</option>
            <option value="LIGHT_GLASS">Light Glass</option>
            <option value="CLASSIC_BLUE">Classic Blue</option>
          </select>

          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setValue('public_theme', 'DARK_MINIMAL', { shouldDirty: true })}
              className={`rounded-xl border p-3 text-left transition ${selectedTheme === 'DARK_MINIMAL' ? 'border-slate-900 ring-2 ring-slate-300' : 'border-slate-200'}`}
            >
              <div className="h-16 rounded-lg bg-gradient-to-b from-slate-800 to-slate-950" />
              <p className="mt-2 text-xs font-semibold text-slate-700">Dark Minimal</p>
            </button>
            <button
              type="button"
              onClick={() => setValue('public_theme', 'LIGHT_GLASS', { shouldDirty: true })}
              className={`rounded-xl border p-3 text-left transition ${selectedTheme === 'LIGHT_GLASS' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200'}`}
            >
              <div className="h-16 rounded-lg bg-gradient-to-r from-slate-100 to-cyan-100" />
              <p className="mt-2 text-xs font-semibold text-slate-700">Light Glass</p>
            </button>
            <button
              type="button"
              onClick={() => setValue('public_theme', 'CLASSIC_BLUE', { shouldDirty: true })}
              className={`rounded-xl border p-3 text-left transition ${selectedTheme === 'CLASSIC_BLUE' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200'}`}
            >
              <div className="h-16 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500" />
              <p className="mt-2 text-xs font-semibold text-slate-700">Classic Blue</p>
            </button>
          </div>
        </div>
      </form>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-800">NFC Business Card Preview</p>
            <p className="text-xs text-slate-500">Card text uses Connet Me branding (no “Let’s Talk”).</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={downloadingCard === 'front'}
              onClick={() => downloadCardPng(cardFrontRef, 'front')}
            >
              <Download size={14} className="mr-2" /> Download Front
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={downloadingCard === 'back'}
              onClick={() => downloadCardPng(cardBackRef, 'back')}
            >
              <Download size={14} className="mr-2" /> Download Back
            </Button>
          </div>
        </div>

        <div className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setCardStyle('BOLD_BLUE')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${cardStyle === 'BOLD_BLUE' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Bold Blue
          </button>
          <button
            type="button"
            onClick={() => setCardStyle('LIGHT_CLEAN')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${cardStyle === 'LIGHT_CLEAN' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Light Clean
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Front Side</p>
            <div
              ref={cardFrontRef}
              className={`relative mx-auto h-[210px] w-[340px] overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(6,37,79,0.35)] ${
                cardStyle === 'BOLD_BLUE'
                  ? 'bg-gradient-to-br from-[#0f75d9] to-[#0855a8] text-white'
                  : 'border border-slate-200 bg-gradient-to-br from-[#f5f9ff] to-[#e7f0ff] text-slate-900'
              }`}
            >
              <div className="absolute left-4 top-4 max-w-[180px]">
                <p className="text-[20px] font-black uppercase leading-tight">{fullName || 'FULL NAME'}</p>
                <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${cardStyle === 'BOLD_BLUE' ? 'text-white/85' : 'text-slate-700'}`}>
                  {designation || 'Designation'}
                </p>
              </div>

              <div className="absolute bottom-4 left-4 h-[86px] w-[86px] rounded-lg bg-white p-1.5 shadow-md">
                {qrImage ? (
                  <img src={qrImage} alt="QR code" className="h-full w-full rounded object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center rounded border border-slate-200 text-[10px] font-semibold text-slate-500">
                    QR AFTER SAVE
                  </div>
                )}
              </div>

              <div className={`absolute -right-3 top-3 text-[76px] font-black leading-[0.9] [writing-mode:vertical-rl] ${cardStyle === 'BOLD_BLUE' ? 'text-white/92' : 'text-blue-700/85'}`}>
                CONNET ME
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Back Side</p>
            <div
              ref={cardBackRef}
              className="relative mx-auto h-[210px] w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-[#f6fbff] text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
            >
              <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-blue-100/70" />
              <div className="absolute -bottom-10 left-16 h-24 w-24 rounded-full bg-blue-100/70" />
              <div className="absolute bottom-8 right-10 h-12 w-12 rounded-full bg-blue-200/70" />

              <div className="absolute right-5 top-4 text-xl text-blue-700">◉</div>

              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <p className="text-4xl font-black uppercase tracking-tight text-blue-700">{companyName || 'CONNETME'}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {designation || 'Digital NFC Business Card'}
                </p>
                <p className="mt-2 text-[11px] text-slate-500">Tap with NFC or scan QR to open profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {qrImage ? (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">QR Preview</p>
          <p className="mt-1 text-xs text-slate-500">Unique QR is generated per username and saved in database.</p>
          <img src={qrImage} alt="QR code" className="mt-3 h-36 w-36 rounded bg-white p-2" />
          <Button className="mt-3" variant="secondary" onClick={() => downloadImage(qrImage, `${watch('username') || 'profile'}-qr.png`)}>
            <Download size={16} className="mr-2" /> Download QR
          </Button>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          QR code will be auto-generated and saved after profile creation.
        </div>
      )}
    </Card>
  )
}

export default ProfileFormPage
