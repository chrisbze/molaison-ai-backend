// Molaison AI - Enhanced Backend with Real Broken Links and Keyword Analysis
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const cheerio = require('cheerio'); // For HTML parsing
const { URL } = require('url');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.raw({type: 'application/json'})); // For webhooks

// API Keys
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Customer database (in production, use real database)
let customers = new Map();
let analysisResults = new Map();
let customerCount = 0;
const MAX_CUSTOMERS = 100;

// Generate username and password
function generateCredentials(email, customerNumber) {
    const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = `${emailPrefix}_${customerNumber}`;
    const password = crypto.randomBytes(4).toString('hex').toUpperCase();
    return { username, password };
}

// Generate unique customer ID
function generateCustomerId() {
    return 'cust_' + crypto.randomBytes(8).toString('hex');
}

// 1. HEALTH CHECK
app.get('/', (req, res) => {
    res.json({
        message: 'Molaison AI Enhanced Backend is running!',
        customers: customerCount,
        maxCustomers: MAX_CUSTOMERS,
        spotsLeft: MAX_CUSTOMERS - customerCount,
        features: ['Authentication', 'Real SEO Analysis', 'Real Broken Links Detection', 'Real Keyword Extraction']
    });
});

// 2. CHECK AVAILABILITY
app.get('/api/availability', (req, res) => {
    const spotsLeft = MAX_CUSTOMERS - customerCount;
    res.json({
        available: customerCount < MAX_CUSTOMERS,
        spotsLeft: spotsLeft,
        totalCustomers: customerCount,
        maxCustomers: MAX_CUSTOMERS
    });
});

// 3. LOGIN ENDPOINT
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username and password required' 
            });
        }
        
        // Find customer by username and password
        let foundCustomer = null;
        for (const [customerId, customer] of customers) {
            if (customer.username === username && customer.password === password) {
                foundCustomer = { customerId, ...customer };
                break;
            }
        }
        
        if (!foundCustomer) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid username or password' 
            });
        }
        
        // Check if account is still active (within 1 year)
        const oneYearFromPurchase = new Date(foundCustomer.purchaseDate);
        oneYearFromPurchase.setFullYear(oneYearFromPurchase.getFullYear() + 1);
        
        if (new Date() > oneYearFromPurchase) {
            return res.status(403).json({ 
                success: false, 
                error: 'Account has expired. Please renew your subscription.' 
            });
        }
        
        // Update last login
        foundCustomer.lastLogin = new Date();
        customers.set(foundCustomer.customerId, foundCustomer);
        
        res.json({
            success: true,
            customerId: foundCustomer.customerId,
            planType: foundCustomer.planType,
            customerNumber: foundCustomer.customerNumber,
            daysRemaining: Math.ceil((oneYearFromPurchase - new Date()) / (1000 * 60 * 60 * 24))
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Login system error' 
        });
    }
});

// 4. ENHANCED SEO ANALYSIS WITH REAL BROKEN LINKS AND KEYWORDS
app.post('/api/analyze-seo', async (req, res) => {
    try {
        const { url, customerId, keywords } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        // Verify customer access if customerId provided
        if (customerId && !verifyCustomerAccess(customerId)) {
            return res.status(403).json({ error: 'Valid subscription required' });
        }
        
        console.log(`Running enhanced SEO analysis for: ${url}`);
        
        const results = await runEnhancedSEOAnalysis(url, keywords);
        
        // Store results if customer is authenticated
        if (customerId) {
            const analysisId = `${customerId}-${Date.now()}`;
            analysisResults.set(analysisId, {
                url,
                results,
                timestamp: new Date(),
                customerId
            });
            
            // Update customer analysis count
            const customer = customers.get(customerId);
            if (customer) {
                customer.analysisCount = (customer.analysisCount || 0) + 1;
                customer.lastAnalysis = new Date();
            }
        }
        
        res.json({
            success: true,
            data: results,
            message: 'Enhanced SEO analysis complete'
        });
        
    } catch (error) {
        console.error('Enhanced SEO Analysis Error:', error);
        res.status(500).json({ error: 'Analysis failed: ' + error.message });
    }
});

