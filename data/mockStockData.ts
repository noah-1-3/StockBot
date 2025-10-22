
import { StockData, WatchlistItem } from '@/types/stock';
import { getDailyVariation, getEnhancedDailyVariation } from '@/utils/stockUpdateService';

// Generate mock historical data for the past 30 days
const generateHistoricalData = (basePrice: number, volatility: number = 0.02) => {
  const data = [];
  let price = basePrice;
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random walk with slight upward bias
    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price + change, basePrice * 0.7);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    });
  }
  
  return data;
};

// Generate prediction data for the next N days
const generatePredictionData = (lastPrice: number, daysAhead: number = 7, trend: number = 0.01) => {
  const data = [];
  let price = lastPrice;
  const today = new Date();
  
  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Trend-based prediction with some randomness
    const change = (trend + (Math.random() - 0.5) * 0.005) * price;
    price = price + change;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    });
  }
  
  return data;
};

// Generate dynamic prediction for any stock and date
export const generateDynamicPrediction = (baseStock: StockData, daysAhead: number): StockData => {
  console.log('Generating dynamic prediction for', baseStock.symbol, 'days ahead:', daysAhead);
  
  // Calculate trend based on recent historical data
  const recentData = baseStock.historicalData.slice(-10);
  const avgChange = recentData.reduce((sum, point, idx) => {
    if (idx === 0) return 0;
    return sum + (point.price - recentData[idx - 1].price);
  }, 0) / (recentData.length - 1);
  
  const trend = avgChange / baseStock.currentPrice;
  
  // Generate new prediction data
  const predictionData = generatePredictionData(baseStock.currentPrice, daysAhead, trend);
  const predictedPrice = predictionData[predictionData.length - 1].price;
  const predictedChange = predictedPrice - baseStock.currentPrice;
  const predictedChangePercent = (predictedChange / baseStock.currentPrice) * 100;
  
  // Calculate confidence based on days ahead (decreases with longer predictions)
  const baseConfidence = baseStock.confidence || 85;
  const confidenceDecay = Math.min(30, daysAhead * 0.5);
  const confidence = Math.max(50, Math.round(baseConfidence - confidenceDecay));
  
  return {
    ...baseStock,
    predictionData,
    predictedPrice,
    predictedChange,
    predictedChangePercent,
    confidence,
  };
};

