export const cocktailFormOptions = {
	name: {
		required: 'Please enter a name for your cocktail',
		minLength: {
			value: 1,
			message: 'Name must be at least 1 character',
		},
	},
	description: {
		required: 'Please give a description of your cocktail',
		minLength: {
			value: 3,
			message: 'Description must be at least 3 characters',
		},
	},
	execution: {
		required: 'Please detail how the cocktail is made',
		minLength: {
			value: 3,
			message: 'Execution must be at least 3 characters',
		},
	},
	ingredients: { required: 'Please list the ingredients for your cocktail' },
	photo: {
		required: 'Please upload a photo of your cocktail',
		validate: {
			fileSize: (value) =>
				value[0]?.size < 5 * 1024 * 1024 || 'Image must be smaller than 5MB',
			fileType: (value) =>
				value[0]?.type.includes('image') || 'File must be an image',
		},
	},
	category: { required: 'Please choose a category for your cocktail' },
}

export const registerOptions = {
	username: {
		required: 'Please enter a username',
		minLength: {
			value: 3,
			message: 'Username must be at least 3 characters',
		},
	},
	password: {
		required: 'Please enter a password',
		minLength: {
			value: 3,
			message: 'Password must be at least 3 characters',
		},
	},
}
