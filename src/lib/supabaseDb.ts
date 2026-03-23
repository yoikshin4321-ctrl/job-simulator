import { supabase } from './supabaseClient'

/** Supabase/PostgREST 에러 객체를 사용자에게 보여줄 짧은 문자열로 */
export function formatSupabaseLikeError(e: unknown): string {
  if (e == null) return '알 수 없는 오류'
  if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message
  }
  return String(e)
}

export type ProfileRole = 'student' | 'institution_admin'

export type ProfileRow = {
  id: string
  role: ProfileRole
  name: string
  school: string
  major: string
  status: string
  interests: string[]
  institution_code: string
}

export type InstitutionRow = {
  id: string
  institution_code: string
  institution_name: string
  admin_id: string
  contact_email: string
}

export async function getSupabaseUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user?.id ?? null
}

export async function getProfileByUserId(userId: string): Promise<ProfileRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) return null
  if (!data) return null
  return {
    id: data.id,
    role: data.role,
    name: data.name || '',
    school: data.school || '',
    major: data.major || '',
    status: data.status || '',
    interests: (data.interests as string[]) || [],
    institution_code: data.institution_code || '',
  }
}

export async function getInstitutionByAdmin(adminId: string): Promise<InstitutionRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('institutions').select('*').eq('admin_id', adminId).single()
  if (error) return null
  if (!data) return null
  return {
    id: data.id,
    institution_code: data.institution_code,
    institution_name: data.institution_name,
    admin_id: data.admin_id,
    contact_email: data.contact_email || '',
  }
}

export async function getInstitutionByCode(institutionCode: string): Promise<InstitutionRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('institution_code', institutionCode)
    .single()
  if (error) return null
  if (!data) return null
  return {
    id: data.id,
    institution_code: data.institution_code,
    institution_name: data.institution_name,
    admin_id: data.admin_id,
    contact_email: data.contact_email || '',
  }
}

export async function upsertProfile(payload: {
  userId: string
  role: ProfileRole
  name: string
  school: string
  major: string
  status: string
  interests: string[]
  institution_code: string
}) {
  if (!supabase) return { ok: false, error: new Error('Supabase not configured') }
  const { error } = await supabase.from('profiles').upsert(
    {
      id: payload.userId,
      role: payload.role,
      name: payload.name,
      school: payload.school,
      major: payload.major,
      status: payload.status,
      interests: payload.interests,
      institution_code: payload.institution_code,
    },
    { onConflict: 'id' },
  )
  if (error) return { ok: false, error }
  return { ok: true }
}

export async function updateStudentInstitutionCode(payload: { userId: string; institutionCode: string }) {
  if (!supabase) return { ok: false, error: new Error('Supabase not configured') }
  const { error } = await supabase
    .from('profiles')
    .update({ institution_code: payload.institutionCode })
    .eq('id', payload.userId)
  if (error) return { ok: false, error }
  return { ok: true }
}

export async function insertInstitution(payload: {
  adminId: string
  institutionCode: string
  institutionName: string
  contactEmail: string
}) {
  if (!supabase) return { ok: false, error: new Error('Supabase not configured') }
  const { error } = await supabase.from('institutions').upsert(
    {
      institution_code: payload.institutionCode,
      institution_name: payload.institutionName,
      admin_id: payload.adminId,
      contact_email: payload.contactEmail,
    },
    { onConflict: 'institution_code' },
  )
  if (error) return { ok: false, error }
  return { ok: true }
}

export async function insertOrUpsertStepResult(payload: {
  userId: string
  institutionCode: string
  studentEmail: string
  studentName: string
  runId: string
  roleId: string
  levelIndex: number
  levelLabel: string
  resultJson: any
  answerText: string
  analyzedAt: string
  isResubmission: boolean
}) {
  if (!supabase) return { ok: false, error: new Error('Supabase not configured') }
  const { error } = await supabase.from('simulation_step_results').upsert(
    {
      user_id: payload.userId,
      institution_code: payload.institutionCode,
      student_email: payload.studentEmail,
      student_name: payload.studentName,
      run_id: payload.runId,
      role_id: payload.roleId,
      level_index: payload.levelIndex,
      level_label: payload.levelLabel,
      result_json: payload.resultJson,
      answer_text: payload.answerText,
      analyzed_at: payload.analyzedAt,
      is_resubmission: payload.isResubmission,
    },
    {
      onConflict: 'user_id,run_id,role_id,level_index,analyzed_at',
    },
  )
  if (error) return { ok: false, error }
  return { ok: true }
}

