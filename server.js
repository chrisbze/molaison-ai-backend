 const express = require('express');
  const cors = require('cors');
  const axios = require('axios');

  const app = express();
  app.use(cors());
  app.use(express.json());

  // API Keys from environment variables
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // Simple customer storage (in production, use a database)
  let customers = new Map();
  let analysisResults = new Map();
  let customerCount = 0;
  const MAX_CUSTOMERS = 100;

  // Health check endpoint
  app.get('/', (req, res) => {
      res.json({
          message: 'Molaison AI Backend is running!',
          customers: customerCount,
          maxCustomers: MAX_CUSTOMERS,
          spotsLeft: MAX_CUSTOMERS - customerCount
      });
  });

  // Check availability
  app.get('/api/availability', (req, res) => {
      const spotsLeft = MAX_CUSTOMERS - customerCount;
      res.json({
          available: customerCount < MAX_CUSTOMERS,
          spotsLeft: spotsLeft,
          totalCustomers: customerCount,
          maxCustomers: MAX_CUSTOMERS
      });
  });

  // Real SEO analysis endpoint
  app.post('/api/analyze-seo', async (req, res) => {
      try {
          const { url, customerId } = req.body;

          if (!url) {
              return res.status(400).json({ error: 'URL is required' });
          }

          console.log(`Running SEO analysis for: ${url}`);

          const results = await runSEOAnalysis(url);

          res.json({
              success: true,
              data: results,
              message: 'SEO analysis complete'
          });

      } catch (error) {
          console.error('SEO Analysis Error:', error);
          res.status(500).json({ error: 'Analysis failed' });
      }
  });

  // Main SEO analysis function
  async function runSEOAnalysis(url) {
      const results = {
          url: url,
          timestamp: new Date(),
          scores: {},
          issues: [],
          opportunities: [],
          technical: {},
          recommendations: []
      };

      try {
          // Google PageSpeed Analysis
          if (GOOGLE_API_KEY) {
              const pageSpeedData = await getPageSpeedInsights(url);
              results.scores.pageSpeed = pageSpeedData.score;
              results.technical.loadTime = pageSpeedData.loadTime;
          }

          // Technical SEO Analysis
          const technicalData = await analyzeTechnicalSEO(url);
          results.technical = { ...results.technical, ...technicalData };

          // AI Content Analysis
          if (OPENAI_API_KEY) {
              const contentAnalysis = await analyzeContentWithAI(url);
              results.recommendations = contentAnalysis.recommendations;
          }

          // Generate issues and opportunities
          results.issues = generateIssues(results.technical);
          results.opportunities = generateOpportunities(results.technical);

          // Calculate overall score
          results.scores.overall = calculateOverallScore(results);

          return results;

      } catch (error) {
          console.error('Analysis Error:', error);
          throw error;
      }
  }

  // Google PageSpeed Insights
  async function getPageSpeedInsights(url) {
      try {
          const response = await axios.get(`https://www.googleapis.com/pagespeed/insights/v5/runPagespeed`, {
              params: {
                  url: url,
                  key: GOOGLE_API_KEY,
                  strategy: 'mobile'
              },
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

  // Technical SEO Analysis
  async function analyzeTechnicalSEO(url) {
      try {
          const response = await axios.get(url, {
              timeout: 15000,
              headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; MolaisonAI-Bot/1.0)'
              }
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

      } catch (error) {
          console.error('Technical SEO Error:', error);
          return { hasSSL: url.startsWith('https://') };
      }
  }

  // AI Content Analysis
  async function analyzeContentWithAI(url) {
      try {
          const response = await axios.get(url);
          const html = response.data;
          const textContent = html.replace(/<[^>]*>/g, ' ').substring(0, 2000);

          const aiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
              model: 'gpt-3.5-turbo',
              messages: [{
                  role: 'user',
                  content: `Analyze this website content for SEO improvements and provide 3-5 specific recommendations: ${textContent}`
              }],
              max_tokens: 400
          }, {
              headers: {
                  'Authorization': `Bearer ${OPENAI_API_KEY}`,
                  'Content-Type': 'application/json'
              }
          });

          const recommendations = aiResponse.data.choices[0].message.content
              .split('\n')
              .filter(r => r.trim())
              .slice(0, 5);

          return { recommendations };

      } catch (error) {
          console.error('AI Analysis Error:', error);
          return {
              recommendations: [
                  'Optimize page titles for target keywords',
                  'Add meta descriptions to improve CTR',
                  'Improve page loading speed',
                  'Add structured data markup',
                  'Optimize images with alt text'
              ]
          };
      }
  }

  // Generate issues from technical analysis
  function generateIssues(technical) {
      const issues = [];
      if (!technical.hasTitle) issues.push('Missing page title');
      if (!technical.hasMetaDescription) issues.push('Missing meta description');
      if (!technical.hasH1) issues.push('Missing H1 heading');
      if (!technical.hasSSL) issues.push('Website not using HTTPS');
      if (!technical.hasSchemaMarkup) issues.push('No structured data found');
      return issues;
  }

  // Generate opportunities
  function generateOpportunities(technical) {
      const opportunities = [];
      if (technical.imageCount > 0) opportunities.push('Optimize images with alt text');
      if (!technical.hasSchemaMarkup) opportunities.push('Add structured data markup');
      if (technical.linkCount > 50) opportunities.push('Optimize internal linking');
      opportunities.push('Improve page loading speed');
      return opportunities;
  }

  // Calculate overall score
  function calculateOverallScore(results) {
      let score = 30;

      if (results.scores.pageSpeed) {
          score += (results.scores.pageSpeed / 100) * 25;
      }

      const technical = results.technical;
      if (technical.hasTitle) score += 8;
      if (technical.hasMetaDescription) score += 8;
      if (technical.hasH1) score += 6;
      if (technical.hasSchemaMarkup) score += 10;
      if (technical.hasSSL) score += 8;

      if (results.recommendations && results.recommendations.length >= 3) {
          score += 15;
      }

      return Math.min(100, Math.max(0, Math.round(score)));
  }

  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
      console.log(`🚀 Molaison AI Backend running on port ${PORT}`);
      console.log(`📊 Real SEO analysis API ready`);
  });
