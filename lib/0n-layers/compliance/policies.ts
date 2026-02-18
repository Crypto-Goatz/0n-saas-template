/**
 * Layer 5: COMPLIANCE — Auto-generated legal document templates.
 */

export function generatePrivacyPolicy(config: {
  businessName: string
  contactEmail: string
  address?: string
}): string {
  const { businessName, contactEmail, address } = config
  return `# Privacy Policy

**Last updated:** ${new Date().toLocaleDateString()}

## Introduction

${businessName} ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.

## Information We Collect

### Information You Provide
- Contact information (name, email, phone) when you submit forms
- Account information when you create an account
- Payment information processed through our secure payment provider

### Automatically Collected Information
- Browser type and version
- Operating system
- Pages visited and time spent
- Referring website
- Device information

## How We Use Your Information

- To provide and maintain our services
- To communicate with you about your account or inquiries
- To improve our website and services
- To comply with legal obligations

## Cookies and Tracking

We use cookies and similar technologies. You can control cookie preferences through our cookie consent banner. Categories include:

- **Essential:** Required for basic site functionality
- **Analytics:** Help us understand how visitors use our site
- **Marketing:** Used for targeted advertising
- **Personalization:** Customize your experience

## Your Rights

Depending on your location, you may have rights to:
- Access your personal data
- Request correction or deletion
- Opt out of data selling (CCPA)
- Withdraw consent (GDPR)

## Contact Us

${contactEmail}${address ? `\n${address}` : ''}

## Changes

We may update this policy periodically. We will notify you of changes by posting the new policy on this page.`
}

export function generateCookiePolicy(config: {
  businessName: string
  contactEmail: string
}): string {
  return `# Cookie Policy

**Last updated:** ${new Date().toLocaleDateString()}

## What Are Cookies

Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.

## How ${config.businessName} Uses Cookies

### Essential Cookies
Required for the website to function. Cannot be disabled.
- Session management
- Security tokens
- User preferences

### Analytics Cookies
Help us understand how visitors interact with our site.
- Page views and navigation patterns
- Performance metrics

### Marketing Cookies
Used to deliver relevant advertisements.
- Ad tracking
- Campaign measurement

### Personalization Cookies
Customize content based on your preferences.
- Language settings
- Theme preferences

## Managing Cookies

You can manage cookie preferences through:
1. Our cookie consent banner
2. Your browser settings
3. Contacting us at ${config.contactEmail}

## Contact

For questions about our cookie practices, contact us at ${config.contactEmail}.`
}

export function generateTermsOfService(config: {
  businessName: string
  contactEmail: string
}): string {
  return `# Terms of Service

**Last updated:** ${new Date().toLocaleDateString()}

## Acceptance of Terms

By accessing ${config.businessName}, you agree to these Terms of Service.

## Use of Service

You agree to use our service only for lawful purposes and in accordance with these Terms.

## Accounts

You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.

## Intellectual Property

All content, features, and functionality are owned by ${config.businessName} and are protected by copyright, trademark, and other intellectual property laws.

## Limitation of Liability

${config.businessName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

## Termination

We may terminate or suspend your access immediately, without prior notice, for any reason.

## Changes

We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance.

## Contact

${config.contactEmail}`
}
