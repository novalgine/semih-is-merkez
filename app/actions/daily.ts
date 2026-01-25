/**
 * @deprecated This file is no longer used. 
 * The daily log system has been replaced with the new tasks system.
 * See app/actions/tasks.ts for the new implementation.
 * 
 * This file is kept for reference only and will be removed in a future update.
 * To clean up old data, run migrations/002_cleanup_old_daily_logs.sql
 */

'use server'

// This file is deprecated and should not be used.
// All functions have been migrated to the tasks system.

export async function createDailyLog() {
    throw new Error('This function is deprecated. Use the tasks system instead.')
}

export async function getDailyLogs() {
    throw new Error('This function is deprecated. Use the tasks system instead.')
}

export async function getActivityData() {
    throw new Error('This function is deprecated. Use the tasks system instead.')
}
