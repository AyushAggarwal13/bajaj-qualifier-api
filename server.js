const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const email = process.env.OFFICIAL_EMAIL || 'student@chitkara.edu.in';
const apiKey = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// simple logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// fibonacci generator
function getFibonacci(n) {
    if (n <= 0) return [];
    if (n === 1) return [0];
    
    let fib = [0, 1];
    for (let i = 2; i < n; i++) {
        fib.push(fib[i - 1] + fib[i - 2]);
    }
    return fib.slice(0, n);
}

// check prime
function checkPrime(num) {
    if (num <= 1) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    
    let sq = Math.sqrt(num);
    for (let i = 3; i <= sq; i += 2) {
        if (num % i === 0) return false;
    }
    return true;
}

function getPrimes(numbers) {
    return numbers.filter(num => checkPrime(num));
}

// gcd calculation
function getGCD(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function getHCF(numbers) {
    if (numbers.length === 0) return 0;
    if (numbers.length === 1) return Math.abs(numbers[0]);
    
    let res = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        res = getGCD(res, numbers[i]);
        if (res === 1) return 1;
    }
    return res;
}

function getLCM(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (a === 0 || b === 0) return 0;
    return (a * b) / getGCD(a, b);
}

function calculateLCM(numbers) {
    if (numbers.length === 0) return 0;
    if (numbers.length === 1) return Math.abs(numbers[0]);
    
    let res = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        res = getLCM(res, numbers[i]);
    }
    return res;
}

// ai query function
async function askAI(question) {
    if (!apiKey) {
        throw new Error('API key not configured');
    }
    
    let prompt = `Answer this question with just one word: ${question}`;
    let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    try {
        let resp = await axios.post(endpoint, {
            contents: [{
                parts: [{ text: prompt }]
            }]
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        if (resp.data.candidates && resp.data.candidates.length > 0) {
            let ans = resp.data.candidates[0].content.parts[0].text;
            let words = ans.trim().split(/\s+/);
            return words[0].replace(/[.,!?;:]+$/g, '');
        }
        
        throw new Error('No AI response');
    } catch (err) {
        if (err.response) {
            throw new Error(`API error: ${err.response.status}`);
        }
        throw new Error(`Service error: ${err.message}`);
    }
}

// main endpoint
app.post('/bfhl', async (req, res) => {
    try {
        let data = req.body;
        
        // check which operation is requested
        let ops = ['fibonacci', 'prime', 'lcm', 'hcf', 'AI'];
        let requested = ops.filter(op => data.hasOwnProperty(op));
        
        if (requested.length === 0) {
            return res.status(400).json({
                is_success: false,
                official_email: email,
                error: 'No operation specified'
            });
        }
        
        if (requested.length > 1) {
            return res.status(400).json({
                is_success: false,
                official_email: email,
                error: 'Only one operation allowed per request'
            });
        }
        
        // handle fibonacci
        if (data.hasOwnProperty('fibonacci')) {
            let n = data.fibonacci;
            
            if (typeof n !== 'number' || !Number.isInteger(n)) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Fibonacci input must be an integer'
                });
            }
            
            if (n < 0) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Input cannot be negative'
                });
            }
            
            if (n > 1000) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Input too large'
                });
            }
            
            let result = getFibonacci(n);
            return res.json({
                is_success: true,
                official_email: email,
                data: result
            });
        }
        
        // handle prime
        if (data.hasOwnProperty('prime')) {
            let nums = data.prime;
            
            if (!Array.isArray(nums)) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Prime input must be an array'
                });
            }
            
            if (nums.length === 0) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Array cannot be empty'
                });
            }
            
            if (nums.length > 10000) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Array too large'
                });
            }
            
            if (!nums.every(n => Number.isInteger(n))) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'All elements must be integers'
                });
            }
            
            let result = getPrimes(nums);
            return res.json({
                is_success: true,
                official_email: email,
                data: result
            });
        }
        
        // handle lcm
        if (data.hasOwnProperty('lcm')) {
            let nums = data.lcm;
            
            if (!Array.isArray(nums)) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'LCM input must be an array'
                });
            }
            
            if (nums.length === 0) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Array cannot be empty'
                });
            }
            
            if (nums.length > 1000) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Array too large'
                });
            }
            
            if (!nums.every(n => Number.isInteger(n))) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'All elements must be integers'
                });
            }
            
            if (nums.some(n => n === 0)) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Cannot calculate LCM with zero'
                });
            }
            
            let result = calculateLCM(nums);
            return res.json({
                is_success: true,
                official_email: email,
                data: result
            });
        }
        
        // handle hcf
        if (data.hasOwnProperty('hcf')) {
            let nums = data.hcf;
            
            if (!Array.isArray(nums)) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'HCF input must be an array'
                });
            }
            
            if (nums.length === 0) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Array cannot be empty'
                });
            }
            
            if (nums.length > 1000) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Array too large'
                });
            }
            
            if (!nums.every(n => Number.isInteger(n))) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'All elements must be integers'
                });
            }
            
            let result = getHCF(nums);
            return res.json({
                is_success: true,
                official_email: email,
                data: result
            });
        }
        
        // handle AI queries
        if (data.hasOwnProperty('AI')) {
            let q = data.AI;
            
            if (typeof q !== 'string') {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Question must be a string'
                });
            }
            
            if (q.trim() === '') {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Question cannot be empty'
                });
            }
            
            if (q.length > 500) {
                return res.status(400).json({
                    is_success: false,
                    official_email: email,
                    error: 'Question too long'
                });
            }
            
            try {
                let answer = await askAI(q);
                return res.json({
                    is_success: true,
                    official_email: email,
                    data: answer
                });
            } catch (err) {
                return res.status(500).json({
                    is_success: false,
                    official_email: email,
                    error: err.message
                });
            }
        }
        
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({
            is_success: false,
            official_email: email,
            error: 'Something went wrong'
        });
    }
});

// health check
app.get('/health', (req, res) => {
    res.json({
        is_success: true,
        official_email: email
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({
        is_success: false,
        official_email: email,
        error: 'Not found'
    });
});

// error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        is_success: false,
        official_email: email,
        error: 'Internal error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Email: ${email}`);
    console.log(`\nEndpoints:`);
    console.log(`  POST /bfhl`);
    console.log(`  GET /health\n`);
});
module.exports = app;
