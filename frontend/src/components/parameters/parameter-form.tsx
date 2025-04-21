import React from 'react';
import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { Select, SelectItem } from '@heroui/select';
import { useParameterForm, ExerciseParameterFormData } from './useParameterForm';

const PARAMETER_DATA_TYPES: readonly string[] = [
  'Number',
  'Weight',
  'Duration',
  'Percentage',
  'Time',
] as const;

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

      <form.Field
        name="dataType"
        children={(field) => (
          <div>
            <Label>Data Type *</Label>
            <Select
              value={field.state.value ?? ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                field.handleChange(e.target.value)
              }
              label="Data Type"
              selectionMode="single"
              placeholder="Select data type"
              required
            >
              {PARAMETER_DATA_TYPES.map((type) => (
                <SelectItem key={type}>{type}</SelectItem>
              ))}
            </Select>
          </div>
        )}
      />

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

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.state.isSubmitting} onClick={form.handleSubmit}>
          {form.state.isSubmitting ? 'Adding...' : 'Add Parameter'}
        </Button>
      </div>
    </>
  );
};

export default ParameterForm;