// 5. REAL BROKEN LINKS ANALYSIS
app.post('/api/analyze-broken-links', async (req, res) => {
    try {
        const { url, customerId } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        console.log(`Analyzing broken links for: ${url}`);
        
        const brokenLinksData = await analyzeBrokenLinks(url);
        
        res.json({
            success: true,
            data: brokenLinksData,
            message: 'Broken links analysis complete'
        });
        
    } catch (error) {
        console.error('Broken Links Analysis Error:', error);
        res.status(500).json({ error: 'Broken links analysis failed: ' + error.message });
    }
});

// 6. REAL KEYWORD EXTRACTION
app.post('/api/extract-keywords', async (req, res) => {
    try {
        const { url, customerId } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        console.log(`Extracting keywords for: ${url}`);
        
        const keywordData = await extractRealKeywords(url);
        
        res.json({
            success: true,
            data: keywordData,
            message: 'Keyword extraction complete'
        });
        
    } catch (error) {
        console.error('Keyword Extraction Error:', error);
        res.status(500).json({ error: 'Keyword extraction failed: ' + error.message });
    }
});

// WEBHOOK FOR NEW CUSTOMERS (from GoHighLevel)
app.post('/webhook/new-customer', (req, res) => {
    try {
        console.log('Webhook received:', req.body);
        
        const webhookData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        
        if (customerCount >= MAX_CUSTOMERS) {
            console.log('Customer limit reached');
            return res.status(400).json({ error: 'Customer limit reached' });
        }
        
        const email = webhookData.contact?.email || webhookData.email;
        const name = webhookData.contact?.name || webhookData.name || email.split('@')[0];
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        customerCount++;
        const customerId = generateCustomerId();
        const credentials = generateCredentials(email, customerCount);
        
        const newCustomer = {
            email: email,
            name: name,
            username: credentials.username,
            password: credentials.password,
            customerId: customerId,
            purchaseDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            planType: 'founders-edition',
            customerNumber: customerCount,
            analysisCount: 0,
            createdAt: new Date(),
            lastLogin: null
        };
        
        customers.set(customerId, newCustomer);
        
        console.log(`New customer created: ${email} (${customerCount}/${MAX_CUSTOMERS})`);
        console.log(`Login credentials: ${credentials.username} / ${credentials.password}`);
        
        res.json({
            success: true,
            customerId: customerId,
            customerNumber: customerCount,
            username: credentials.username,
            password: credentials.password,
            loginUrl: 'https://molaisonai.com/login',
            dashboardUrl: 'https://molaisonai.com/dashboard',
            message: 'Account created successfully'
        });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed: ' + error.message });
    }
});

// Helper Functions
function verifyCustomerAccess(customerId) {
    const customer = customers.get(customerId);
    if (!customer) return false;
    
    const oneYearFromPurchase = new Date(customer.purchaseDate);
    oneYearFromPurchase.setFullYear(oneYearFromPurchase.getFullYear() + 1);
    
    return new Date() <= oneYearFromPurchase;
}

// ENHANCED SEO ANALYSIS WITH REAL DATA
async function runEnhancedSEOAnalysis(url, keywords) {
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
    
    try {
        console.log(`Starting enhanced analysis for: ${url}`);
        
        // Google PageSpeed Analysis
        if (GOOGLE_API_KEY) {
            const pageSpeedData = await getPageSpeedInsights(url);
            results.scores.pageSpeed = pageSpeedData.score;
            results.technical.loadTime = pageSpeedData.loadTime;
        }
        
        // Technical SEO Analysis with real broken links
        const technicalData = await analyzeTechnicalSEOWithLinks(url);
        results.technical = { ...results.technical, ...technicalData.technical };
        results.brokenLinks = technicalData.brokenLinks;
        
        // Real keyword extraction
        const keywordData = await extractRealKeywords(url);
        results.extractedKeywords = keywordData.keywords;
        
        // AI Content Analysis
        if (OPENAI_API_KEY) {
            const contentAnalysis = await analyzeContentWithAI(url, keywordData.content);
            results.recommendations = contentAnalysis.recommendations;
        }
        
        // Generate issues and opportunities
        results.issues = generateIssues(results.technical, results.brokenLinks);
        results.opportunities = generateOpportunities(results.technical, results.extractedKeywords);
        
        // Calculate overall score
        results.scores.overall = calculateOverallScore(results);
        
        return results;
        
    } catch (error) {
        console.error('Enhanced Analysis Error:', error);
        throw error;
    }
}

