'use client'

import { supabase } from './supabaseClient'
import { insertFeatureActivityEvent } from './supabaseDb'

export type FeatureEventType =
  | 'career_test_completed'
  | 'mentor_question_submitted'
  | 'pick_viewed'
  | 'vod_watched_completed'

export type FeatureActivityEvent = {
  id: string
  userId?: string
  institutionCode: string
  studentEmail: string
  studentName: string
  eventType: FeatureEventType
  occurredAt: string // ISO
  durationSeconds?: number
  meta?: Record<string, any>
}

export const FEATURE_EVENTS_KEY = 'job_sim_feature_events'

function createId() {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID() as string
    }
  } catch {
    // ignore
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readAllLocalEvents(): FeatureActivityEvent[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(FEATURE_EVENTS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as FeatureActivityEvent[]
  } catch {
    return []
  }
}

export function loadLocalFeatureEventsForInstitution(institutionCode: string): FeatureActivityEvent[] {
  const all = readAllLocalEvents()
  if (!institutionCode) return []
  return all.filter((e) => (e.institutionCode || '') === institutionCode)
}

export async function trackFeatureActivityEvent(params: {
  userId?: string
  institutionCode: string
  studentEmail: string
  studentName: string
  eventType: FeatureEventType
  durationSeconds?: number
  meta?: Record<string, any>
}) {
  const occurredAt = new Date().toISOString()
  const event: FeatureActivityEvent = {
    id: createId(),
    userId: params.userId,
    institutionCode: params.institutionCode,
    studentEmail: params.studentEmail,
    studentName: params.studentName,
    eventType: params.eventType,
    occurredAt,
    durationSeconds: params.durationSeconds,
    meta: params.meta || {},
  }

  // 1) localStorage fallback (실시간/개발 용도)
  try {
    const all = readAllLocalEvents()
    all.push(event)
    // 너무 커지지 않게 제한 (대략 최근 5000개)
    const next = all.length > 5000 ? all.slice(all.length - 5000) : all
    window.localStorage.setItem(FEATURE_EVENTS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }

  // 2) Supabase (가능할 때만)
  if (supabase && params.userId && params.institutionCode) {
    try {
      await insertFeatureActivityEvent({
        userId: params.userId,
        institutionCode: params.institutionCode,
        studentEmail: params.studentEmail,
        studentName: params.studentName,
        eventType: params.eventType,
        occurredAt,
        durationSeconds: params.durationSeconds,
        meta: params.meta || {},
      })
    } catch {
      // ignore (안전장치)
    }
  }

  return event
}

export function getFeatureEventsKey() {
  return FEATURE_EVENTS_KEY
}

