import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, description, currentPrice, lowestPrice, highestPrice, priceHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const priceTrend = priceHistory && priceHistory.length > 1 
      ? priceHistory[priceHistory.length - 1].price > priceHistory[0].price ? 'increasing' : 'decreasing'
      : 'stable';

    const prompt = `Analyze this product and provide a buying recommendation:

Product: ${productName}
Description: ${description}
Current Price: ₹${currentPrice}
Lowest Price (30 days): ₹${lowestPrice}
Highest Price (30 days): ₹${highestPrice}
Price Trend: ${priceTrend}

Provide:
1. A sentiment score between 0 and 1 (0 = poor deal, 1 = excellent deal)
2. A brief recommendation (max 100 words)
3. A one-sentence summary

Format your response as JSON with keys: sentimentScore, recommendation, summary`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a product analysis expert. Analyze products and provide buying recommendations based on price history and trends.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI Response:', content);
    
    // Parse the AI response - handle JSON wrapped in markdown code blocks
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback if AI doesn't return valid JSON
      analysis = {
        sentimentScore: 0.5,
        recommendation: content,
        summary: 'Unable to parse AI analysis'
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-product:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
