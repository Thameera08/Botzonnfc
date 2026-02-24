import {
  ArrowUpRight,
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
  const profileLink = typeof window !== 'undefined' ? window.location.href : ''

  const socialLinks = useMemo(
    () => [
      { icon: Linkedin, href: profile?.linkedin_url, label: 'LinkedIn' },
      { icon: Facebook, href: profile?.facebook_url, label: 'Facebook' },
      { icon: Instagram, href: profile?.instagram_url, label: 'Instagram' },
      { icon: Twitter, href: profile?.twitter_url, label: 'Twitter' },
      { icon: MessageCircle, href: profile?.whatsapp_url, label: 'WhatsApp' },
    ],
    [profile],
  )

  const detailLinks = useMemo(
    () => [
      {
        label: 'Facebook',
        subtitle: 'Open Facebook profile',
        icon: Facebook,
        href: profile?.facebook_url,
      },
      {
        label: 'Instagram',
        subtitle: 'Open Instagram profile',
        icon: Instagram,
        href: profile?.instagram_url,
      },
      {
        label: 'Website',
        subtitle: 'Visit company details',
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
    if (!profileLink) return
    await navigator.clipboard.writeText(profileLink)
    setCopyMessage('Link copied')
    setTimeout(() => setCopyMessage(''), 1500)
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
      <div className="min-h-screen bg-[#090d17] px-4 py-10 text-slate-200">
        <div className="mx-auto w-full max-w-md">
          <Card className="border-slate-700/50 bg-[#10182a] p-6 text-center text-slate-300">Loading profile...</Card>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#090d17] px-4 py-10 text-slate-200">
        <div className="mx-auto w-full max-w-md">
          <Card className="border-slate-700/50 bg-[#10182a] p-6 text-center text-slate-300">Profile not found.</Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.25),transparent_40%),#090d17] px-4 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1424] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
          <div className="relative h-72 overflow-hidden">
            <img
              src={profile.profile_image_url || 'https://placehold.co/600x800'}
              alt={profile.full_name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1424] via-[#0d1424]/55 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h1 className="text-4xl font-bold uppercase tracking-tight text-white">{profile.full_name}</h1>
              <p className="mt-1 text-sm text-slate-200">{profile.designation || 'Professional'}</p>
              <p className="text-xs text-slate-400">{profile.company_name || 'Company'}</p>
            </div>
          </div>

          <div className="space-y-3 bg-[#0d1424] p-4">
            {disabled ? (
              <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 px-3 py-2 text-xs text-amber-200">
                This business profile is currently unavailable.
              </div>
            ) : null}

            <div className="grid grid-cols-5 gap-2">
              {socialLinks.map((item) => {
                const Icon = item.icon
                const blocked = disabled || !item.href

                return (
                  <button
                    key={item.label}
                    type="button"
                    title={item.label}
                    disabled={blocked}
                    onClick={() => openSafe(item.href)}
                    className={`flex h-10 items-center justify-center rounded-xl border text-sm transition ${
                      blocked
                        ? 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
                        : 'border-slate-600/70 bg-slate-800/50 text-slate-100 hover:bg-slate-700/70'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                )
              })}
            </div>

            <div className="rounded-2xl border border-slate-700/60 bg-[#121b2f] p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">About</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{profile.bio || 'Welcome to my digital business profile.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => openSafe(`tel:${profile.phone}`, true)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  disabled
                    ? 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
                    : 'border-slate-600 bg-slate-800/50 text-slate-100 hover:bg-slate-700/70'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Phone size={14} /> Call
                </span>
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => openSafe(`mailto:${profile.email}`, true)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  disabled
                    ? 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
                    : 'border-slate-600 bg-slate-800/50 text-slate-100 hover:bg-slate-700/70'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Mail size={14} /> Email
                </span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700/70"
              >
                <span className="inline-flex items-center gap-2">
                  <Share2 size={14} /> Share
                </span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700/70"
              >
                <span className="inline-flex items-center gap-2">
                  <Copy size={14} /> Copy
                </span>
              </button>
            </div>

            {copyMessage ? <p className="text-center text-xs text-emerald-300">{copyMessage}</p> : null}

            <div className="space-y-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => openSafe(`mailto:${profile.email}`, true)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  disabled
                    ? 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
                    : 'border-slate-700 bg-slate-800/40 text-slate-100 hover:bg-slate-700/60'
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm">
                  <Mail size={15} /> {profile.email}
                </span>
                <ArrowUpRight size={15} className="text-slate-400" />
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => openSafe(`tel:${profile.phone}`, true)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  disabled
                    ? 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
                    : 'border-slate-700 bg-slate-800/40 text-slate-100 hover:bg-slate-700/60'
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm">
                  <Phone size={15} /> {profile.phone}
                </span>
                <ArrowUpRight size={15} className="text-slate-400" />
              </button>

              <button
                type="button"
                disabled={disabled || !profile.location}
                onClick={() => openSafe(`https://maps.google.com/?q=${encodeURIComponent(profile.location || '')}`)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  disabled || !profile.location
                    ? 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
                    : 'border-slate-700 bg-slate-800/40 text-slate-100 hover:bg-slate-700/60'
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm">
                  <MapPin size={15} /> {profile.location || 'Location unavailable'}
                </span>
                <ArrowUpRight size={15} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-2">
              {detailLinks.map((item) => {
                const Icon = item.icon
                const blocked = disabled || !item.href

                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled={blocked}
                    onClick={() => openSafe(item.href)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                      blocked
                        ? 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
                        : 'border-slate-700 bg-slate-800/40 text-slate-100 hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/20 text-blue-300">
                        <Icon size={15} />
                      </span>
                      <span>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.subtitle}</p>
                      </span>
                    </span>
                    <ArrowUpRight size={15} className="text-slate-400" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-slate-500">Minimal digital profile</p>
      </div>
    </div>
  )
}

export default PublicProfilePage
