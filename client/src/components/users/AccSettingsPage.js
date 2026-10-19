import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import AccNavBar from './AccNavBar'
import { fetchProfile, saveProfile, uploadLicense } from '../../api/account'
import './Accountpages.css'

const LICENSE_BADGE = {
  none: { cls: 'badge-pending', text: 'No license uploaded' },
  pending: { cls: 'badge-pending', text: 'Verification pending' },
  verified: { cls: 'badge-verified', text: 'Verified' },
  rejected: { cls: 'badge-rejected', text: 'Rejected · please upload a new photo' },
}

const AccSettingsPage = ({ onUserUpdate }) => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' })
  const [license, setLicense] = useState({ status: 'none', front: false, back: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        setForm({ firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone, address: p.address })
        setLicense(p.license)
      })
      .catch(() => message.error('Could not load your profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const p = await saveProfile(form)
      message.success('Changes saved')
      if (onUserUpdate) onUserUpdate({ firstName: p.firstName, lastName: p.lastName, email: p.email })
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not save your changes.')
    } finally {
      setSaving(false)
    }
  }

  // up to two photos: the first is the front of the license, the second the back
  const pickFiles = (list) => {
    const picked = Array.from(list || []).filter((f) => ['image/jpeg', 'image/png'].includes(f.type)).slice(0, 2)
    if (!picked.length) return message.error('Choose JPG or PNG photos.')
    if (picked.some((f) => f.size > 5 * 1024 * 1024)) return message.error('Each photo must be 5 MB or smaller.')
    setFiles(picked)
  }

  const handleUpload = async () => {
    try {
      setUploading(true)
      const p = await uploadLicense(files)
      setLicense(p.license)
      setFiles([])
      message.success('License uploaded. It will be reviewed by our staff.')
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not upload your license.')
    } finally {
      setUploading(false)
    }
  }

  const badge = LICENSE_BADGE[license.status] || LICENSE_BADGE.none

  return (
    <div>
      <div className="profile-page">
        <div className="acc-navbar">

          <AccNavBar current="/profile" />
        </div>

        <main className="account-main">
          <form onSubmit={handleSave}>
            <header className="account-header">
              <h1>Account settings</h1>
              <button type="submit" className="btn-primary" disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </header>

            {/* Personal information */}
            <section className="card" aria-labelledby="personal-title">
              <h2 id="personal-title">Personal information</h2>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="firstName">First name</label>
                  <input id="firstName" name="firstName" type="text" autoComplete="given-name" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="lastName">Last name</label>
                  <input id="lastName" name="lastName" type="text" autoComplete="family-name" value={form.lastName} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} placeholder="+63 900 000 0000" />
                </div>
                <div className="field">
                  <label htmlFor="address">Address</label>
                  <input id="address" name="address" type="text" autoComplete="street-address" value={form.address} onChange={handleChange} placeholder="Imus, Cavite" />
                </div>
              </div>
            </section>

            {/* Driver's license */}
            <section className="card" aria-labelledby="license-title">
              <h2 id="license-title">Driver&apos;s license</h2>

              <div
                className="dropzone"
                style={dragging ? { borderColor: '#003b86' } : undefined}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); pickFiles(e.dataTransfer.files) }}
              >
                <p className="dropzone-title">Drag and drop your license (front and back)</p>
                <p className="dropzone-sub">JPG or PNG, up to 5 MB · first photo is the front, second the back</p>

                <input id="licenseFile" name="license" type="file" accept="image/jpeg,image/png" multiple hidden
                  onChange={(e) => { pickFiles(e.target.files); e.target.value = '' }} />
                <label htmlFor="licenseFile" className="btn-secondary">Choose files</label>

                {files.length > 0 && (
                  <>
                    <p className="dropzone-sub">{files.map((f, i) => `${i === 0 ? 'Front' : 'Back'}: ${f.name}`).join(' · ')}</p>
                    <button type="button" className="btn-primary" onClick={handleUpload} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload license'}
                    </button>
                  </>
                )}
              </div>

              <p className="dropzone-sub">
                {license.front ? 'Front uploaded' : 'No front photo yet'} · {license.back ? 'Back uploaded' : 'No back photo yet'}
              </p>
              <span className={`badge ${badge.cls}`}>{badge.text}</span>
            </section>
          </form>
        </main>
      </div>
    </div>
  )
}

export default AccSettingsPage