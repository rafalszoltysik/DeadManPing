'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { Monitor, MonitorUpdateRequest } from '@/lib/types/monitor'
import type { PayloadField, PayloadValidationRules } from '@/lib/payload-validator'
import { InfoTooltip } from './Tooltip'
import { InfoIcon } from './Icons'
import { getErrorMessage } from '@/lib/error-utils'

interface MonitorPayloadValidationProps {
  monitor: Monitor
  loading: boolean
  onUpdate: (updatedMonitor: Monitor) => void
  onRefresh: () => Promise<void>
  setLoading: (loading: boolean) => void
}

function getRuleLabel(rule: string): string {
  switch (rule) {
    case '>':
      return 'greater than'
    case '<':
      return 'less than'
    case '>=':
      return 'greater than or equal'
    case '<=':
      return 'less than or equal'
    case '==':
      return 'equal to'
    case '!=':
      return 'not equal to'
    default:
      return rule
  }
}

export const MonitorPayloadValidation = memo(function MonitorPayloadValidation({
  monitor,
  loading,
  onUpdate,
  onRefresh,
  setLoading: setParentLoading,
}: MonitorPayloadValidationProps) {
  const [editingPayloadRules, setEditingPayloadRules] = useState(false)
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [originalEditingField, setOriginalEditingField] = useState<{ name: string; rule: string } | null>(null)
  const [payloadFields, setPayloadFields] = useState<Array<{
    name: string
    type: 'number' | 'boolean' | 'string'
    rule: '>' | '<' | '>=' | '<=' | '==' | '!='
    value: string
    severity: 'warn' | 'error'
  }>>([])
  const [payloadError, setPayloadError] = useState<string | null>(null)
  const [payloadSuccess, setPayloadSuccess] = useState(false)

  // Load existing payload validation rules when monitor changes
  useEffect(() => {
    if (monitor.payload_validation_rules && monitor.payload_validation_rules.fields) {
      const fields = monitor.payload_validation_rules.fields.map((field: PayloadField) => ({
        name: field.name || '',
        type: field.type || 'number',
        rule: field.rule || '>',
        value: String(field.value ?? ''),
        severity: field.severity || 'error',
      }))
      setPayloadFields(fields)
    } else {
      setPayloadFields([])
    }
  }, [monitor.payload_validation_rules])

  // Reload payload fields only when editing a specific field (not when adding new)
  useEffect(() => {
    if (editingPayloadRules && editingFieldIndex !== null && monitor.payload_validation_rules && monitor.payload_validation_rules.fields) {
      const field = monitor.payload_validation_rules.fields[editingFieldIndex]
      if (field) {
        const fieldData = {
          name: field.name || '',
          type: field.type || 'number',
          rule: field.rule || '>',
          value: String(field.value ?? ''),
          severity: field.severity || 'error',
        }
        setPayloadFields([fieldData])
        setOriginalEditingField({
          name: field.name || '',
          rule: field.rule || '>',
        })
      }
    } else if (editingFieldIndex === null) {
      setOriginalEditingField(null)
    }
  }, [editingPayloadRules, editingFieldIndex, monitor.payload_validation_rules])

  // Check if a rule with the same field name and condition already exists
  const checkDuplicateRule = useCallback((
    fieldName: string,
    rule: string,
    currentFieldIndex: number | null = null
  ): boolean => {
    if (!fieldName.trim()) return false

    // When editing, only show validation if values have changed from original
    if (editingFieldIndex !== null && originalEditingField) {
      const isSameAsOriginal = 
        fieldName.trim().toLowerCase() === originalEditingField.name.trim().toLowerCase() &&
        rule === originalEditingField.rule
      
      if (isSameAsOriginal) return false
    }

    // Check existing rules in monitor (skip the one being edited)
    if (monitor.payload_validation_rules?.fields) {
      for (let i = 0; i < monitor.payload_validation_rules.fields.length; i++) {
        if (editingFieldIndex !== null && i === editingFieldIndex) continue
        
        const existingField = monitor.payload_validation_rules.fields[i]
        if (
          existingField.name.trim().toLowerCase() === fieldName.trim().toLowerCase() &&
          existingField.rule === rule
        ) {
          return true
        }
      }
    }

    // Check rules in payloadFields (only when adding new fields, not when editing)
    if (editingFieldIndex === null) {
      for (let i = 0; i < payloadFields.length; i++) {
        if (currentFieldIndex !== null && i === currentFieldIndex) continue
        
        const field = payloadFields[i]
        if (
          field.name.trim().toLowerCase() === fieldName.trim().toLowerCase() &&
          field.rule === rule
        ) {
          return true
        }
      }
    }

    return false
  }, [editingFieldIndex, originalEditingField, monitor.payload_validation_rules, payloadFields])

  const handleSavePayloadRules = useCallback(async () => {
    setParentLoading(true)
    setPayloadError(null)
    setPayloadSuccess(false)

    try {
      let payloadValidationRules: PayloadValidationRules | null = null
      if (payloadFields.length > 0) {
        const fields = payloadFields
          .filter((field) => field.name.trim() !== '')
          .map((field) => {
            let parsedValue: number | boolean | string
            if (field.type === 'number') {
              parsedValue = Number(field.value)
              if (isNaN(parsedValue)) {
                throw new Error(`Field "${field.name}" value must be a valid number`)
              }
            } else if (field.type === 'boolean') {
              if (field.value === 'true') parsedValue = true
              else if (field.value === 'false') parsedValue = false
              else {
                throw new Error(`Field "${field.name}" value must be "true" or "false"`)
              }
            } else {
              parsedValue = field.value
            }

            return {
              name: field.name.trim(),
              type: field.type,
              rule: field.rule,
              value: parsedValue,
              severity: field.severity || 'error',
            }
          })

        if (fields.length > 0) {
          // Validate for duplicates before saving
          for (let i = 0; i < fields.length; i++) {
            const field = fields[i]
            const isDuplicate = checkDuplicateRule(
              field.name,
              field.rule,
              editingFieldIndex !== null ? null : i
            )
            
            if (isDuplicate) {
              throw new Error(
                `A rule with field name '${field.name}' and condition '${getRuleLabel(field.rule)}' already exists. You can add multiple rules for the same field only if they have different conditions.`
              )
            }
          }
          
          // Also check for duplicates within payloadFields itself (when adding multiple new fields)
          if (editingFieldIndex === null && fields.length > 1) {
            const seen = new Set<string>()
            for (const field of fields) {
              const key = `${field.name.trim().toLowerCase()}:${field.rule}`
              if (seen.has(key)) {
                throw new Error(
                  `Duplicate rule detected: field name '${field.name}' with condition '${getRuleLabel(field.rule)}' appears multiple times. You can add multiple rules for the same field only if they have different conditions.`
                )
              }
              seen.add(key)
            }
          }

          // If editing a single field, merge with existing fields
          if (editingFieldIndex !== null && monitor.payload_validation_rules?.fields) {
            const existingFields = [...monitor.payload_validation_rules.fields]
            existingFields[editingFieldIndex] = fields[0]
            payloadValidationRules = { fields: existingFields }
          } else {
            // Adding new field(s) - merge with existing if any
            if (monitor.payload_validation_rules?.fields) {
              payloadValidationRules = { fields: [...monitor.payload_validation_rules.fields, ...fields] }
            } else {
              payloadValidationRules = { fields }
            }
          }
        }
      }

      const requestBody: MonitorUpdateRequest = {
        payloadValidationRules: payloadValidationRules,
        expectedUpdatedAt: monitor.updated_at,
      }

      const response = await fetch(`/api/monitors/${monitor.slug}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.conflict && data.latestMonitor) {
          onUpdate(data.latestMonitor)
          throw new Error(data.error || 'Monitor was modified. Please review changes and try again.')
        }
        throw new Error(data.error || 'Failed to update payload validation rules')
      }

      const data = await response.json()
      if (data.monitor) {
        onUpdate(data.monitor)
      }

      setPayloadSuccess(true)
      setEditingPayloadRules(false)
      setEditingFieldIndex(null)
      setOriginalEditingField(null)
      setPayloadFields([])
      await onRefresh()
      setTimeout(() => {
        setPayloadSuccess(false)
      }, 3000)
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      setPayloadError(errorMessage)
    } finally {
      setParentLoading(false)
    }
  }, [payloadFields, editingFieldIndex, monitor, onUpdate, onRefresh, checkDuplicateRule, setParentLoading])

  const handleDeletePayloadRule = useCallback(async (index: number) => {
    if (!monitor.payload_validation_rules?.fields) return
    
    const newFields = [...monitor.payload_validation_rules.fields]
    newFields.splice(index, 1)
    
    const payloadValidationRules = newFields.length > 0 ? { fields: newFields } : null
    
    try {
      const response = await fetch(`/api/monitors/${monitor.slug}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payloadValidationRules,
          expectedUpdatedAt: monitor.updated_at,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete rule')
      }

      const data = await response.json()
      onUpdate(data.monitor)
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      console.error('Error deleting rule:', errorMessage)
    }
  }, [monitor.slug, monitor.updated_at, monitor.payload_validation_rules, onUpdate])

  const handleEditPayloadRule = useCallback((index: number) => {
    if (!monitor.payload_validation_rules?.fields) return
    const field = monitor.payload_validation_rules.fields[index]
    setEditingFieldIndex(index)
    setPayloadFields([{
      name: field.name,
      type: field.type,
      rule: field.rule,
      value: String(field.value),
      severity: field.severity || 'error',
    }])
    setOriginalEditingField({
      name: field.name,
      rule: field.rule,
    })
    setEditingPayloadRules(true)
  }, [monitor.payload_validation_rules])

  return (
    <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">Payload Validation Rules</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure rules to verify that your cron job executed correctly
          </p>
        </div>
        {!editingPayloadRules && (
          <button
            onClick={() => {
              setEditingFieldIndex(null)
              setOriginalEditingField(null)
              setPayloadFields([{
                name: '',
                type: 'number',
                rule: '>',
                value: '',
                severity: 'error',
              }])
              setEditingPayloadRules(true)
            }}
            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-smooth"
          >
            Add
          </button>
        )}
      </div>

      {payloadError && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4 text-sm">
          {payloadError}
        </div>
      )}

      {payloadSuccess && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-4 text-sm">
          Payload validation rules updated successfully!
        </div>
      )}

      {editingPayloadRules ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Payload Fields
              </label>
              {editingFieldIndex === null && (
                <button
                  type="button"
                  onClick={() => {
                    if (payloadFields.length < 5) {
                      setPayloadFields([...payloadFields, {
                        name: '',
                        type: 'number',
                        rule: '>',
                        value: '',
                        severity: 'error',
                      }])
                    }
                  }}
                  disabled={payloadFields.length >= 5}
                  className="text-xs px-2 py-1 border border-border rounded hover:bg-accent transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Field {payloadFields.length >= 5 ? '(max 5)' : ''}
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Configure fields to validate in your payload. Only declared fields are processed, rest is ignored. Maximum 5 fields per monitor. Field names must be 100 characters or less.
            </p>
            
            {payloadFields.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No fields configured. Click "Add Field" to add validation rules.
              </p>
            ) : (
              <div className="space-y-4">
                {payloadFields.map((field, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <h4 className="text-sm font-semibold">Field {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setPayloadFields(payloadFields.filter((_, i) => i !== index))
                        }}
                        className="text-xs px-3 py-1.5 text-error hover:bg-error/10 rounded transition-smooth font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-2 text-foreground">Field Name</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...payloadFields]
                            newFields[index].name = e.target.value
                            setPayloadFields(newFields)
                          }}
                          placeholder="e.g., count"
                          className={`w-full px-3 py-2 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth ${
                            field.name.trim() && checkDuplicateRule(field.name, field.rule, editingFieldIndex !== null ? null : index)
                              ? 'border-error/50 focus:ring-error/50'
                              : 'border-input'
                          }`}
                        />
                        {field.name.trim() && checkDuplicateRule(field.name, field.rule, editingFieldIndex !== null ? null : index) && (
                          <p className="text-xs text-error mt-1">
                            A rule with this field name and condition already exists. Use a different condition to add multiple rules for the same field.
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-2 text-foreground">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const newFields = [...payloadFields]
                            newFields[index].type = e.target.value as 'number' | 'boolean' | 'string'
                            if (e.target.value === 'number') {
                              newFields[index].rule = '>'
                              newFields[index].value = ''
                            } else {
                              newFields[index].rule = '=='
                              newFields[index].value = ''
                            }
                            setPayloadFields(newFields)
                          }}
                          className="w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22rgb(161%2C%20161%2C%20170)%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                        >
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="string">String</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-2 text-foreground">Rule</label>
                        <select
                          value={field.rule}
                          onChange={(e) => {
                            const newFields = [...payloadFields]
                            newFields[index].rule = e.target.value as '>' | '<' | '>=' | '<=' | '==' | '!='
                            setPayloadFields(newFields)
                          }}
                          className={`w-full px-3 py-2 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22rgb(161%2C%20161%2C%20170)%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${
                            field.name.trim() && checkDuplicateRule(field.name, field.rule, editingFieldIndex !== null ? null : index)
                              ? 'border-error/50 focus:ring-error/50'
                              : 'border-input'
                          }`}
                        >
                          {field.type === 'number' ? (
                            <>
                              <option value=">">Greater than</option>
                              <option value="<">Less than</option>
                              <option value=">=">Greater than or equal</option>
                              <option value="<=">Less than or equal</option>
                              <option value="==">Equal to</option>
                              <option value="!=">Not equal to</option>
                            </>
                          ) : (
                            <>
                              <option value="==">Equal to</option>
                              <option value="!=">Not equal to</option>
                            </>
                          )}
                        </select>
                        {field.name.trim() && checkDuplicateRule(field.name, field.rule, editingFieldIndex !== null ? null : index) && (
                          <p className="text-xs text-error mt-1">
                            A rule with this field name and condition already exists. Use a different condition to add multiple rules for the same field.
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-2 text-foreground">Value</label>
                        <div className="relative">
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={field.value}
                            onChange={(e) => {
                              const newFields = [...payloadFields]
                              newFields[index].value = e.target.value
                              setPayloadFields(newFields)
                            }}
                            placeholder={
                              field.type === 'number' 
                                ? 'e.g., 100' 
                                : field.type === 'boolean'
                                ? 'true or false'
                                : 'e.g., "ok"'
                            }
                            className="w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                          />
                          {field.type === 'number' && (
                            <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const newFields = [...payloadFields]
                                  const currentValue = Number(newFields[index].value) || 0
                                  newFields[index].value = String(currentValue + 1)
                                  setPayloadFields(newFields)
                                }}
                                className="w-5 h-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth rounded-t"
                                tabIndex={-1}
                              >
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 0L10 6H0L5 0Z" fill="currentColor"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const newFields = [...payloadFields]
                                  const currentValue = Number(newFields[index].value) || 0
                                  newFields[index].value = String(Math.max(0, currentValue - 1))
                                  setPayloadFields(newFields)
                                }}
                                className="w-5 h-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth rounded-b"
                                tabIndex={-1}
                              >
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 6L0 0H10L5 6Z" fill="currentColor"/>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-medium mb-2 text-foreground">
                        Severity
                        <InfoTooltip content="Error: Monitor will be marked as FAIL if validation fails. Warning: Monitor stays healthy but shows warning status.">
                          <button type="button" className="text-muted-foreground hover:text-foreground transition-smooth">
                            <InfoIcon className="w-3.5 h-3.5" />
                          </button>
                        </InfoTooltip>
                      </label>
                      <select
                        value={field.severity}
                        onChange={(e) => {
                          const newFields = [...payloadFields]
                          newFields[index].severity = e.target.value as 'warn' | 'error'
                          setPayloadFields(newFields)
                        }}
                        className="w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22rgb(161%2C%20161%2C%20170)%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                      >
                        <option value="error">Error (mark as FAIL)</option>
                        <option value="warn">Warning</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {payloadFields.length > 0 && (
              <div className="mt-4 p-3 bg-muted/30 border border-border rounded-lg">
                <p className="text-xs font-medium mb-1.5 text-foreground">Example:</p>
                <p className="text-xs text-muted-foreground">
                  Validate that <code className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">count</code> field is greater than 100.
                  Your cron job should send: <code className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">{"{ \"count\": 120 }"}</code>
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleSavePayloadRules}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth"
            >
              {loading ? 'Saving...' : editingFieldIndex !== null ? 'Save Changes' : 'Add Rule'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingPayloadRules(false)
                setEditingFieldIndex(null)
                setOriginalEditingField(null)
                setPayloadFields([])
                setPayloadError(null)
                setPayloadSuccess(false)
                if (monitor.payload_validation_rules && monitor.payload_validation_rules.fields) {
                  const fields = monitor.payload_validation_rules.fields.map((field: PayloadField) => ({
                    name: field.name || '',
                    type: field.type || 'number',
                    rule: field.rule || '>',
                    value: String(field.value ?? ''),
                    severity: field.severity || 'error',
                  }))
                  setPayloadFields(fields)
                } else {
                  setPayloadFields([])
                }
              }}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {monitor.payload_validation_rules && monitor.payload_validation_rules.fields && monitor.payload_validation_rules.fields.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Condition</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Value</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {monitor.payload_validation_rules.fields.map((field: PayloadField, index: number) => (
                    <tr key={index} className="border-b border-border last:border-b-0">
                      <td className="py-2 px-3 font-medium">{field.name}</td>
                      <td className="py-2 px-3 text-muted-foreground">{getRuleLabel(field.rule)}</td>
                      <td className="py-2 px-3 font-mono">{String(field.value)}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditPayloadRule(index)}
                            className="px-2 py-1 text-xs border border-border rounded hover:bg-accent transition-smooth"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePayloadRule(index)}
                            className="px-2 py-1 text-xs text-error border border-error/20 rounded hover:bg-error/10 transition-smooth"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No payload validation rules configured. Click "Add" to add rules.
            </p>
          )}
        </div>
      )}
    </div>
  )
})

