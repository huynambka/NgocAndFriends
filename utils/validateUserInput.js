const checkUserInput = (input) => {
    const checkResult = {
        valid: true,
        invalidFields: [],
    };
    const keys = Object.keys(input);
    keys.forEach((key) => {
        if (input[key]) {
            if (key === 'objectId') {
                const categories = Object.keys(input[key]);
                categories.forEach((category) => {
                    const { valid, message } = isValid(
                        input[key][category],
                        'objectId',
                    );
                    if (!valid) {
                        checkResult.valid = false;
                        checkResult.invalidFields.push({
                            field: category,
                            message: message,
                        });
                    }
                });
            } else {
                const { valid, message } = isValid(input[key], key);
                if (!valid) {
                    checkResult.valid = false;
                    checkResult.invalidFields.push({
                        field: key,
                        message: message,
                    });
                }
            }
        }
    });
    return checkResult;
};

const isValid = (input, category) => {
    if (input.length < 1) {
        return {
            valid: false,
            message: `Please enter a ${category}`,
        };
    }
    if (input.length > 100) {
        return {
            valid: false,
            message: `${category} must be less than 100 characters`,
        };
    }
    switch (category) {
        case 'username':
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (input.length < 4 || input.length > 20) {
                return {
                    valid: false,
                    message: 'Username must be between 4 and 20 characters',
                };
            }
            if (!usernameRegex.test(input)) {
                return {
                    valid: false,
                    message:
                        'Username can only contain letters, numbers, and underscores',
                };
            } else {
                return {
                    valid: true,
                    message: 'Valid username',
                };
            }
        case 'password':
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^:&.~\s]+$/;
            if (input.length < 8 || input.length > 20) {
                return {
                    valid: false,
                    message: 'Password must be between 8 and 20 characters',
                };
            }
            if (!passwordRegex.test(input)) {
                return {
                    valid: false,
                    message:
                        'Password must contain at least one lowercase letter, one uppercase letter, one number, and must not `:`, `&`, `.`, `~`, or whitespace',
                };
            } else {
                return { valid: true, message: 'Valid password' };
            }
        case 'email':
            const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(input)) {
                return {
                    valid: false,
                    message: 'Please enter a valid email address',
                };
            } else {
                return {
                    valid: true,
                    message: 'Valid email address',
                };
            }
        case 'objectId':
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!objectIdRegex.test(input)) {
                return {
                    valid: false,
                    message: 'Invalid object id',
                };
            } else {
                return {
                    valid: true,
                    message: 'Valid object id',
                };
            }
    }
};

const sanitizeInput = (input) => {
    const encode = (data) => {
        data.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    const keys = Object.keys(input);
    keys.forEach((key) => {
        if (typeof input[key] === 'object' && !Array.isArray(input[key])) {
            input[key] = sanitizeInput(input[key]);
        } else {
            if (input[key] && typeof input[key] === 'string')
                input[key] = encode(input[key]);
        }
    });
    return input;
};

module.exports = {
    checkUserInput,
    sanitizeInput,
};
