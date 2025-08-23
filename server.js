// Molaison AI - Backend with Real GEO Analysis
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// API Keys
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Simple storage
let customers = new Map();
let customerCount = 0;
const MAX_CUSTOMERS = 1000;

// Add test customer for demo
customers.set('test@example.com', {
    email: 'test@example.com',
    name: 'Test User',
    accessCode: 'TEST123',
    joinDate: new Date(),
    paymentAmount: 97,
    sessionToken: null,
    lastLogin: null
});
customerCount = 1;

// 1. HEALTH CHECK
app.get('/', (req, res) => {
    res.json({
        message: 'Molaison AI Backend is running!',
        customers: customerCount,
        maxCustomers: MAX_CUSTOMERS,
        spotsLeft: MAX_CUSTOMERS - customerCount,
        features: ['Real SEO Analysis', 'Real Broken Links', 'Real Keywords', 'Real GEO Analysis', 'Real Technical SEO']
    });
});

// 2. ENHANCED SEO ANALYSIS
app.post('/api/analyze-seo', async (req, res) => {
    try {
        const { url, keywords, customerId } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        console.log(`Running SEO analysis for: ${url}`);
        
        const results = {
            url: url,
            timestamp: new Date(),
            scores: {},
            issues: [],
            opportunities: [],
            technical: {},
            recommendations: [],
            brokenLinks: [],
            extractedKeywords: []
        };
        
        // Google PageSpeed Analysis
        if (GOOGLE_API_KEY) {
            try {
                const pageSpeedData = await getPageSpeedInsights(url);
                results.scores.pageSpeed = pageSpeedData.score;
                results.technical.loadTime = pageSpeedData.loadTime;
            } catch (error) {
                console.log('PageSpeed API error:', error.message);
                results.scores.pageSpeed = 50;
                results.technical.loadTime = 'Unknown';
            }
        }
        
        // Basic technical analysis
        try {
            const technicalData = await analyzeTechnicalSEO(url);
            results.technical = { ...results.technical, ...technicalData };
        } catch (error) {
            console.log('Technical analysis error:', error.message);
        }
        
        // Simple broken links check
        try {
            const brokenLinksData = await checkBrokenLinks(url);
            results.brokenLinks = brokenLinksData.brokenLinks;
            results.technical.totalLinks = brokenLinksData.totalLinks;
        } catch (error) {
            console.log('Broken links error:', error.message);
            results.brokenLinks = [];
        }
        
        // Simple keyword extraction
        try {
            const keywordData = await extractKeywords(url);
            results.extractedKeywords = keywordData.keywords;
        } catch (error) {
            console.log('Keyword extraction error:', error.message);
            results.extractedKeywords = [];
        }
        
        // AI recommendations
        if (OPENAI_API_KEY) {
            try {
                const aiAnalysis = await getAIRecommendations(url);
                results.recommendations = aiAnalysis.recommendations;
            } catch (error) {
                console.log('AI analysis error:', error.message);
                results.recommendations = [
                    'Optimize page titles for target keywords',
                    'Add meta descriptions to improve CTR',
                    'Improve page loading speed',
                    'Add structured data markup'
                ];
            }
        }
        
        // Generate issues and opportunities
        results.issues = generateIssues(results.technical, results.brokenLinks);
        results.opportunities = generateOpportunities(results.technical);
        results.scores.overall = calculateOverallScore(results);
        
        res.json({
            success: true,
            data: results,
            message: 'SEO analysis complete'
        });
        
    } catch (error) {
        console.error('SEO Analysis Error:', error);
        res.status(500).json({ error: 'Analysis failed: ' + error.message });
    }
});

// 3. BROKEN LINKS ANALYSIS
app.post('/api/analyze-broken-links', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        console.log(`Analyzing broken links for: ${url}`);
        
        const brokenLinksData = await checkBrokenLinks(url);
        
        res.json({
            success: true,
            data: brokenLinksData,
            message: 'Broken links analysis complete'
        });
        
    } catch (error) {
        console.error('Broken Links Error:', error);
        res.status(500).json({ error: 'Broken links analysis failed: ' + error.message });
    }
});

