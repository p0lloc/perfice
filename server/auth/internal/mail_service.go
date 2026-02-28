package internal

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type MailService struct {
	apiKey string
}

func NewMailService(apiKey string) *MailService {
	return &MailService{
		apiKey: apiKey,
	}
}

var baseUrl = os.Getenv("BACKEND_BASE_URL")

func (s MailService) SendEmailConfirmationMail(email string, token string) error {
	url := fmt.Sprintf("%s/auth/confirm/%s", baseUrl, token)
	return s.sendMail(email, "Confirm your email", fmt.Sprintf(`
<h2>Confirm your email</h2>
<p>Welcome to Perfice! Please confirm your email by clicking the link below.</p>

<p>Confirm email: <a href="%s">%s</a></p>`, url, url))
}

func (s MailService) SendPasswordResetMail(email string, token string) error {
	url := fmt.Sprintf("%s/auth/reset/%s", baseUrl, token)
	return s.sendMail(email, "Reset your password", fmt.Sprintf(`
<h2>Reset password</h2>
<p>Someone requested to reset the password for your account. You can simply ignore this mail if this was not you.</p>

<p>Reset your password: <a href="%s">%s</a></p>`, url, url))
}

func (s MailService) sendMail(email string, subject string, html string) error {
	body := map[string]interface{}{
		"from": map[string]string{
			"address":      "noreply@adoe.dev",
			"display_name": "Perfice",
		},
		"to": map[string]string{
			"address": email,
		},
		"subject": subject,
		"html":    html,
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://smtp.maileroo.com/api/v2/emails", bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.apiKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		responseBody, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}

		return fmt.Errorf("unable to send maileroo mail: %s", string(responseBody))
	}

	return nil
}
