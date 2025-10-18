import * as React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface BaseFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  rows?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string;
  options: Array<{ label: string; value: string }>;
}

interface CheckboxFieldProps extends BaseFieldProps {
  description?: string;
}

// Enhanced form field wrapper
const FormField: React.FC<{
  children: React.ReactNode;
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
}> = ({ children, label, error, description, required, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className={cn('text-sm font-medium', error && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  );
};

// Input field component
export const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  description,
  required,
  className,
  disabled,
  type = 'text',
  placeholder,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;

  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
      className={className}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && 'border-destructive focus-visible:ring-destructive')}
          />
        )}
      />
    </FormField>
  );
};

// Textarea field component
export const TextareaField: React.FC<TextareaFieldProps> = ({
  name,
  label,
  description,
  required,
  className,
  disabled,
  placeholder,
  rows = 3,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;

  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
      className={className}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(error && 'border-destructive focus-visible:ring-destructive')}
          />
        )}
      />
    </FormField>
  );
};

// Select field component
export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  description,
  required,
  className,
  disabled,
  placeholder,
  options,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;

  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
      className={className}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(error && 'border-destructive focus:ring-destructive')}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
};

// Checkbox field component
export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  description,
  required,
  className,
  disabled,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;

  return (
    <FormField
      error={error}
      className={className}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-top space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={cn(error && 'border-destructive')}
            />
            <div className="grid gap-1.5 leading-none">
              {label && (
                <Label
                  htmlFor={name}
                  className={cn(
                    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                    error && 'text-destructive'
                  )}
                >
                  {label}
                  {required && <span className="text-destructive ml-1">*</span>}
                </Label>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
      />
    </FormField>
  );
};

export { FormField };