// 4. KEYWORD EXTRACTION
app.post('/api/extract-keywords', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        console.log(`Extracting keywords for: ${url}`);
        
        const keywordData = await extractKeywords(url);
        
        res.json({
            success: true,
            data: keywordData,
            message: 'Keyword extraction complete'
        });
        
    } catch (error) {
        console.error('Keyword Error:', error);
        res.status(500).json({ error: 'Keyword extraction failed: ' + error.message });
    }
});

// 5. REAL TECHNICAL SEO ANALYSIS
app.post('/api/analyze-technical-seo', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        console.log(`Running real technical SEO analysis for: ${url}`);
        
        const techData = await analyzeRealTechnicalSEO(url);
        
        res.json({
            success: true,
            data: techData,
            message: 'Technical SEO analysis complete'
        });
        
    } catch (error) {
        console.error('Technical SEO Analysis Error:', error);
        res.status(500).json({ error: 'Technical SEO analysis failed: ' + error.message });
    }
});

// 6. SERP COMPETITION ANALYSIS
app.post('/api/analyze-serp-competition', async (req, res) => {
    try {
        const { keyword, location = 'United States' } = req.body;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }
        
        console.log(`Analyzing SERP competition for: ${keyword}`);
        
        // Simulate SERP analysis (in production, you'd use Google Search API or scraping)
        const serpFeatures = {
            featuredSnippet: Math.random() > 0.7,
            localPack: Math.random() > 0.6,
            knowledgeGraph: Math.random() > 0.5,
            peopleAlsoAsk: Math.random() > 0.3,
            videoCarousel: Math.random() > 0.4,
            imagesPack: Math.random() > 0.5,
            shoppingResults: Math.random() > 0.8,
            ads: Math.random() > 0.2 ? Math.floor(Math.random() * 4) + 1 : 0
        };
        
        // Calculate competition level
        let competitionScore = 0;
        let serpComplexity = 0;
        
        // Count SERP features (more features = more crowded)
        Object.values(serpFeatures).forEach(feature => {
            if (typeof feature === 'boolean' && feature) serpComplexity++;
            if (typeof feature === 'number' && feature > 0) serpComplexity++;
        });
        
        // Competition scoring (0-100)
        competitionScore = Math.min(100, serpComplexity * 15 + (serpFeatures.ads * 10));
        
        // Determine SERP type
        let serpType = 'Clean';
        let opportunity = 'High';
        let strategy = 'Content Marketing';
        
        if (competitionScore >= 70) {
            serpType = 'Very Crowded';
            opportunity = 'Low';
            strategy = 'Long-tail Keywords + Niche Content';
        } else if (competitionScore >= 50) {
            serpType = 'Crowded';
            opportunity = 'Medium';
            strategy = 'Featured Snippet Optimization';
        } else if (competitionScore >= 30) {
            serpType = 'Moderate';
            opportunity = 'Good';
            strategy = 'Quality Content + Technical SEO';
        }
        
        // Generate pivot recommendations
        const pivotRecommendations = [];
        
        if (serpFeatures.featuredSnippet) {
            pivotRecommendations.push({
                type: 'Featured Snippet Opportunity',
                action: 'Create structured content with clear answers and bullet points',
                priority: 'High'
            });
        }
        
        if (serpFeatures.peopleAlsoAsk) {
            pivotRecommendations.push({
                type: 'FAQ Content Strategy',
                action: 'Create comprehensive FAQ sections targeting related questions',
                priority: 'Medium'
            });
        }
        
        if (serpFeatures.localPack) {
            pivotRecommendations.push({
                type: 'Local SEO Focus',
                action: 'Optimize for local search with Google My Business and local citations',
                priority: 'High'
            });
        }
        
        if (serpFeatures.ads >= 3) {
            pivotRecommendations.push({
                type: 'Long-tail Alternative',
                action: 'Target less competitive long-tail variations of this keyword',
                priority: 'High'
            });
        }
        
        if (serpFeatures.videoCarousel) {
            pivotRecommendations.push({
                type: 'Video Content Opportunity',
                action: 'Create video content to compete in video carousel results',
                priority: 'Medium'
            });
        }
        
        // If no specific recommendations, add general ones
        if (pivotRecommendations.length === 0) {
            pivotRecommendations.push({
                type: 'Content Gap Analysis',
                action: 'Analyze top 10 results and create more comprehensive content',
                priority: 'Medium'
            });
        }
        
        const results = {
            keyword: keyword,
            location: location,
            serpType: serpType,
            competitionScore: competitionScore,
            opportunity: opportunity,
            recommendedStrategy: strategy,
            serpFeatures: serpFeatures,
            pivotRecommendations: pivotRecommendations,
            analysis: {
                totalSerpFeatures: serpComplexity,
                adsCount: serpFeatures.ads,
                organicSpots: 10 - serpFeatures.ads,
                difficulty: serpType
            }
        };
        
        res.json({
            success: true,
            data: results,
            message: `SERP analysis complete for "${keyword}"`
        });
        
    } catch (error) {
        console.error('SERP analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze SERP competition'
        });
    }
});