// REAL BROKEN LINKS ANALYSIS
async function analyzeBrokenLinks(baseUrl) {
    try {
        console.log(`Crawling ${baseUrl} for broken links...`);
        
        const response = await axios.get(baseUrl, {
            timeout: 30000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MolaisonAI-Bot/1.0)' },
            maxRedirects: 5
        });
        
        const $ = cheerio.load(response.data);
        const links = [];
        const brokenLinks = [];
        
        // Extract all links
        $('a[href]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                try {
                    const absoluteUrl = new URL(href, baseUrl).href;
                    links.push({
                        url: absoluteUrl,
                        text: $(elem).text().trim(),
                        isInternal: absoluteUrl.includes(new URL(baseUrl).hostname)
                    });
                } catch (e) {
                    // Invalid URL
                }
            }
        });
        
        console.log(`Found ${links.length} links to check`);
        
        // Check links in batches (limit to prevent timeout)
        const linksToCheck = links.slice(0, 50); // Limit for demo
        
        for (const link of linksToCheck) {
            try {
                const linkResponse = await axios.head(link.url, {
                    timeout: 10000,
                    maxRedirects: 5,
                    validateStatus: function (status) {
                        return status < 500; // Don't throw for 4xx errors
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
            deepLinkRatio: Math.round((links.filter(l => l.isInternal && l.url !== baseUrl).length / links.length) * 100)
        };
        
    } catch (error) {
        console.error('Broken links analysis error:', error);
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

// REAL KEYWORD EXTRACTION
async function extractRealKeywords(url) {
    try {
        console.log(`Extracting keywords from ${url}...`);
        
        const response = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MolaisonAI-Bot/1.0)' }
        });
        
        const $ = cheerio.load(response.data);
        
        // Extract text content
        const title = $('title').text().trim();
        const metaDescription = $('meta[name="description"]').attr('content') || '';
        const headings = [];
        
        $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
            headings.push($(elem).text().trim());
        });
        
        // Get body text (remove scripts and styles)
        $('script, style, noscript').remove();
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
        
        // Extract keywords from title and headings
        const titleKeywords = extractKeywordsFromText(title);
        const headingKeywords = headings.map(h => extractKeywordsFromText(h)).flat();
        const metaKeywords = extractKeywordsFromText(metaDescription);
        
        // Extract keywords from body text (first 2000 chars)
        const bodyKeywords = extractKeywordsFromText(bodyText.substring(0, 2000));
        
        // Combine and score keywords
        const allKeywords = [...titleKeywords, ...headingKeywords, ...metaKeywords, ...bodyKeywords];
        const keywordFreq = {};
        
        allKeywords.forEach(keyword => {
            keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
        });
        
        // Sort by frequency and filter
        const sortedKeywords = Object.entries(keywordFreq)
            .filter(([word, count]) => word.length > 2 && count > 1)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20)
            .map(([word, count]) => ({ keyword: word, frequency: count }));
        
        return {
            keywords: sortedKeywords,
            title: title,
            metaDescription: metaDescription,
            headingCount: headings.length,
            content: bodyText.substring(0, 1000), // For AI analysis
            wordCount: bodyText.split(' ').length
        };
        
    } catch (error) {
        console.error('Keyword extraction error:', error);
        return {
            keywords: [],
            title: '',
            metaDescription: '',
            headingCount: 0,
            content: '',
            wordCount: 0,
            error: error.message
        };
    }
}

function extractKeywordsFromText(text) {
    if (!text) return [];
    
    // Simple keyword extraction (can be enhanced)
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !isStopWord(word));
}

function isStopWord(word) {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these', 'those', 'can', 'will', 'should', 'would', 'could', 'may', 'might', 'must', 'have', 'has', 'had', 'been', 'being', 'are', 'is', 'was', 'were'];
    return stopWords.includes(word);
}

