-- Add payload validation rules column to monitors table
ALTER TABLE monitors 
ADD COLUMN IF NOT EXISTS payload_validation_rules JSONB DEFAULT NULL;

-- Add index for JSONB queries (optional, but can help with performance)
CREATE INDEX IF NOT EXISTS idx_monitors_payload_validation_rules 
ON monitors USING GIN (payload_validation_rules);

-- Add comment explaining the structure
COMMENT ON COLUMN monitors.payload_validation_rules IS 
'JSONB object containing payload validation rules. Structure:
{
  "maxDurationMs": number,           // Max execution time in milliseconds
  "minCount": number,                // Minimum count value
  "maxCount": number,                 // Maximum count value
  "requiredFields": {                 // Required fields in metadata
    "fieldName": expectedValue
  },
  "customChecks": [                   // Array of custom validation functions
    {
      "field": "path.to.field",
      "operator": "eq|gt|lt|gte|lte|in|notIn",
      "value": expectedValue
    }
  ]
}';

