// Temporary initialization script to populate Firebase with default data
// Run this once to set up initial data, then delete this file

import { setData } from './database';

export const initializeDefaultData = async () => {
  try {
    // Navigation/Branding
    await setData('siteConfig/navigation', {
      siteTitle: 'Blu Motif',
      siteSubtitle: 'Full Stack Developer',
      logo: 'https://picsum.photos/50/50?random=1',
      menuItems: [
        { label: 'Home', href: '#home' },
        { label: 'About', href: '#about' },
        { label: 'Skills', href: '#skills' },
        { label: 'Projects', href: '#projects' },
        { label: 'Contact', href: '#contact' }
      ]
    });

    // Hero section
    await setData('siteConfig/hero', {
      title: 'Hi, I\'m Blu Motif',
      subtitle: 'Full Stack Developer & AI Enthusiast',
      description: 'I build exceptional and accessible digital experiences for the web, focused on creating clean, user-friendly applications.',
      cta: 'View My Work',
      backgroundImage: '',
      profileImage: ''
    });

    // About section
    await setData('siteConfig/about', {
      name: 'Blu Motif',
      description: 'I\'m a passionate full-stack developer with expertise in building modern web applications. I specialize in creating responsive, performant, and accessible web applications that provide exceptional user experiences.',
      image: '',
      location: 'Your City, Country',
      experience: '3+ Years',
      availability: 'Open To Work',
      education: 'Bachelor\'s in Computer Science',
      details: [
        { title: 'Full Name', description: 'Blu Motif' },
        { title: 'Location', description: 'Your City, Country' },
        { title: 'Experience', description: '3+ Years' },
        { title: 'Available', description: 'Open To Work' },
        { title: 'Education', description: 'Bachelor\'s in Computer Science' }
      ]
    });

    // Skills section
    await setData('siteConfig/skills', {
      categories: [
        {
          title: 'Frontend Development',
          skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vue.js'],
          icon: '💻'
        },
        {
          title: 'Backend Development',
          skills: ['Node.js', 'Express', 'Python', 'PostgreSQL', 'MongoDB'],
          icon: '⚙️'
        },
        {
          title: 'Tools & Technologies',
          skills: ['Git', 'Docker', 'AWS', 'Firebase', 'Figma'],
          icon: '🛠️'
        },
        {
          title: 'Programming Languages',
          skills: ['JavaScript', 'TypeScript', 'Python', 'SQL', 'HTML/CSS'],
          icon: '💬'
        }
      ]
    });

    // Services section
    await setData('siteConfig/services', {
      title: 'What I Do',
      subtitle: 'I offer a wide range of services to help bring your ideas to life',
      services: [
        {
          title: 'Web Development',
          description: 'Building responsive, modern web applications using the latest technologies and best practices.',
          icon: '💻',
          features: ['React/Next.js', 'TypeScript', 'Responsive Design', 'Performance Optimization']
        },
        {
          title: 'Backend Development',
          description: 'Creating robust server-side applications with scalable architectures and secure APIs.',
          icon: '⚙️',
          features: ['Node.js/Express', 'Database Design', 'API Development', 'Authentication']
        },
        {
          title: 'UI/UX Design',
          description: 'Designing beautiful, intuitive user interfaces that provide exceptional user experiences.',
          icon: '🎨',
          features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems']
        },
        {
          title: 'AI Integration',
          description: 'Integrating artificial intelligence and machine learning capabilities into your applications.',
          icon: '🤖',
          features: ['ML APIs', 'Chatbots', 'Data Analysis', 'Automation']
        }
      ]
    });

    // Projects section
    await setData('siteConfig/projects', {
      title: 'Featured Projects',
      subtitle: 'A showcase of my recent work and accomplishments',
      showFilters: true,
      itemsPerPage: 6
    });

    // Testimonials section
    await setData('siteConfig/testimonials', {
      title: 'What Clients Say',
      subtitle: 'Feedback from people I\'ve worked with',
      testimonials: []
    });

    // Resume section
    await setData('siteConfig/resume', {
      title: 'Download My Resume',
      subtitle: 'Get a detailed overview of my experience and qualifications',
      description: 'Download my latest resume to learn more about my background, skills, and experience.',
      cvUrl: 'resume_default',
      fileName: 'Blu_Motif_Resume.pdf',
      buttonText: 'Download CV'
    });

    // Contact section
    await setData('siteConfig/contact', {
      title: 'Get In Touch',
      subtitle: 'Let\'s work together on your next project',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      address: 'Your City, Country',
      formEnabled: true,
      showMap: false
    });

    // Socials section
    await setData('siteConfig/socials', {
      github: { url: 'https://github.com/yourusername', label: 'GitHub' },
      linkedin: { url: 'https://linkedin.com/in/yourprofile', label: 'LinkedIn' },
      twitter: { url: 'https://twitter.com/yourhandle', label: 'Twitter' }
    });

    // Footer section
    await setData('siteConfig/footer', {
      copyright: '© 2025 Blu Motif. All rights reserved.',
      description: 'Building exceptional digital experiences, one project at a time.',
      showSocialLinks: true,
      additionalLinks: [
        { label: 'Privacy Policy', url: '#' },
        { label: 'Terms of Service', url: '#' },
        { label: 'Sitemap', url: '#' }
      ]
    });

    // SEO/Metadata
    await setData('siteConfig/seo', {
      title: 'Blu Motif - Full Stack Developer & AI Enthusiast',
      description: 'Portfolio of Blu Motif, a full-stack developer specializing in React, Node.js, and AI integration. View my projects and get in touch.',
      keywords: ['full stack developer', 'React', 'Node.js', 'TypeScript', 'AI', 'web development'],
      ogImage: '',
      twitterCard: 'summary_large_image'
    });

    // Theme settings
    await setData('siteConfig/theme', {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      accentColor: '#06b6d4',
      backgroundColor: '#111827',
      textColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '0.5rem',
      enableAnimations: true,
      darkMode: true
    });

    // Analytics
    await setData('siteConfig/analytics', {
      googleAnalyticsId: '',
      enableTracking: false,
      trackPageViews: true,
      trackEvents: true
    });

    // Sample project
    await setData('projects/sample1', {
      title: 'Portfolio Website',
      description: 'A modern, responsive portfolio website built with React and Firebase. Features dynamic content management and AI-powered tagging.',
      image: '',
      tags: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
      searchIndex: 'Portfolio Website A modern, responsive portfolio website built with React and Firebase. Features dynamic content management and AI-powered tagging. React TypeScript Firebase Tailwind CSS',
      github: 'https://github.com/yourusername/portfolio',
      demo: 'https://yourportfolio.com',
      featured: true,
      category: 'Web Development'
    });

    console.log('Default data initialized successfully!');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};