// ENHANCED TECHNICAL SEO WITH BROKEN LINKS
async function analyzeTechnicalSEOWithLinks(url) {
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MolaisonAI-Bot/1.0)' }
        });
        
        const html = response.data;
        const brokenLinksData = await analyzeBrokenLinks(url);
        
        return {
            technical: {
                hasTitle: html.includes('<title>') && !html.includes('<title></title>'),
                hasMetaDescription: html.includes('name="description"'),
                hasH1: html.includes('<h1'),
                hasSchemaMarkup: html.includes('application/ld+json'),
                hasSSL: url.startsWith('https://'),
                imageCount: (html.match(/<img/g) || []).length,
                linkCount: (html.match(/<a /g) || []).length,
                totalLinks: brokenLinksData.totalLinks,
                internalLinks: brokenLinksData.internalLinks,
                externalLinks: brokenLinksData.externalLinks,
                deepLinkRatio: brokenLinksData.deepLinkRatio
            },
            brokenLinks: brokenLinksData.brokenLinks
        };
        
    } catch (error) {
        return {
            technical: { hasSSL: url.startsWith('https://') },
            brokenLinks: []
        };
    }
}

// Enhanced AI analysis with keywords
async function analyzeContentWithAI(url, content) {
    try {
        if (!OPENAI_API_KEY || !content) {
            return {
                recommendations: [
                    'Optimize page titles for target keywords',
                    'Add meta descriptions to improve CTR',
                    'Improve page loading speed',
                    'Add structured data markup',
                    'Fix broken links found during analysis'
                ]
            };
        }
        
        const aiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Analyze this website content for SEO improvements and provide 5-7 specific recommendations: ${content.substring(0, 1500)}`
            }],
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const recommendations = aiResponse.data.choices[0].message.content
            .split('\n').filter(r => r.trim()).slice(0, 7);
        
        return { recommendations };
        
    } catch (error) {
        return {
            recommendations: [
                'Optimize page titles for target keywords',
                'Add meta descriptions to improve CTR',
                'Improve page loading speed',
                'Add structured data markup',
                'Fix broken links found during analysis'
            ]
        };
    }
}

// Enhanced issue generation
function generateIssues(technical, brokenLinks) {
    const issues = [];
    if (!technical.hasTitle) issues.push('Missing page title');
    if (!technical.hasMetaDescription) issues.push('Missing meta description');
    if (!technical.hasH1) issues.push('Missing H1 heading');
    if (!technical.hasSSL) issues.push('Website not using HTTPS');
    if (brokenLinks.length > 0) issues.push(`${brokenLinks.length} broken links found`);
    return issues;
}

// Enhanced opportunities generation
function generateOpportunities(technical, keywords) {
    const opportunities = [];
    if (!technical.hasSchemaMarkup) opportunities.push('Add structured data markup');
    if (keywords.length > 0) opportunities.push(`Optimize for ${keywords.slice(0, 3).map(k => k.keyword).join(', ')}`);
    opportunities.push('Improve page loading speed');
    if (technical.deepLinkRatio < 60) opportunities.push('Improve internal linking strategy');
    return opportunities;
}

// Enhanced score calculation
function calculateOverallScore(results) {
    let score = 30;
    if (results.scores.pageSpeed) score += (results.scores.pageSpeed / 100) * 25;
    if (results.technical.hasTitle) score += 8;
    if (results.technical.hasMetaDescription) score += 8;
    if (results.technical.hasSSL) score += 8;
    if (results.brokenLinks.length === 0) score += 10;
    if (results.extractedKeywords.length > 5) score += 5;
    return Math.min(100, Math.max(0, Math.round(score)));
}

// Keep existing functions
async function getPageSpeedInsights(url) {
    try {
        const response = await axios.get(`https://www.googleapis.com/pagespeed/insights/v5/runPagespeed`, {
            params: { url: url, key: GOOGLE_API_KEY, strategy: 'mobile' },
            timeout: 30000
        });
        
        const data = response.data;
        const score = Math.round(data.lighthouseResult.categories.performance.score * 100);
        const loadTime = data.lighthouseResult.audits['speed-index'].displayValue;
        
        return { score, loadTime };
        
    } catch (error) {
        console.error('PageSpeed Error:', error);
        return { score: 50, loadTime: 'Unknown' };
    }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Molaison AI Enhanced Backend running on port ${PORT}`);
    console.log(`🔗 Real broken links detection enabled`);
    console.log(`🔍 Real keyword extraction enabled`);
    console.log(`📊 Enhanced SEO analysis API ready`);
});

module.exports = app;
