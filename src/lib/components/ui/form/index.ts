// Re-export formsnap v2 components
export { Field, Control, Label, FieldErrors, Description, Fieldset, Legend, ElementField } from 'formsnap';

// Re-export with Form prefix for backward compatibility
export { 
	Field as FormField, 
	Control as FormControl, 
	Label as FormLabel, 
	FieldErrors as FormFieldErrors,
	Description as FormDescription,
	Fieldset as FormFieldset,
	Legend as FormLegend,
	ElementField as FormElementField
} from 'formsnap';
