import {
  ChevronRight,
  Copy,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Twitter,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import { getPublicProfile } from '../../services/api/profileApi'

function PublicProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const response = await getPublicProfile(username)
        setProfile(response?.data || response)
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  const disabled = profile?.status === 'DISABLED'
  const profileLink = window.location.href

  const socialCircles = useMemo(
    () => [
      { icon: Linkedin, href: profile?.linkedin_url, label: 'LinkedIn' },
      { icon: Facebook, href: profile?.facebook_url, label: 'Facebook' },
      { icon: Instagram, href: profile?.instagram_url, label: 'Instagram' },
      { icon: Twitter, href: profile?.twitter_url, label: 'Twitter' },
      { icon: MessageCircle, href: profile?.whatsapp_url, label: 'WhatsApp' },
    ],
    [profile],
  )

  const infoTiles = useMemo(
    () => [
      {
        title: 'Facebook',
        subtitle: 'Live up on Facebook',
        icon: Facebook,
        href: profile?.facebook_url,
      },
      {
        title: 'Instagram',
        subtitle: 'Follow us on Instagram',
        icon: Instagram,
        href: profile?.instagram_url,
      },
      {
        title: 'Our Website',
        subtitle: 'Visit for more information',
        icon: Globe,
        href: profile?.company_name ? `https://www.google.com/search?q=${encodeURIComponent(profile.company_name)}` : '',
      },
    ],
    [profile],
  )

  const openSafe = (url, sameTab = false) => {
    if (disabled || !url) return
    if (sameTab) {
      window.open(url, '_self')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(profileLink)
    setCopyMessage('Profile link copied')
    setTimeout(() => setCopyMessage(''), 1600)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: profile?.full_name || 'Business profile',
        text: profile?.designation || '',
        url: profileLink,
      })
    } else {
      await handleCopy()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md p-6 text-center text-slate-600">Loading profile...</Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md p-6 text-center text-slate-600">Profile not found.</Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="relative h-[min(860px,calc(100vh-3rem))] overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f4f7ff] shadow-[0_24px_60px_rgba(15,17,24,0.28)]">
          <div className="h-full overflow-y-auto overscroll-contain pb-40">
          <div className="relative h-[360px] overflow-hidden">
            <img
              src={profile.profile_image_url || 'https://placehold.co/600x800'}
              alt={profile.full_name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/40 to-black/20" />

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <p className="text-4xl font-black uppercase leading-[0.95] tracking-wide">{profile.full_name}</p>
              <p className="mt-2 text-sm font-medium text-white/90">{profile.designation || 'Professional'}</p>
              <p className="text-xs text-white/80">{profile.company_name || 'Company'}</p>

              <div className="mt-4 flex gap-2">
                {socialCircles.map((social) => {
                  const Icon = social.icon
                  const blocked = disabled || !social.href
                  return (
                    <button
                      key={social.label}
                      type="button"
                      title={social.label}
                      onClick={() => openSafe(social.href)}
                      disabled={blocked}
                      className={`grid h-10 w-10 place-items-center rounded-full border text-white transition ${
                        blocked
                          ? 'cursor-not-allowed border-white/30 bg-white/10 text-white/50'
                          : 'border-white/50 bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <Icon size={17} />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="min-h-[calc(100%-360px)] bg-gradient-to-b from-[#111827] to-[#f4f7ff] px-4 pb-8 pt-4">
            {disabled ? (
              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                This business profile is currently unavailable.
              </div>
            ) : null}

            <div className="rounded-2xl bg-white/95 p-4 shadow-lg">
              <p className="text-sm font-semibold text-slate-900">About Me</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{profile.bio || 'Welcome to my digital business profile.'}</p>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => openSafe(`mailto:${profile.email}`, true)}
                  disabled={disabled}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                    disabled ? 'cursor-not-allowed border-slate-200 text-slate-400' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail size={16} /> {profile.email}
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => openSafe(`tel:${profile.phone}`, true)}
                  disabled={disabled}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                    disabled ? 'cursor-not-allowed border-slate-200 text-slate-400' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone size={16} /> {profile.phone}
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => openSafe(`https://maps.google.com/?q=${encodeURIComponent(profile.location || '')}`)}
                  disabled={disabled || !profile.location}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                    disabled || !profile.location
                      ? 'cursor-not-allowed border-slate-200 text-slate-400'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPin size={16} /> {profile.location || 'Location unavailable'}
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {infoTiles.map((tile) => {
                const Icon = tile.icon
                const blocked = disabled || !tile.href

                return (
                  <button
                    key={tile.title}
                    type="button"
                    onClick={() => openSafe(tile.href)}
                    disabled={blocked}
                    className={`flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left shadow-sm transition ${
                      blocked ? 'cursor-not-allowed opacity-55' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-100 text-blue-600">
                        <Icon size={16} />
                      </span>
                      <span>
                        <p className="text-sm font-semibold text-slate-900">{tile.title}</p>
                        <p className="text-xs text-slate-500">{tile.subtitle}</p>
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                )
              })}
            </div>

          </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200/70 bg-white/95 p-3 backdrop-blur">
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => openSafe(`tel:${profile.phone}`, true)}
                className={`inline-flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-semibold ${
                  disabled ? 'cursor-not-allowed text-slate-400' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Phone size={16} />
                Call
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => openSafe(`mailto:${profile.email}`, true)}
                className={`inline-flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-semibold ${
                  disabled ? 'cursor-not-allowed text-slate-400' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Mail size={16} />
                Email
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>

            {copyMessage ? <p className="mt-1 text-center text-xs font-medium text-emerald-600">{copyMessage}</p> : null}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">Powered digital profile</div>
      </div>
    </div>
  )
}

export default PublicProfilePage
