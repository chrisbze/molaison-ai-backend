// Molaison AI - Simple Backend with Real Broken Links and Keywords
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
const MAX_CUSTOMERS = 100;

// 1. HEALTH CHECK
app.get('/', (req, res) => {
    res.json({
        message: 'Molaison AI Backend is running!',
        customers: customerCount,
        maxCustomers: MAX_CUSTOMERS,
        spotsLeft: MAX_CUSTOMERS - customerCount,
        features: ['Real SEO Analysis', 'Real Broken Links', 'Real Keywords']
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
});

module.exports = app;