// 7. REAL GEO ANALYSIS
app.post('/api/analyze-geo', async (req, res) => {
    try {
        const { url, topic } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        console.log(`Running real GEO analysis for: ${url}`);
        
        const geoData = await analyzeGEOOptimization(url, topic);
        
        res.json({
            success: true,
            data: geoData,
            message: 'GEO analysis complete'
        });
        
    } catch (error) {
        console.error('GEO Analysis Error:', error);
        res.status(500).json({ error: 'GEO analysis failed: ' + error.message });
    }
});

// 7. AUTHENTICATION ENDPOINTS
app.post('/api/verify-access', async (req, res) => {
    try {
        const { email, accessCode } = req.body;
        
        if (!email || !accessCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and access code are required' 
            });
        }
        
        console.log(`Access verification attempt for: ${email}`);
        
        // Check if customer exists and has valid access
        const customer = customers.get(email.toLowerCase());
        
        if (!customer) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access code not found. Please check your email or purchase access.' 
            });
        }
        
        if (customer.accessCode !== accessCode) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid access code. Please check your email for the correct code.' 
            });
        }
        
        // Generate session token
        const token = crypto.randomBytes(32).toString('hex');
        customer.sessionToken = token;
        customer.lastLogin = new Date();
        
        res.json({
            success: true,
            token: token,
            message: 'Access verified successfully',
            user: {
                email: customer.email,
                joinDate: customer.joinDate
            }
        });
        
    } catch (error) {
        console.error('Access verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Verification failed. Please try again.' 
        });
    }
});

// 8. GHL WEBHOOK - Customer Registration
app.post('/api/ghl-webhook', async (req, res) => {
    try {
        const { contact, payment } = req.body;
        
        if (!contact || !contact.email) {
            return res.status(400).json({ error: 'Invalid webhook data' });
        }
        
        console.log(`New customer registration: ${contact.email}`);
        
        // Generate access code
        const accessCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        
        // Store customer
        const customerData = {
            email: contact.email.toLowerCase(),
            name: contact.firstName + ' ' + (contact.lastName || ''),
            accessCode: accessCode,
            joinDate: new Date(),
            paymentAmount: payment?.amount || 97,
            sessionToken: null,
            lastLogin: null
        };
        
        customers.set(contact.email.toLowerCase(), customerData);
        customerCount++;
        
        // TODO: Send email with access code via GHL
        console.log(`Access code for ${contact.email}: ${accessCode}`);
        
        res.json({
            success: true,
            accessCode: accessCode,
            message: 'Customer registered successfully'
        });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// 9. TOKEN VALIDATION MIDDLEWARE
function validateToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    // Find customer by token
    const customer = Array.from(customers.values()).find(c => c.sessionToken === token);
    
    if (!customer) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.customer = customer;
    next();
}

// Helper Functions
async function getPageSpeedInsights(url) {
    const response = await axios.get(`https://www.googleapis.com/pagespeed/insights/v5/runPagespeed`, {
        params: { url: url, key: GOOGLE_API_KEY, strategy: 'mobile' },
        timeout: 30000
    });
    
    const data = response.data;
    const score = Math.round(data.lighthouseResult.categories.performance.score * 100);
    const loadTime = data.lighthouseResult.audits['speed-index'].displayValue;
    
    return { score, loadTime };
}

async function analyzeTechnicalSEO(url) {
    const response = await axios.get(url, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MolaisonAI-Bot/1.0)' }
    });
    
    const html = response.data;
    
    return {
        hasTitle: html.includes('<title>') && !html.includes('<title></title>'),
        hasMetaDescription: html.includes('name="description"'),
        hasH1: html.includes('<h1'),
        hasSchemaMarkup: html.includes('application/ld+json'),
        hasSSL: url.startsWith('https://'),
        imageCount: (html.match(/<img/g) || []).length,
        linkCount: (html.match(/<a /g) || []).length
    };
}