// Comprehensive list of US stocks with company descriptions
export const allUSStocks = [
  // Tech Giants
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', basePrice: 178.45, description: 'Designs and manufactures consumer electronics, software, and online services including iPhone, iPad, Mac, and Apple Watch.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', basePrice: 142.80, description: 'Parent company of Google, providing internet search, online advertising, cloud computing, and various software services.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', basePrice: 412.35, description: 'Develops software, hardware, and cloud services including Windows, Office, Azure, and Xbox gaming platforms.' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', basePrice: 178.25, description: 'E-commerce giant offering online retail, cloud computing (AWS), digital streaming, and artificial intelligence services.' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', basePrice: 485.20, description: 'Social media and technology company operating Facebook, Instagram, WhatsApp, and developing virtual reality products.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', basePrice: 875.50, description: 'Designs graphics processing units (GPUs) for gaming, professional visualization, data centers, and AI computing.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive', basePrice: 248.90, description: 'Electric vehicle manufacturer and clean energy company producing cars, solar panels, and energy storage solutions.' },
  
  // Financial Services
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', basePrice: 185.40, description: 'Global financial services firm offering investment banking, asset management, and consumer banking services.' },
  { symbol: 'BAC', name: 'Bank of America Corporation', sector: 'Financial Services', basePrice: 34.50, description: 'Multinational investment bank providing banking, investing, asset management, and financial services.' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financial Services', basePrice: 52.30, description: 'Diversified financial services company offering banking, insurance, investments, and mortgage products.' },
  { symbol: 'GS', name: 'The Goldman Sachs Group, Inc.', sector: 'Financial Services', basePrice: 425.60, description: 'Leading investment banking and securities firm serving corporations, governments, and high-net-worth individuals.' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial Services', basePrice: 98.75, description: 'Global financial services firm providing investment banking, wealth management, and institutional securities.' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', basePrice: 275.80, description: 'Global payments technology company facilitating electronic funds transfers through credit and debit card networks.' },
  { symbol: 'MA', name: 'Mastercard Incorporated', sector: 'Financial Services', basePrice: 445.90, description: 'Payment processing network connecting consumers, businesses, and financial institutions worldwide.' },
  { symbol: 'AXP', name: 'American Express Company', sector: 'Financial Services', basePrice: 215.30, description: 'Financial services corporation offering credit cards, charge cards, and traveler\'s cheque services.' },
  
  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', basePrice: 158.90, description: 'Pharmaceutical and consumer healthcare company producing medical devices, pharmaceuticals, and consumer health products.' },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', sector: 'Healthcare', basePrice: 512.40, description: 'Diversified healthcare company offering health insurance, pharmacy benefits, and healthcare services.' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', basePrice: 28.65, description: 'Pharmaceutical corporation developing and manufacturing medicines and vaccines for various therapeutic areas.' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', basePrice: 168.75, description: 'Biopharmaceutical company researching and developing advanced therapies for complex diseases.' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', sector: 'Healthcare', basePrice: 545.20, description: 'Life sciences company providing analytical instruments, reagents, and laboratory equipment.' },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', basePrice: 112.80, description: 'Healthcare company producing diagnostics, medical devices, nutrition products, and branded generic medicines.' },
  { symbol: 'MRK', name: 'Merck & Co., Inc.', sector: 'Healthcare', basePrice: 125.40, description: 'Global pharmaceutical company developing prescription medicines, vaccines, and animal health products.' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', basePrice: 785.30, description: 'Pharmaceutical company discovering and delivering medicines for diabetes, cancer, and other serious conditions.' },
  
  // Consumer Goods
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Defensive', basePrice: 62.45, description: 'Beverage company manufacturing and distributing soft drinks, juices, and other non-alcoholic beverages worldwide.' },
  { symbol: 'PEP', name: 'PepsiCo, Inc.', sector: 'Consumer Defensive', basePrice: 168.90, description: 'Food and beverage corporation producing snacks, soft drinks, and other consumer products globally.' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', basePrice: 72.35, description: 'Multinational retail corporation operating hypermarkets, discount stores, and grocery stores worldwide.' },
  { symbol: 'PG', name: 'The Procter & Gamble Company', sector: 'Consumer Defensive', basePrice: 165.80, description: 'Consumer goods company producing household, personal care, and hygiene products.' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Defensive', basePrice: 785.60, description: 'Membership-only warehouse club offering merchandise at discounted prices to members.' },
  { symbol: 'NKE', name: 'NIKE, Inc.', sector: 'Consumer Cyclical', basePrice: 78.90, description: 'Athletic footwear and apparel company designing, manufacturing, and marketing sports equipment worldwide.' },
  { symbol: 'MCD', name: "McDonald's Corporation", sector: 'Consumer Cyclical', basePrice: 295.40, description: 'Fast-food restaurant chain operating and franchising restaurants serving burgers, fries, and beverages globally.' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Cyclical', basePrice: 98.75, description: 'Coffeehouse chain roasting, marketing, and retailing specialty coffee and beverages worldwide.' },
  
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', basePrice: 112.50, description: 'Oil and gas company engaged in exploration, production, refining, and distribution of petroleum products.' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', basePrice: 158.30, description: 'Integrated energy company involved in oil and gas exploration, production, refining, and marketing.' },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', basePrice: 118.45, description: 'Independent exploration and production company finding and producing oil and natural gas globally.' },
  { symbol: 'SLB', name: 'Schlumberger Limited', sector: 'Energy', basePrice: 48.90, description: 'Oilfield services company providing technology and solutions for oil and gas exploration and production.' },
  
  // Telecommunications
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication Services', basePrice: 21.85, description: 'Telecommunications company providing wireless, broadband, and entertainment services to consumers and businesses.' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication Services', basePrice: 42.30, description: 'Telecommunications provider offering wireless services, internet, and television to residential and business customers.' },
  { symbol: 'TMUS', name: 'T-Mobile US, Inc.', sector: 'Communication Services', basePrice: 185.60, description: 'Wireless network operator providing mobile communications services and devices across the United States.' },
  
  // Entertainment & Media
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Communication Services', basePrice: 112.80, description: 'Entertainment conglomerate operating theme parks, film studios, television networks, and streaming services.' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', sector: 'Communication Services', basePrice: 625.40, description: 'Streaming entertainment service offering movies, TV shows, and original content via subscription.' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication Services', basePrice: 42.15, description: 'Media and technology company providing cable television, internet, telephone, and entertainment services.' },
  
  // Semiconductors
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', basePrice: 42.85, description: 'Semiconductor company designing and manufacturing microprocessors and other computing components.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', sector: 'Technology', basePrice: 168.90, description: 'Semiconductor company producing processors and graphics cards for computers, gaming, and data centers.' },
  { symbol: 'QCOM', name: 'QUALCOMM Incorporated', sector: 'Technology', basePrice: 175.30, description: 'Wireless technology company developing semiconductors and telecommunications equipment for mobile devices.' },
  { symbol: 'TXN', name: 'Texas Instruments Incorporated', sector: 'Technology', basePrice: 185.60, description: 'Semiconductor company designing and manufacturing analog and embedded processing chips.' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', basePrice: 1425.80, description: 'Semiconductor and infrastructure software company providing solutions for data centers and networking.' },
  
  // Retail
  { symbol: 'HD', name: 'The Home Depot, Inc.', sector: 'Consumer Cyclical', basePrice: 385.40, description: 'Home improvement retailer selling tools, construction products, and services for home renovation projects.' },
  { symbol: 'LOW', name: "Lowe's Companies, Inc.", sector: 'Consumer Cyclical', basePrice: 245.90, description: 'Home improvement retailer offering products and services for home decoration, maintenance, and repair.' },
  { symbol: 'TGT', name: 'Target Corporation', sector: 'Consumer Cyclical', basePrice: 148.75, description: 'General merchandise retailer offering household essentials, apparel, electronics, and groceries.' },
  
  // Industrial
  { symbol: 'BA', name: 'The Boeing Company', sector: 'Industrials', basePrice: 185.30, description: 'Aerospace company designing, manufacturing, and selling commercial airplanes, defense systems, and space vehicles.' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials', basePrice: 345.60, description: 'Heavy equipment manufacturer producing construction and mining machinery, engines, and industrial turbines.' },
  { symbol: 'GE', name: 'General Electric Company', sector: 'Industrials', basePrice: 168.90, description: 'Industrial conglomerate providing power generation, aviation, healthcare, and renewable energy solutions.' },
  { symbol: 'UPS', name: 'United Parcel Service, Inc.', sector: 'Industrials', basePrice: 145.80, description: 'Package delivery and supply chain management company providing logistics and transportation services worldwide.' },
  
  // Software & Cloud
  { symbol: 'CRM', name: 'Salesforce, Inc.', sector: 'Technology', basePrice: 285.40, description: 'Cloud-based software company providing customer relationship management (CRM) and enterprise applications.' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', basePrice: 125.60, description: 'Enterprise software company offering database management systems, cloud applications, and technology services.' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', basePrice: 565.80, description: 'Software company creating digital media and marketing solutions including Photoshop, Illustrator, and Acrobat.' },
  { symbol: 'NOW', name: 'ServiceNow, Inc.', sector: 'Technology', basePrice: 785.30, description: 'Cloud computing company providing digital workflow automation and IT service management platforms.' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', basePrice: 168.45, description: 'Cloud data platform company enabling data storage, processing, and analytics across multiple clouds.' },
  
  // E-commerce & Payments
  { symbol: 'PYPL', name: 'PayPal Holdings, Inc.', sector: 'Financial Services', basePrice: 62.85, description: 'Digital payments platform enabling online money transfers and electronic payment services worldwide.' },
  { symbol: 'SQ', name: 'Block, Inc.', sector: 'Financial Services', basePrice: 78.90, description: 'Financial services and digital payments company providing point-of-sale systems and mobile payment solutions.' },
  { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Technology', basePrice: 85.40, description: 'E-commerce platform providing online store creation, payment processing, and business management tools.' },
  
  // Automotive
  { symbol: 'F', name: 'Ford Motor Company', sector: 'Automotive', basePrice: 12.45, description: 'Automotive manufacturer designing, producing, and selling cars, trucks, SUVs, and electric vehicles.' },
  { symbol: 'GM', name: 'General Motors Company', sector: 'Automotive', basePrice: 38.90, description: 'Automotive company manufacturing vehicles under brands including Chevrolet, GMC, Cadillac, and Buick.' },
  { symbol: 'RIVN', name: 'Rivian Automotive, Inc.', sector: 'Automotive', basePrice: 18.75, description: 'Electric vehicle manufacturer producing electric trucks, SUVs, and delivery vans for consumers and businesses.' },
  
  // Aerospace & Defense
  { symbol: 'LMT', name: 'Lockheed Martin Corporation', sector: 'Industrials', basePrice: 485.60, description: 'Aerospace and defense company manufacturing military aircraft, missiles, and advanced technology systems.' },
  { symbol: 'RTX', name: 'RTX Corporation', sector: 'Industrials', basePrice: 112.30, description: 'Aerospace and defense company producing aircraft engines, avionics, and defense systems.' },
  { symbol: 'NOC', name: 'Northrop Grumman Corporation', sector: 'Industrials', basePrice: 485.90, description: 'Defense technology company developing aircraft, spacecraft, cybersecurity, and autonomous systems.' },
  
  // Biotech
  { symbol: 'GILD', name: 'Gilead Sciences, Inc.', sector: 'Healthcare', basePrice: 85.40, description: 'Biopharmaceutical company researching and developing medicines for life-threatening diseases.' },
  { symbol: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare', basePrice: 285.60, description: 'Biotechnology company discovering, developing, and delivering human therapeutics for serious illnesses.' },
  { symbol: 'BIIB', name: 'Biogen Inc.', sector: 'Healthcare', basePrice: 225.80, description: 'Biotechnology company specializing in therapies for neurological and neurodegenerative diseases.' },
  { symbol: 'MRNA', name: 'Moderna, Inc.', sector: 'Healthcare', basePrice: 68.90, description: 'Biotechnology company developing messenger RNA therapeutics and vaccines for infectious diseases.' },
  
  // Real Estate
  { symbol: 'AMT', name: 'American Tower Corporation', sector: 'Real Estate', basePrice: 215.40, description: 'Real estate investment trust owning and operating wireless and broadcast communications infrastructure.' },
  { symbol: 'PLD', name: 'Prologis, Inc.', sector: 'Real Estate', basePrice: 125.80, description: 'Logistics real estate company owning and developing industrial distribution centers and warehouses.' },
  { symbol: 'SPG', name: 'Simon Property Group, Inc.', sector: 'Real Estate', basePrice: 168.90, description: 'Real estate investment trust owning and managing retail shopping malls and premium outlets.' },
];

// Get company description by symbol
export const getCompanyDescription = (symbol: string): string => {
  const stock = allUSStocks.find(s => s.symbol === symbol);
  return stock?.description || 'No description available.';
};

// Generate stock data dynamically with enhanced daily variation
const generateStockData = (symbol: string, name: string, basePrice: number, sector: string): StockData => {
  // Get stock info for sector
  const stockInfo = allUSStocks.find(s => s.symbol === symbol);
  const stockSector = stockInfo?.sector || sector;
  
  // Apply enhanced daily variation to base price
  const dailyVariation = getEnhancedDailyVariation(symbol, stockSector);
  const adjustedBasePrice = basePrice * dailyVariation;
  
  const volatility = 0.02 + Math.random() * 0.02;
  const historicalData = generateHistoricalData(adjustedBasePrice, volatility);
  const currentPrice = historicalData[historicalData.length - 1].price;
  const previousClose = historicalData[historicalData.length - 2].price;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  const trend = 0.005 + Math.random() * 0.015;
  const predictionData = generatePredictionData(currentPrice, 7, trend);
  const predictedPrice = predictionData[predictionData.length - 1].price;
  const predictedChange = predictedPrice - currentPrice;
  const predictedChangePercent = (predictedChange / currentPrice) * 100;
  
  const confidence = Math.round(75 + Math.random() * 20);
  
  return {
    symbol,
    name,
    currentPrice: parseFloat(currentPrice.toFixed(2)),
    previousClose: parseFloat(previousClose.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    predictedPrice: parseFloat(predictedPrice.toFixed(2)),
    predictedChange: parseFloat(predictedChange.toFixed(2)),
    predictedChangePercent: parseFloat(predictedChangePercent.toFixed(2)),
    confidence,
    historicalData,
    predictionData,
  };
};

// Generate initial mock stocks with enhanced daily variation
const generateMockStocks = (): StockData[] => {
  const topStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 178.45, sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 142.80, sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', basePrice: 412.35, sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', basePrice: 248.90, sector: 'Automotive' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', basePrice: 178.25, sector: 'Consumer Cyclical' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', basePrice: 875.50, sector: 'Technology' },
  ];
  
  return topStocks.map(stock => {
    const dailyVariation = getEnhancedDailyVariation(stock.symbol, stock.sector);
    const adjustedBasePrice = stock.basePrice * dailyVariation;
    
    const volatility = stock.sector === 'Technology' ? 0.03 : 0.025;
    const historicalData = generateHistoricalData(adjustedBasePrice, volatility);
    const currentPrice = historicalData[historicalData.length - 1].price;
    const previousClose = historicalData[historicalData.length - 2].price;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    const trend = stock.sector === 'Technology' ? 0.015 : 0.01;
    const predictionData = generatePredictionData(currentPrice, 7, trend);
    const predictedPrice = predictionData[predictionData.length - 1].price;
    const predictedChange = predictedPrice - currentPrice;
    const predictedChangePercent = (predictedChange / currentPrice) * 100;
    
    const confidence = Math.round(75 + Math.random() * 20);
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      previousClose: parseFloat(previousClose.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      predictedPrice: parseFloat(predictedPrice.toFixed(2)),
      predictedChange: parseFloat(predictedChange.toFixed(2)),
      predictedChangePercent: parseFloat(predictedChangePercent.toFixed(2)),
      confidence,
      historicalData,
      predictionData,
    };
  });
};

export const mockStocks: StockData[] = generateMockStocks();

export const getStockBySymbol = (symbol: string): StockData | undefined => {
  console.log('Getting stock by symbol:', symbol);
  
  // First check if it's in the mock stocks
  const mockStock = mockStocks.find(stock => stock.symbol === symbol);
  if (mockStock) {
    return mockStock;
  }
  
  // Otherwise, generate it dynamically from the all stocks list
  const stockInfo = allUSStocks.find(stock => stock.symbol === symbol);
  if (stockInfo) {
    return generateStockData(stockInfo.symbol, stockInfo.name, stockInfo.basePrice, stockInfo.sector);
  }
  
  return undefined;
};

export const getWatchlist = (): WatchlistItem[] => {
  return mockStocks.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    currentPrice: stock.currentPrice,
    change: stock.change,
    changePercent: stock.changePercent,
    predictedChange: stock.predictedChange,
  }));
};

// Search stocks by symbol or name
export const searchStocks = (query: string, limit: number = 10): Array<{ symbol: string; name: string; sector: string }> => {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const searchTerm = query.toLowerCase().trim();
  console.log('Searching stocks with query:', searchTerm);
  
  const results = allUSStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm) ||
    stock.name.toLowerCase().includes(searchTerm)
  );
  
  // Sort by relevance: exact matches first, then starts with, then contains
  results.sort((a, b) => {
    const aSymbol = a.symbol.toLowerCase();
    const bSymbol = b.symbol.toLowerCase();
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    
    // Exact symbol match
    if (aSymbol === searchTerm) return -1;
    if (bSymbol === searchTerm) return 1;
    
    // Symbol starts with
    if (aSymbol.startsWith(searchTerm) && !bSymbol.startsWith(searchTerm)) return -1;
    if (bSymbol.startsWith(searchTerm) && !aSymbol.startsWith(searchTerm)) return 1;
    
    // Name starts with
    if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
    if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
    
    // Alphabetical
    return aSymbol.localeCompare(bSymbol);
  });
  
  return results.slice(0, limit);
};
