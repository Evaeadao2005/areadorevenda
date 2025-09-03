// Arquivo: netlify/functions/auth.js (Versão Final de Diagnóstico)

const PANEL_LOGIN_URL = 'https://daltvplus.sigmab.pro/api/v1/user/login';

exports.handler = async function(event) {
    console.log("--- INÍCIO DA EXECUÇÃO DA FUNÇÃO AUTH ---");
    console.log("Método da requisição:", event.httpMethod);

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-control-allow-headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        console.log("Respondendo à requisição OPTIONS (preflight).");
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'POST') {
        console.warn("Método não permitido:", event.httpMethod);
        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Método não permitido.' }) };
    }

    try {
        console.log("Analisando o corpo da requisição...");
        const { username, password } = JSON.parse(event.body);
        console.log(`Dados recebidos: usuário = ${username}`);

        if (!username || !password) {
            console.error("Erro: Usuário ou senha não fornecidos no corpo da requisição.");
            return { statusCode: 400, headers, body: JSON.stringify({ message: 'Usuário e senha são obrigatórios.' }) };
        }

        console.log(`Enviando requisição de login para: ${PANEL_LOGIN_URL}`);
        const response = await fetch(PANEL_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
            },
            body: JSON.stringify({ username, password })
        });

        console.log(`Painel respondeu com status: ${response.status}`);
        
        const responseText = await response.text();
        console.log("Texto da resposta do painel:", responseText);

        const data = JSON.parse(responseText);
        
        if (response.ok) {
            console.log("Autenticação bem-sucedida.");
            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        } else {
            console.warn("Falha na autenticação. Mensagem do painel:", data.message);
            return { statusCode: response.status, headers, body: JSON.stringify({ message: data.message || 'Credenciais inválidas.' }) };
        }

    } catch (error) {
        console.error("--- ERRO CRÍTICO CAPTURADO ---");
        console.error("Tipo de Erro:", error.name);
        console.error("Mensagem de Erro:", error.message);
        console.error("Stack Trace:", error.stack);
        console.error("--- FIM DO ERRO CRÍTICO ---");

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Ocorreu um erro inesperado no servidor.' })
        };
    }
};