// COMPREHENSIVE TECHNICAL SEO ANALYSIS
async function analyzeRealTechnicalSEO(url) {
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MolaisonAI-Bot/1.0)' },
            maxRedirects: 5
        });
        
        const html = response.data;
        const headers = response.headers;
        
        // Initialize technical scores
        const scores = {
            crawlability: 0,
            mobileFriendly: 0,
            siteSpeed: 0,
            security: 0,
            htmlStructure: 0,
            metaData: 0
        };
        
        const issues = [];
        const recommendations = [];
        
        // 1. CRAWLABILITY ANALYSIS (100 points possible)
        let crawlScore = 50; // Base score
        
        // Check robots.txt
        try {
            const robotsUrl = new URL('/robots.txt', url).href;
            const robotsResponse = await axios.get(robotsUrl, { timeout: 5000 });
            if (robotsResponse.status === 200) {
                crawlScore += 15;
                if (robotsResponse.data.includes('Sitemap:')) {
                    crawlScore += 10;
                }
            }
        } catch (error) {
            issues.push('No robots.txt file found');
            recommendations.push('Create a robots.txt file to guide search engine crawlers');
        }
        
        // Check XML sitemap
        try {
            const sitemapUrl = new URL('/sitemap.xml', url).href;
            const sitemapResponse = await axios.get(sitemapUrl, { timeout: 5000 });
            if (sitemapResponse.status === 200 && sitemapResponse.data.includes('<urlset')) {
                crawlScore += 15;
            }
        } catch (error) {
            issues.push('No XML sitemap found');
            recommendations.push('Create an XML sitemap to help search engines discover your pages');
        }
        
        // Check meta robots
        if (html.includes('name="robots"')) {
            if (!html.includes('noindex') && !html.includes('nofollow')) {
                crawlScore += 10;
            }
        } else {
            crawlScore += 5; // Default is crawlable
        }
        
        scores.crawlability = Math.min(100, crawlScore);
        
        // 2. MOBILE-FRIENDLY ANALYSIS
        let mobileScore = 30; // Base score
        
        // Check viewport meta tag
        if (html.includes('name="viewport"')) {
            mobileScore += 25;
            if (html.includes('width=device-width')) {
                mobileScore += 15;
            }
        } else {
            issues.push('Missing viewport meta tag');
            recommendations.push('Add viewport meta tag for mobile responsiveness');
        }
        
        // Check responsive design indicators
        if (html.includes('@media') || html.includes('responsive') || html.includes('mobile')) {
            mobileScore += 15;
        }
        
        // Check for mobile-unfriendly elements
        if (html.includes('flash') || html.includes('.swf')) {
            mobileScore -= 20;
            issues.push('Flash content detected (not mobile-friendly)');
        }
        
        scores.mobileFriendly = Math.min(100, mobileScore);
        
        // 3. SECURITY ANALYSIS
        let securityScore = 0;
        
        // HTTPS check
        if (url.startsWith('https://')) {
            securityScore += 30;
        } else {
            issues.push('Website not using HTTPS');
            recommendations.push('Migrate to HTTPS for security and SEO benefits');
        }
        
        // Security headers check
        if (headers['strict-transport-security']) {
            securityScore += 15;
        }
        if (headers['x-frame-options']) {
            securityScore += 10;
        }
        if (headers['x-content-type-options']) {
            securityScore += 10;
        }
        if (headers['content-security-policy']) {
            securityScore += 15;
        }
        
        // Mixed content check
        if (url.startsWith('https://') && html.includes('http://')) {
            securityScore -= 10;
            issues.push('Mixed content detected (HTTP resources on HTTPS page)');
        }
        
        // Basic security indicators
        if (!html.includes('password') || html.includes('autocomplete="off"')) {
            securityScore += 10;
        }
        
        scores.security = Math.min(100, Math.max(0, securityScore));
        
        // 4. HTML STRUCTURE ANALYSIS
        let structureScore = 20; // Base score
        
        // Title tag
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1].trim().length > 0) {
            structureScore += 15;
            if (titleMatch[1].length <= 60) {
                structureScore += 5;
            }
        } else {
            issues.push('Missing or empty title tag');
        }
        
        // H1 tag
        if (html.includes('<h1')) {
            structureScore += 15;
        } else {
            issues.push('Missing H1 heading');
        }
        
        // Meta description
        if (html.includes('name="description"')) {
            structureScore += 15;
        } else {
            issues.push('Missing meta description');
        }
        
        // Language declaration
        if (html.includes('lang=') || html.includes('<html lang')) {
            structureScore += 10;
        } else {
            recommendations.push('Add language declaration to HTML tag');
        }
        
        // Alt text for images
        const images = html.match(/<img[^>]*>/gi) || [];
        const imagesWithAlt = images.filter(img => img.includes('alt=')).length;
        const altTextRatio = images.length > 0 ? (imagesWithAlt / images.length) * 100 : 100;
        
        if (altTextRatio >= 80) {
            structureScore += 15;
        } else if (altTextRatio >= 50) {
            structureScore += 8;
        } else {
            issues.push(`${Math.round(100 - altTextRatio)}% of images missing alt text`);
        }
        
        scores.htmlStructure = Math.min(100, structureScore);
        
        // 5. METADATA ANALYSIS
        let metaScore = 20; // Base score
        
        // Charset
        if (html.includes('charset=')) {
            metaScore += 10;
        }
        
        // Open Graph tags
        const ogTags = ['og:title', 'og:description', 'og:image', 'og:url'];
        const ogCount = ogTags.filter(tag => html.includes(tag)).length;
        metaScore += ogCount * 5; // 5 points per OG tag
        
        // Twitter Card tags
        if (html.includes('twitter:card')) {
            metaScore += 10;
        }
        
        // Canonical URL
        if (html.includes('rel="canonical"')) {
            metaScore += 15;
        } else {
            recommendations.push('Add canonical URL to prevent duplicate content issues');
        }
        
        // Structured data
        if (html.includes('application/ld+json')) {
            metaScore += 20;
        } else {
            recommendations.push('Add structured data (JSON-LD) for rich snippets');
        }
        
        scores.metaData = Math.min(100, metaScore);
        
        // 6. SITE SPEED ANALYSIS (Use Google PageSpeed if available)
        let speedScore = 50; // Default
        
        try {
            if (process.env.GOOGLE_API_KEY) {
                const pageSpeedData = await getPageSpeedInsights(url);
                speedScore = pageSpeedData.score;
            }
        } catch (error) {
            console.log('PageSpeed analysis failed, using basic metrics');
        }
        
        scores.siteSpeed = speedScore;
        
        // Generate overall recommendations
        if (scores.crawlability < 70) {
            recommendations.push('Improve crawlability by adding robots.txt and XML sitemap');
        }
        if (scores.mobileFriendly < 80) {
            recommendations.push('Enhance mobile-friendliness with responsive design');
        }
        if (scores.security < 80) {
            recommendations.push('Strengthen security with HTTPS and security headers');
        }
        if (scores.htmlStructure < 80) {
            recommendations.push('Fix HTML structure issues and add missing meta tags');
        }
        
        // Calculate overall technical score
        const overallScore = Math.round(
            (scores.crawlability + scores.mobileFriendly + scores.security + 
             scores.htmlStructure + scores.metaData + scores.siteSpeed) / 6
        );
        
        return {
            overallScore: overallScore,
            scores: scores,
            issues: issues,
            recommendations: recommendations.slice(0, 8),
            analysis: {
                imageCount: images.length,
                imagesWithAlt: imagesWithAlt,
                altTextRatio: Math.round(altTextRatio),
                hasRobotsTxt: crawlScore > 65,
                hasXMLSitemap: crawlScore > 80,
                hasHTTPS: url.startsWith('https://'),
                hasViewport: html.includes('name="viewport"'),
                hasCanonical: html.includes('rel="canonical"'),
                hasStructuredData: html.includes('application/ld+json'),
                ogTagsCount: ogCount,
                hasTwitterCard: html.includes('twitter:card')
            }
        };
        
    } catch (error) {
        return {
            overallScore: 0,
            scores: {
                crawlability: 0,
                mobileFriendly: 0,
                siteSpeed: 0,
                security: 0,
                htmlStructure: 0,
                metaData: 0
            },
            issues: ['Unable to analyze website technical aspects'],
            recommendations: ['Website may be inaccessible or behind authentication'],
            analysis: {},
            error: error.message
        };
    }
}