export async function insertOrUpsertFinalResult(payload: {
  userId: string
  institutionCode: string
  studentEmail: string
  studentName: string
  runId: string
  roleId: string
  finalJson: any
  analyzedAt: string
}) {
  if (!supabase) return { ok: false, error: new Error('Supabase not configured') }
  const { error } = await supabase.from('simulation_final_results').upsert(
    {
      user_id: payload.userId,
      institution_code: payload.institutionCode,
      student_email: payload.studentEmail,
      student_name: payload.studentName,
      run_id: payload.runId,
      role_id: payload.roleId,
      final_json: payload.finalJson,
      analyzed_at: payload.analyzedAt,
    },
    {
      onConflict: 'user_id,run_id,role_id,analyzed_at',
    },
  )
  if (error) return { ok: false, error }
  return { ok: true }
}

export async function fetchLatestFinalResultForUser(payload: { userId: string }) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('simulation_final_results')
    .select('*')
    .eq('user_id', payload.userId)
    .order('analyzed_at', { ascending: false })
    .limit(1)
  if (error) return null
  const row = data?.[0]
  if (!row) return null
  return {
    roleId: row.role_id,
    finalJson: row.final_json,
    analyzedAt: row.analyzed_at,
    institutionCode: row.institution_code,
    studentEmail: row.student_email,
    studentName: row.student_name,
    runId: row.run_id,
  }
}

export async function fetchStepResultsForInstitution(payload: { institutionCode: string }) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('simulation_step_results')
    .select('*')
    .eq('institution_code', payload.institutionCode)
    .order('analyzed_at', { ascending: false })
  if (error) return []

  return (data ?? []).map((row: any) => ({
    roleId: row.role_id,
    levelIndex: row.level_index,
    levelLabel: row.level_label,
    analyzedAt: row.analyzed_at,
    runId: row.run_id,
    studentEmail: row.student_email,
    studentName: row.student_name,
    institutionCode: row.institution_code,
    result: row.result_json,
    answer: row.answer_text,
    isResubmission: row.is_resubmission,
  }))
}

export async function fetchStepResultsForUser(payload: { userId: string }) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('simulation_step_results')
    .select('*')
    .eq('user_id', payload.userId)
    .order('analyzed_at', { ascending: false })
  if (error) return []

  return (data ?? []).map((row: any) => ({
    roleId: row.role_id,
    levelIndex: row.level_index,
    levelLabel: row.level_label,
    analyzedAt: row.analyzed_at,
    runId: row.run_id,
    studentEmail: row.student_email,
    studentName: row.student_name,
    institutionCode: row.institution_code,
    result: row.result_json,
    answer: row.answer_text,
    isResubmission: row.is_resubmission,
  }))
}

export async function updateStudentInterests(payload: { userId: string; interests: string[] }) {
  if (!supabase) return { ok: false, error: new Error('Supabase not configured') }
  const { error } = await supabase.from('profiles').update({ interests: payload.interests }).eq('id', payload.userId)
  if (error) return { ok: false, error }
  return { ok: true }
}

export async function insertFeatureActivityEvent(payload: {
  userId: string
  institutionCode: string
  studentEmail: string
  studentName: string
  eventType: string
  occurredAt: string
  durationSeconds?: number
  meta: Record<string, any>
}) {
  if (!supabase) return { ok: false, error: new Error('Supabase not configured') }
  const { error } = await supabase.from('institution_activity_events').insert({
    user_id: payload.userId,
    institution_code: payload.institutionCode,
    student_email: payload.studentEmail,
    student_name: payload.studentName,
    event_type: payload.eventType,
    occurred_at: payload.occurredAt,
    duration_seconds: payload.durationSeconds ?? null,
    meta_json: payload.meta,
  })
  if (error) return { ok: false, error }
  return { ok: true }
}

export async function fetchFeatureActivityEventsForInstitution(payload: {
  institutionCode: string
  sinceIso?: string
}) {
  if (!supabase) return []

  let query = supabase
    .from('institution_activity_events')
    .select('*')
    .eq('institution_code', payload.institutionCode)
    .order('occurred_at', { ascending: false })

  if (payload.sinceIso) {
    query = query.gte('occurred_at', payload.sinceIso)
  }

  const { data, error } = await query.limit(5000)
  if (error) return []

  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    institutionCode: row.institution_code,
    studentEmail: row.student_email,
    studentName: row.student_name,
    eventType: row.event_type,
    occurredAt: row.occurred_at,
    durationSeconds: row.duration_seconds,
    meta: row.meta_json,
  }))
}

