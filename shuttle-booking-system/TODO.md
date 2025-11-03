# TODO: Add Phone Number to User Payload

## Backend Changes (routes/users.js)
- [ ] Add phone field to user object in creation
- [ ] Update GET /users response schema to include phone
- [ ] Update POST /users/create requestBody schema and logic to include phone
- [ ] Update PUT /users/{id} requestBody schema and logic to include phone
- [ ] Update login response to include phone

## Frontend Changes (SignUp.jsx)
- [ ] Add phone to form state
- [ ] Add phone input field in the form
- [ ] Include phone in the signup API call
- [ ] Update form validation if phone is required (optional for now)

## Testing
- [ ] Test user creation with phone
- [ ] Test user update with phone
- [ ] Test signup form with phone