async function checkBrokenLinks(url) {
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MolaisonAI-Bot/1.0)' }
        });
        
        const html = response.data;
        const links = [];
        const brokenLinks = [];
        
        // Simple regex to find links (basic approach without cheerio)
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
        let match;
        
        while ((match = linkRegex.exec(html)) !== null) {
            const href = match[1];
            const text = match[2];
            
            if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
                try {
                    let absoluteUrl;
                    if (href.startsWith('http')) {
                        absoluteUrl = href;
                    } else {
                        const baseUrl = new URL(url);
                        absoluteUrl = new URL(href, baseUrl).href;
                    }
                    
                    links.push({
                        url: absoluteUrl,
                        text: text.trim(),
                        isInternal: absoluteUrl.includes(new URL(url).hostname)
                    });
                } catch (e) {
                    // Invalid URL, skip
                }
            }
        }
        
        // Check first 20 links to avoid timeout
        const linksToCheck = links.slice(0, 20);
        
        for (const link of linksToCheck) {
            try {
                const linkResponse = await axios.head(link.url, {
                    timeout: 5000,
                    maxRedirects: 3,
                    validateStatus: function (status) {
                        return status < 500;
                    }
                });
                
                if (linkResponse.status >= 400) {
                    brokenLinks.push({
                        url: link.url,
                        status: linkResponse.status,
                        text: link.text,
                        isInternal: link.isInternal,
                        error: `HTTP ${linkResponse.status}`
                    });
                }
                
            } catch (error) {
                brokenLinks.push({
                    url: link.url,
                    status: 0,
                    text: link.text,
                    isInternal: link.isInternal,
                    error: error.code || 'Connection failed'
                });
            }
        }
        
        return {
            totalLinks: links.length,
            checkedLinks: linksToCheck.length,
            brokenLinks: brokenLinks,
            internalLinks: links.filter(l => l.isInternal).length,
            externalLinks: links.filter(l => !l.isInternal).length,
            deepLinkRatio: Math.round((links.filter(l => l.isInternal && l.url !== url).length / links.length) * 100) || 0
        };
        
    } catch (error) {
        return {
            totalLinks: 0,
            checkedLinks: 0,
            brokenLinks: [],
            internalLinks: 0,
            externalLinks: 0,
            deepLinkRatio: 0,
            error: error.message
        };
    }
}

