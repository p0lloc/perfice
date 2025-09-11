package internal

import "os"

var appBaseUrl = os.Getenv("APP_BASE_URL")

var resetPasswordInitHtml = `
<h2>Reset password</h2>
<p>Enter a new password for your account.</p>
<form method="post" action="/auth/reset">
	<input type="hidden" name="token" value="%s">
	<input type="password" name="password" placeholder="Password">
	<input type="submit" value="Reset password">
</form>`

var resetPasswordHtml = `
<p>Your password has been reset. You can now <a href="%s/settings">login</a>.</p>

<style>
	body {
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: 'Inter', sans-serif;
		background-color: #008000;
		color: white;
		text-align: center;
		height: 100vh;
	}
</style>		
`

var confirmEmailHtml = `
<p>Your email address has been confirmed. You can now <a href="%s/settings">login</a>.</p>

<style>
	body {
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: 'Inter', sans-serif;
		background-color: #008000;
		color: white;
		text-align: center;
		height: 100vh;
	}
</style>		
`
