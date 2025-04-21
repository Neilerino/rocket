import React from 'react';
import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from 'shad/components/ui/select';
import { useParameterForm, ExerciseParameterFormData } from './useParameterForm';

// Define allowed data types
// const PARAMETER_DATA_TYPES = ['Number', 'Text', 'Boolean', 'Select List'] as const;
// type ParameterDataType = (typeof PARAMETER_DATA_TYPES)[number];

// Type for the data submitted by the form

interface ParameterFormProps {
  initialValues?: Partial<ExerciseParameterFormData>;
  onSubmit: (data: ExerciseParameterFormData) => void;
  onCancel: () => void;
}

const ParameterForm: React.FC<ParameterFormProps> = ({ onSubmit, onCancel }) => {
  const form = useParameterForm(onSubmit);

  return (
    <>
      <form.Field
        name="name"
        children={(field) => (
          <div>
            <Label>Name *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value ?? ''}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Weight, Distance, Heart Rate"
              required
            />
          </div>
        )}
      />

      {/* <form.Field
        name="dataType"
        children={(field) => (
          <div>
            <Label>Data Type *</Label>
            <Select
              value={field.state.value ?? ''}
              onValueChange={(value: ParameterDataType) => field.handleChange(value)}
              required
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {PARAMETER_DATA_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      /> */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <form.Field
          name="defaultUnit"
          children={(field) => (
            <div>
              <Label>Unit</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., kg, km, bpm"
              />
            </div>
          )}
        />

        <form.Field
          name="minValue"
          children={(field) => (
            <div>
              <Label>Min Value</Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(e.target.value === '' ? null : Number(e.target.value))
                }
                placeholder="Optional"
              />
            </div>
          )}
        />

        <form.Field
          name="maxValue"
          children={(field) => (
            <div>
              <Label>Max Value</Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(e.target.value === '' ? null : Number(e.target.value))
                }
                placeholder="Optional"
              />
            </div>
          )}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting ? 'Creating...' : 'Create Parameter'}
        </Button>
      </div>
    </>
  );
};

export default ParameterForm;