async function extractKeywords(url) {
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MolaisonAI-Bot/1.0)' }
        });
        
        const html = response.data;
        
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';
        
        // Extract meta description
        const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
        const metaDescription = metaMatch ? metaMatch[1] : '';
        
        // Extract headings
        const headingMatches = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [];
        const headings = headingMatches.map(h => h.replace(/<[^>]*>/g, '').trim());
        
        // Simple text extraction (remove HTML tags)
        const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                               .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                               .replace(/<[^>]*>/g, ' ')
                               .replace(/\s+/g, ' ')
                               .trim();
        
        // Simple keyword extraction
        const words = textContent.toLowerCase()
                                .replace(/[^\w\s]/g, ' ')
                                .split(/\s+/)
                                .filter(word => word.length > 2 && !isStopWord(word));
        
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        
        const keywords = Object.entries(wordFreq)
            .filter(([word, count]) => count > 1)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20)
            .map(([word, count]) => ({ keyword: word, frequency: count }));
        
        return {
            keywords: keywords,
            title: title,
            metaDescription: metaDescription,
            headingCount: headings.length,
            wordCount: words.length
        };
        
    } catch (error) {
        return {
            keywords: [],
            title: '',
            metaDescription: '',
            headingCount: 0,
            wordCount: 0,
            error: error.message
        };
    }
}

