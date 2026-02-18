/**
 * Layer 0: CORE — Fallback content used when Google Sheets is not configured.
 * Serves as demo data in dev mode or for new deployments.
 */

export const FALLBACK_DATA: Record<string, Record<string, string>[]> = {
  site_config: [
    { key: 'business_name', value: 'My SaaS App' },
    { key: 'tagline', value: 'The modern way to manage your business' },
    { key: 'primary_color', value: '#22d3ee' },
    { key: 'contact_email', value: 'hello@example.com' },
    { key: 'contact_phone', value: '(555) 123-4567' },
    { key: 'address', value: '123 Main Street, Anytown, USA' },
    { key: 'social_twitter', value: 'https://twitter.com/example' },
    { key: 'social_linkedin', value: 'https://linkedin.com/company/example' },
    { key: 'analytics_id', value: '' },
    { key: 'consent_mode', value: 'essential' },
    { key: 'setup_complete', value: 'false' },
  ],

  pages: [
    {
      id: '1',
      title: 'Home',
      slug: 'home',
      content: '<h1>Welcome to Our Platform</h1><p>We help businesses grow with modern tools and automation.</p>',
      meta_description: 'The modern way to manage and grow your business online.',
      status: 'published',
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'About',
      slug: 'about',
      content: '<h1>About Us</h1><p>We are a team of passionate builders creating tools that help businesses succeed.</p>',
      meta_description: 'Learn about our mission and team.',
      status: 'published',
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Contact',
      slug: 'contact',
      content: '<h1>Contact Us</h1><p>Get in touch with our team. We would love to hear from you.</p>',
      meta_description: 'Contact us for questions, support, or partnership inquiries.',
      status: 'published',
      updated_at: new Date().toISOString(),
    },
  ],

  blog_posts: [
    {
      id: '1',
      title: 'Getting Started with Your New Dashboard',
      slug: 'getting-started',
      content: '<h2>Welcome to your dashboard</h2><p>This guide will walk you through the key features available to you.</p><h3>Setting up your profile</h3><p>Start by completing your profile in Settings. Add your business name, contact info, and branding.</p><h3>Connecting your tools</h3><p>Use the Setup Wizard to connect Google Sheets as your content backend. This gives you a familiar spreadsheet interface for managing all your content.</p>',
      excerpt: 'A quick guide to getting the most out of your new dashboard.',
      image_id: '',
      published_at: new Date().toISOString(),
      status: 'published',
    },
    {
      id: '2',
      title: '5 Ways to Improve Your Online Presence',
      slug: 'improve-online-presence',
      content: '<h2>Stand out online</h2><p>Your online presence is your digital storefront. Here are five proven strategies to make it work harder for you.</p><h3>1. Optimize your site speed</h3><p>Every second of load time costs you conversions. Aim for under 3 seconds.</p><h3>2. Create valuable content</h3><p>Blog posts, guides, and resources attract organic traffic and build authority.</p><h3>3. Leverage social proof</h3><p>Testimonials, case studies, and reviews build trust with prospects.</p><h3>4. Mobile-first design</h3><p>Over 60% of web traffic is mobile. Design for small screens first.</p><h3>5. Track and iterate</h3><p>Use analytics to understand what works and double down on winners.</p>',
      excerpt: 'Five proven strategies to strengthen your digital storefront.',
      image_id: '',
      published_at: new Date().toISOString(),
      status: 'published',
    },
  ],

  navigation: [
    { id: '1', label: 'Home', href: '/', order: '1', parent_id: '', visible: 'true' },
    { id: '2', label: 'About', href: '/about', order: '2', parent_id: '', visible: 'true' },
    { id: '3', label: 'Blog', href: '/blog', order: '3', parent_id: '', visible: 'true' },
    { id: '4', label: 'Contact', href: '/contact', order: '4', parent_id: '', visible: 'true' },
  ],

  media_log: [],

  contacts: [
    {
      id: '1',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone: '(555) 111-2222',
      company: 'Acme Corp',
      tags: 'lead,website',
      source: 'contact_form',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '(555) 333-4444',
      company: 'StartupCo',
      tags: 'lead',
      source: 'referral',
      created_at: new Date().toISOString(),
    },
  ],

  leads: [
    {
      id: '1',
      contact_id: '1',
      stage: 'qualified',
      value: '5000',
      notes: 'Interested in Pro plan',
      assigned_to: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],

  pipeline: [
    { id: '1', name: 'New', order: '1', color: '#6b7280' },
    { id: '2', name: 'Contacted', order: '2', color: '#3b82f6' },
    { id: '3', name: 'Qualified', order: '3', color: '#8b5cf6' },
    { id: '4', name: 'Proposal', order: '4', color: '#f59e0b' },
    { id: '5', name: 'Won', order: '5', color: '#22c55e' },
    { id: '6', name: 'Lost', order: '6', color: '#ef4444' },
  ],

  activities: [
    {
      id: '1',
      contact_id: '1',
      type: 'note',
      description: 'Initial outreach via email',
      created_at: new Date().toISOString(),
    },
  ],

  tags: [
    { id: '1', name: 'lead', color: '#3b82f6' },
    { id: '2', name: 'customer', color: '#22c55e' },
    { id: '3', name: 'website', color: '#8b5cf6' },
    { id: '4', name: 'referral', color: '#f59e0b' },
  ],

  // Agent learning tabs start empty
  page_experiments: [],
  page_ai_learnings: [],
  content_calendar: [],
  blog_ai_learnings: [],
  crm_ai_learnings: [],
  compliance_ai_learnings: [],
  orchestrator_learnings: [],
  '0n_events': [],
}
