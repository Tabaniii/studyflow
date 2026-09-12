import { supabase } from './supabaseClient'

export const ATTACHMENT_BUCKET = 'task-attachments'
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]

export function isAllowedAttachment(file) {
  if (!file) return false
  if (file.size > MAX_ATTACHMENT_BYTES) return false
  return ALLOWED_ATTACHMENT_TYPES.includes(file.type)
}

export function attachmentError(file) {
  if (!file) return 'File kosong'
  if (file.size > MAX_ATTACHMENT_BYTES) return 'Maksimal 10 MB per file'
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
    return 'Format yang boleh: JPG, PNG, WEBP, GIF, atau PDF'
  }
  return null
}

function safeFileName(name) {
  return String(name || 'lampiran').replace(/[^\w.\-]+/g, '_').slice(0, 80)
}

export async function uploadTaskAttachments(userId, taskId, files) {
  const uploaded = []
  for (const file of files) {
    const errorMessage = attachmentError(file)
    if (errorMessage) throw new Error(errorMessage)
    const path = `${userId}/${taskId}/${crypto.randomUUID()}-${safeFileName(file.name)}`
    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError

    const { data, error: insertError } = await supabase
      .from('task_attachments')
      .insert({
        task_id: taskId,
        user_id: userId,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      })
      .select()
      .single()
    if (insertError) throw insertError
    uploaded.push(data)
  }
  return uploaded
}

export async function deleteTaskAttachment(attachment) {
  if (attachment?.storage_path) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove([attachment.storage_path])
  }
  const { error } = await supabase.from('task_attachments').delete().eq('id', attachment.id)
  if (error) throw error
}

export async function deleteTaskAttachmentFiles(attachments = []) {
  const paths = attachments.map((item) => item.storage_path).filter(Boolean)
  if (paths.length > 0) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove(paths)
  }
}

export async function signedAttachmentUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(storagePath, 60 * 60)
  if (error) throw error
  return data.signedUrl
}