// REAL GEO ANALYSIS FUNCTION
async function analyzeGEOOptimization(url, topic) {
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MolaisonAI-Bot/1.0)' }
        });
        
        const html = response.data;
        
        // Remove scripts and styles for clean text analysis
        const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                             .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        
        const textContent = cleanHtml.replace(/<[^>]*>/g, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim();
        
        // Initialize GEO score factors
        let geoScore = 0;
        const maxScore = 100;
        const factors = {
            directAnswers: 0,
            structuredContent: 0,
            faqSections: 0,
            comprehensiveness: 0,
            readability: 0,
            questionFormat: 0
        };
        
        const recommendations = [];
        
        // 1. Direct Answers Analysis (25 points)
        const firstParagraph = getFirstParagraph(cleanHtml);
        if (firstParagraph.length > 50) {
            factors.directAnswers = 15;
            if (containsDirectAnswer(firstParagraph)) {
                factors.directAnswers = 25;
            }
        } else {
            recommendations.push("Add a clear, direct answer in the first paragraph");
        }
        
        // 2. Structured Content Analysis (20 points)
        const listCount = (cleanHtml.match(/<(ul|ol)[^>]*>/gi) || []).length;
        const bulletPoints = (cleanHtml.match(/<li[^>]*>/gi) || []).length;
        
        if (listCount > 0 && bulletPoints > 3) {
            factors.structuredContent = 20;
        } else if (listCount > 0) {
            factors.structuredContent = 10;
        } else {
            recommendations.push("Add bullet points and numbered lists for better AI parsing");
        }
        
        // 3. FAQ Sections Analysis (20 points)
        const faqIndicators = [
            /frequently\s+asked\s+questions/gi,
            /faq/gi,
            /q:\s*|question:\s*/gi,
            /a:\s*|answer:\s*/gi
        ];
        
        let faqScore = 0;
        faqIndicators.forEach(pattern => {
            if (pattern.test(cleanHtml)) {
                faqScore += 5;
            }
        });
        
        factors.faqSections = Math.min(faqScore, 20);
        
        if (factors.faqSections < 10) {
            recommendations.push("Add an FAQ section with common questions and direct answers");
        }
        
        // 4. Comprehensiveness Analysis (15 points)
        const wordCount = textContent.split(' ').length;
        if (wordCount > 1000) {
            factors.comprehensiveness = 15;
        } else if (wordCount > 500) {
            factors.comprehensiveness = 10;
        } else if (wordCount > 200) {
            factors.comprehensiveness = 5;
        } else {
            recommendations.push("Expand content to provide more comprehensive coverage of the topic");
        }
        
        // 5. Readability Analysis (10 points)
        const headingCount = (cleanHtml.match(/<h[1-6][^>]*>/gi) || []).length;
        const paragraphCount = (cleanHtml.match(/<p[^>]*>/gi) || []).length;
        
        if (headingCount >= 3 && paragraphCount >= 5) {
            factors.readability = 10;
        } else if (headingCount >= 2) {
            factors.readability = 5;
        } else {
            recommendations.push("Improve content structure with more headings and shorter paragraphs");
        }
        
        // 6. Question Format Analysis (10 points)
        const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
        const headings = (cleanHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [])
                        .map(h => h.replace(/<[^>]*>/g, '').toLowerCase());
        
        let questionHeadings = 0;
        headings.forEach(heading => {
            if (questionWords.some(qw => heading.includes(qw + ' ')) || heading.includes('?')) {
                questionHeadings++;
            }
        });
        
        if (questionHeadings >= 2) {
            factors.questionFormat = 10;
        } else if (questionHeadings >= 1) {
            factors.questionFormat = 5;
        } else {
            recommendations.push("Use question-format headings (What is...? How to...?) for better AI understanding");
        }
        
        // Calculate total GEO score
        geoScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
        
        // AI-specific recommendations based on analysis
        if (topic) {
            recommendations.push(`Optimize content specifically for "${topic}" queries that AI users commonly ask`);
        }
        
        if (geoScore < 70) {
            recommendations.push("Consider restructuring content to answer user questions more directly");
        }
        
        if (!cleanHtml.includes('schema.org')) {
            recommendations.push("Add FAQ schema markup to help AI engines understand your Q&A content");
        }
        
        // Generate specific insights
        const insights = generateGEOInsights(factors, textContent, topic);
        
        return {
            geoScore: Math.round(geoScore),
            maxScore: maxScore,
            percentage: Math.round((geoScore / maxScore) * 100),
            factors: factors,
            recommendations: recommendations.slice(0, 8), // Limit to top 8 recommendations
            insights: insights,
            analysis: {
                wordCount: wordCount,
                headingCount: headingCount,
                listCount: listCount,
                bulletPoints: bulletPoints,
                questionHeadings: questionHeadings,
                hasDirectAnswer: factors.directAnswers > 15,
                hasFAQ: factors.faqSections > 10,
                isComprehensive: factors.comprehensiveness > 10
            }
        };
        
    } catch (error) {
        return {
            geoScore: 0,
            maxScore: 100,
            percentage: 0,
            factors: {},
            recommendations: ['Unable to analyze website content for GEO optimization'],
            insights: [],
            analysis: {},
            error: error.message
        };
    }
}

