# Formspree Email Setup Instructions

To enable email functionality for the contact form, you need to set up Formspree:

## 1. Create a Formspree Account
1. Go to [https://formspree.io/](https://formspree.io/)
2. Sign up for a free account (they offer 50 free submissions per month)
3. Verify your email

## 2. Create a New Form
1. In your Formspree dashboard, click "Create a new form"
2. Give it a name like "Portfolio Contact Form"
3. **Important**: Set the email destination to `eleblununana@gmail.com`
4. Copy the **Form ID** from the form URL (the part after `/f/`, like `xpwyyowd`)

## 3. Configure Form Settings (Optional)
1. Go to your form settings
2. You can customize:
   - Email subject line
   - Success/failure redirect URLs
   - Email template
   - Spam protection

## 4. Update Environment Variables
1. Open the `.env` file in your project root
2. Replace the placeholder with your actual Formspree Form ID:
   ```
   VITE_FORMSPREE_FORM_ID=your_actual_form_id
   ```

## 5. Test the Form
1. Start your development server: `npm run dev`
2. Go to the contact section
3. Fill out and submit the form
4. Check your email (eleblununana@gmail.com) for the message

## Formspree Features

- **Simple Setup**: Just one Form ID needed
- **Spam Protection**: Built-in spam filtering
- **Email Customization**: Customize email templates and subjects
- **Analytics**: Track form submissions
- **Free Tier**: 50 submissions per month
- **React Integration**: Uses `@formspree/react` for clean React hooks

## Email Format

Formspree will send emails with your form data in this format:
```
Subject: New submission from your portfolio

Name: [Visitor's Name]
Email: [Visitor's Email]
Message: [Visitor's Message]
```

## Troubleshooting

- **Form not working**: Double-check your Form ID in the `.env` file
- **Emails not arriving**: Verify the destination email in Formspree dashboard
- **Rate limiting**: Free plan allows 50 submissions per month
- **CORS issues**: Formspree handles CORS automatically

## Security Note
- Formspree handles all the backend processing securely
- No sensitive credentials exposed in frontend code
- Built-in spam protection and validation