
export default function signOut() {
	// Create a form element
	var form = document.createElement('form');
	form.method = 'POST';
	form.action = '/auth/sign-out';
	document.body.appendChild(form);
	form.submit();
}