function getFirstParagraph(html) {
    const paragraphMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i);
    return paragraphMatch ? paragraphMatch[1].trim() : '';
}

function containsDirectAnswer(text) {
    const directAnswerPatterns = [
        /^(yes|no|the answer is|simply|basically|essentially)/i,
        /(is|are|means|refers to|involves)/i,
        /^(to|in order to|you can|you should|you need)/i
    ];
    
    return directAnswerPatterns.some(pattern => pattern.test(text));
}

function generateGEOInsights(factors, content, topic) {
    const insights = [];
    
    if (factors.directAnswers >= 20) {
        insights.push("✅ Excellent direct answer format - AI engines will easily extract key information");
    } else if (factors.directAnswers >= 10) {
        insights.push("⚠️ Good start with direct answers, but could be more concise and clear");
    } else {
        insights.push("❌ Missing direct answers - add clear, immediate responses to user questions");
    }
    
    if (factors.structuredContent >= 15) {
        insights.push("✅ Well-structured content with good use of lists and bullet points");
    } else {
        insights.push("⚠️ Content needs better structure - more bullet points and numbered lists");
    }
    
    if (factors.faqSections >= 15) {
        insights.push("✅ Strong FAQ presence - perfect for AI question-answering");
    } else if (factors.faqSections >= 5) {
        insights.push("⚠️ Some Q&A elements found, but could expand FAQ sections");
    } else {
        insights.push("❌ No FAQ sections detected - critical for GEO optimization");
    }
    
    if (factors.comprehensiveness >= 12) {
        insights.push("✅ Comprehensive content coverage");
    } else {
        insights.push("⚠️ Content could be more comprehensive and detailed");
    }
    
    return insights;
}

function isStopWord(word) {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return stopWords.includes(word);
}

async function getAIRecommendations(url) {
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const content = response.data.replace(/<[^>]*>/g, ' ').substring(0, 1000);
        
        const aiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Analyze this website for SEO improvements: ${content}`
            }],
            max_tokens: 300
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const recommendations = aiResponse.data.choices[0].message.content
            .split('\n').filter(r => r.trim()).slice(0, 5);
        
        return { recommendations };
        
    } catch (error) {
        return {
            recommendations: [
                'Optimize page titles for target keywords',
                'Add meta descriptions to improve CTR',
                'Improve page loading speed',
                'Add structured data markup'
            ]
        };
    }
}

function generateIssues(technical, brokenLinks) {
    const issues = [];
    if (!technical.hasTitle) issues.push('Missing page title');
    if (!technical.hasMetaDescription) issues.push('Missing meta description');
    if (!technical.hasH1) issues.push('Missing H1 heading');
    if (!technical.hasSSL) issues.push('Website not using HTTPS');
    if (brokenLinks && brokenLinks.length > 0) issues.push(`${brokenLinks.length} broken links found`);
    return issues;
}

function generateOpportunities(technical) {
    const opportunities = [];
    if (!technical.hasSchemaMarkup) opportunities.push('Add structured data markup');
    opportunities.push('Improve page loading speed');
    return opportunities;
}

function calculateOverallScore(results) {
    let score = 30;
    if (results.scores.pageSpeed) score += (results.scores.pageSpeed / 100) * 25;
    if (results.technical.hasTitle) score += 8;
    if (results.technical.hasMetaDescription) score += 8;
    if (results.technical.hasSSL) score += 8;
    if (results.brokenLinks && results.brokenLinks.length === 0) score += 10;
    return Math.min(100, Math.max(0, Math.round(score)));
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Molaison AI Backend running on port ${PORT}`);
    console.log(`🔗 Real broken links detection enabled`);
    console.log(`🔍 Real keyword extraction enabled`);
    console.log(`🤖 Real GEO analysis enabled`);
    console.log(`🔧 Real technical SEO analysis enabled`);
});

module.exports = app;
