// Arquivo: netlify/functions/auth.js

// A URL de login real do seu painel.
const PANEL_LOGIN_URL = 'https://daltvplus.sigmab.pro/api/v1/user/login';

exports.handler = async function(event) {
    // Cabeçalhos essenciais para permitir a comunicação (CORS)
    const headers = {
        'Access-Control-Allow-Origin': '*', // Permite que seu site no Netlify acesse a função
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    // Responde a uma checagem prévia do navegador (preflight OPTIONS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Método não permitido.' })
        };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Usuário e senha são obrigatórios.' })
            };
        }

        // --- AUTENTICAÇÃO REAL CONTRA O SEU PAINEL ---
        const response = await fetch(PANEL_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // ADIÇÃO CRUCIAL: Faz a requisição se passar por um navegador comum
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        // Lógica de tratamento de resposta mais robusta
        const responseText = await response.text();
        let data;

        try {
            // Tenta interpretar a resposta como JSON
            data = JSON.parse(responseText);
        } catch (jsonError) {
            // Se não for JSON (ex: uma página de erro HTML), o erro é capturado aqui
            console.error("A resposta do painel não foi um JSON válido. Resposta recebida:", responseText);
            // Retorna o erro genérico para o usuário
            throw new Error("O painel retornou uma resposta inválida.");
        }
        
        if (response.ok) {
            // Sucesso
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, token: data.token })
            };
        } else {
            // Erro de login (ex: 401 Unauthorized)
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ message: data.message || 'Credenciais inválidas.' })
            };
        }

    } catch (error) {
        // Captura qualquer erro na comunicação ou na lógica acima
        console.error("Erro detalhado na função de autenticação:", error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Ocorreu um erro inesperado no servidor.' })
        };
    }
};
