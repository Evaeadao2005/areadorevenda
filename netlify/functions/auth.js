// Arquivo para: netlify/functions/auth.js

// A URL de login real do seu painel, descoberta a partir do arquivo HAR
const PANEL_LOGIN_URL = 'https://daltvplus.sigmab.pro/api/v1/user/login';

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*', // Permite acesso de qualquer origem
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    // Responde a uma checagem prévia do navegador (preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    // Apenas responde a requisições POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Método não permitido' })
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

        // Faz a chamada de login para o painel real
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

        // Se a resposta do painel for bem-sucedida (status 200-299)
        if (response.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Login bem-sucedido!' })
            };
        } else {
            // Se a resposta do painel indicar erro (ex: 401, 422)
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ message: data.message || 'Usuário ou senha inválidos.' })
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Erro interno ao tentar autenticar.' })
        };
    }
};
