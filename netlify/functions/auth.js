// Arquivo para: netlify/functions/auth.js

// A URL de login real do seu painel, descoberta a partir do arquivo HAR
const PANEL_LOGIN_URL = 'https://daltvplus.sigmab.pro/api/v1/user/login';

exports.handler = async function(event, context) {
    // Cabeçalhos para permitir a comunicação (CORS)
    const headers = {
        'Access-Control-Allow-Origin': '*', // Permite acesso de qualquer origem
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
            statusCode: 405, // Method Not Allowed
            headers,
            body: JSON.stringify({ message: 'Método não permitido' })
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

        // --- AUTENTICAÇÃO REAL CONTRA O PAINEL ---
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

        // Tenta ler a resposta do painel como JSON
        const data = await response.json();

        // Se a resposta do painel for bem-sucedida (status 200-299)
        if (response.ok) {
            return {
                statusCode: 200,
                headers,
                // Retorna sucesso e o token recebido do painel
                body: JSON.stringify({ success: true, token: data.token })
            };
        } else {
            // Se a resposta do painel indicar erro (ex: 401, 422)
            // Retorna o status de erro e a mensagem de erro que o painel enviou
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ message: data.message || 'Credenciais inválidas.' })
            };
        }

    } catch (error) {
        console.error("Erro na função de autenticação:", error);
        return {
            statusCode: 500, // Internal Server Error
            headers,
            body: JSON.stringify({ message: 'Ocorreu um erro inesperado no servidor.' })
        };
    }
};
