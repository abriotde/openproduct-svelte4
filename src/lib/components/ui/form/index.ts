// Re-export formsnap v2 components
export { Field, Control, Description, Fieldset, Legend, ElementField } from 'formsnap';

// Import custom form components
import Item from "./form-item.svelte";
import Input from "./form-input.svelte";
import Textarea from "./form-textarea.svelte";
import Label from "./form-label.svelte";
import Validation from "./form-validation.svelte";
import Button from "./form-button.svelte";

// Export all form components
export {
	Field,
	Control,
	Item,
	Input,
	Label,
	Button,
	Textarea,
	Validation,
	Description,
	Fieldset,
	Legend,
	ElementField,
	//
	Field as FormField,
	Control as FormControl,
	Item as FormItem,
	Input as FormInput,
	Textarea as FormTextarea,
	Label as FormLabel,
	Validation as FormValidation,
	Button as FormButton,
	Description as FormDescription,
	Fieldset as FormFieldset,
	Legend as FormLegend,
	ElementField as FormElementField
};
