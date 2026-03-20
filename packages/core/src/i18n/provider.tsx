'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { fr, type Labels } from './index'

const LabelsContext = createContext<Labels>(fr)

interface LabelsProviderProps {
  labels?: Partial<Labels>
  children: ReactNode
}

export function LabelsProvider({ labels, children }: LabelsProviderProps) {
  const value = labels ? { ...fr, ...labels } : fr
  return (
    <LabelsContext.Provider value={value}>
      {children}
    </LabelsContext.Provider>
  )
}

export function useLabels(): Labels {
  return useContext(LabelsContext)
}
