import { useState, useRef, useCallback } from 'react'
import { Camera, X, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

interface Props {
  value: string | null
  onChange: (path: string | null) => void
}

async function compressImage(file: File): Promise<Blob> {
  if (file.size <= 2 * 1024 * 1024) return file
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const maxWidth = 1920
      const ratio = Math.min(maxWidth / img.width, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        'image/jpeg',
        0.85
      )
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function ScreenshotUpload({ value, onChange }: Props) {
  const { user } = useAuthStore()
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!user) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, or WebP images are supported.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be smaller than 5 MB.')
      return
    }
    setError(null)
    setPreview(URL.createObjectURL(file))
    setFileName(file.name)
    setUploading(true)
    try {
      const blob = await compressImage(file)
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('trade-screenshots')
        .upload(path, blob, { contentType: file.type, upsert: false })
      if (uploadError) throw uploadError
      onChange(path)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setPreview(null)
      setFileName(null)
      onChange(null)
    } finally {
      setUploading(false)
    }
  }, [user, onChange])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setFileName(null)
    setError(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasImage = preview !== null || value !== null

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Camera size={13} className="text-zinc-400" />
        <label className="text-xs text-zinc-400 uppercase tracking-wide">Chart Screenshot</label>
      </div>

      {hasImage ? (
        <div className="rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800/50">
          {preview && <img src={preview} alt="Chart screenshot" className="w-full object-cover max-h-56" />}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-zinc-400 truncate">{fileName ?? 'screenshot'}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0 ml-2"
            >
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all ${
            dragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-zinc-700 hover:border-blue-500/50 hover:bg-blue-500/5'
          }`}
        >
          <Upload size={22} className="text-zinc-500" />
          <p className="text-sm text-zinc-400">Drop image here or <span className="text-blue-400">browse</span></p>
          <p className="text-xs text-zinc-600">JPG, PNG, WebP • Max 5 MB</p>
        </div>
      )}

      {uploading && (
        <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse rounded-full" style={{ width: '60%' }} />
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f) }}
      />
    </div>
  )
}
