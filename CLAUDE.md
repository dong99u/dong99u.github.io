# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

If the user's prompt starts with “EP:”, then the user wants to enhance the prompt. Read the PROMPT_ENHANCER.md file and
follow the guidelines to enhance the user's prompt. Show the user the enhancement and get their permission to run it
before taking action on the enhanced prompt. The enhanced prompts will follow the language of the original prompt (e.g.,
Korean prompt input will output Korean prompt enhancements, English prompt input will output English prompt
enhancements, etc.)

## Project Overview

This is a static HTML portfolio website for Park Dong Kyu (박동규), a backend developer. The site is hosted on GitHub Pages at dong99u.github.io and showcases professional experience, projects, and technical skills.

## Architecture

- **Single-page application**: Built as a static HTML file with embedded CSS and JavaScript
- **Korean/English bilingual**: Content is primarily in Korean with English elements
- **SEO optimized**: Includes comprehensive meta tags, Open Graph, Twitter Cards, and JSON-LD structured data
- **Google Analytics**: Integrated with tracking ID G-31W0EXKE3S
- **Responsive design**: Mobile-first approach with CSS custom properties for theming

## Key Components

### CSS Architecture
- Uses CSS custom properties (CSS variables) defined in `:root` for consistent theming
- Color scheme includes primary (#2563eb), secondary (#3b82f6), accent (#fbbf24) colors
- Responsive design with mobile-first breakpoints
- Card-based layout with consistent shadow and hover effects

### Content Sections
- Hero section with profile image and introduction
- Technical skills with proficiency indicators
- Project showcase with links to GitHub repositories
- Professional experience timeline
- Education and achievements
- Contact information

### SEO and Meta Data
- Comprehensive meta tags for search engines
- Open Graph and Twitter Card meta tags for social sharing
- JSON-LD structured data for rich snippets
- Canonical URL configuration

## Development Workflow

Since this is a static HTML site:

1. **Direct editing**: Modify `index.html` directly for content and styling changes
2. **Local testing**: Open `index.html` in a browser for immediate preview
3. **Deploy**: Commit and push to main branch - GitHub Pages will automatically deploy

## Content Guidelines

- **Language**: Maintain Korean as primary language with English technical terms
- **Professional tone**: Keep content formal and professional
- **Technical accuracy**: Ensure all technical skills and project descriptions are current
- **Performance**: Optimize images and minimize inline CSS/JS for faster loading

## Assets

- `profile-image.jpg`: Professional headshot (632KB - consider optimization if needed)
- All other assets are CDN-hosted or inline

## GitHub Pages Configuration

- **Branch**: Deploys from `main` branch
- **Custom domain**: dong99u.github.io
- **HTTPS**: Enabled by default
- **Build**: No build process required (static HTML)

## Maintenance Notes

- Update Google Analytics tracking code if needed in the `<head>` section
- Profile image should maintain professional quality and reasonable file size
- Keep structured data (JSON-LD) updated when adding new achievements or changing job titles
- Monitor SEO meta tags for accuracy when content changes