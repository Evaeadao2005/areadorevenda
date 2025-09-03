// Arquivo: netlify/functions/auth.js

// A URL de login real do seu painel, identificada a partir da sua navegação.
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

    // Garante que a requisição seja do tipo POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405, // Method Not Allowed
            headers,
            body: JSON.stringify({ message: 'Método não permitido.' })
        };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            return {
                statusCode: 400, // Bad Request
                headers,
                body: JSON.stringify({ message: 'Usuário e senha são obrigatórios.' })
            };
        }

        // --- AUTENTICAÇÃO REAL CONTRA O SEU PAINEL ---
        // Esta parte envia as credenciais para o seu painel de forma segura
        const response = await fetch(PANEL_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        // Se a resposta do painel for bem-sucedida (status 200)
        if (response.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Login bem-sucedido!' })
            };
        } else {
            // Se a resposta do painel indicar um erro (status 401, etc.)
            // Retorna o status de erro e a mensagem que o próprio painel enviou
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ message: data.message || 'Credenciais inválidas.' })
            };
        }

    } catch (error) {
        // Se ocorrer qualquer outro erro (ex: rede, JSON inválido), retorna um erro 500
        console.error("Erro na função de autenticação:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Ocorreu um erro inesperado no servidor.' })
        };
    }
};
