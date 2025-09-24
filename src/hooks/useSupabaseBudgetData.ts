import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const defaultBudgetData = {
  income: {
    biweeklyNet: 0,
    nextPayDate: new Date().toISOString().split('T')[0]
  },
  expenses: {
    fixed: [],
    variable: [],
    discretionary: [],
    twentyEightDay: []
  },
  debts: [],
  emergencyFund: {
    current: 0,
    target: 0
  },
  savingsGoals: [],
  vehicles: [],
  vehicleExpenses: [],
  partner: null
}

export const useSupabaseBudgetData = (user: User | null) => {
  const [budgetData, setBudgetDataState] = useState(defaultBudgetData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data when user changes
  useEffect(() => {
    if (!user) {
      setBudgetDataState(defaultBudgetData)
      setLoading(false)
      return
    }

    loadBudgetData()
  }, [user])

  const loadBudgetData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('budget_data')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data && data.length > 0) {
        setBudgetDataState({ ...defaultBudgetData, ...data[0].data })
      } else {
        // Create initial budget data for new user
        await saveBudgetData(defaultBudgetData)
        setBudgetDataState(defaultBudgetData)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error loading budget data:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveBudgetData = async (newData: any) => {
    if (!user) return

    try {
      setError(null)

      const { error } = await supabase
        .from('budget_data')
        .upsert({
          user_id: user.id,
          data: newData,
        })

      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      console.error('Error saving budget data:', err)
      throw err
    }
  }

  const setBudgetData = async (newData: any) => {
    setBudgetDataState(newData)
    
    // Save to Supabase in the background
    if (user) {
      try {
        await saveBudgetData(newData)
      } catch (err) {
        // If save fails, revert local state
        console.error('Failed to save to Supabase, reverting local changes')
        await loadBudgetData() // Reload from server
      }
    }
  }

  return {
    budgetData,
    setBudgetData,
    loading,
    error,
    reload: loadBudgetData,
  }
}