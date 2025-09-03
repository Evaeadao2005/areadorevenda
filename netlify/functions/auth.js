// Arquivo: netlify/functions/auth.js (versão com logs aprimorados)

// A URL de login real do seu painel.
const PANEL_LOGIN_URL = 'https://daltvplus.sigmab.pro/api/v1/user/login';

exports.handler = async function(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Método não permitido.' })
        };
    }

    // LOG 1: Registra o início da execução
    console.log("Recebida requisição de login.");

    try {
        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Usuário e senha são obrigatórios.' })
            };
        }

        // LOG 2: Registra os dados que serão enviados (sem a senha, por segurança)
        console.log(`Tentando autenticar usuário: ${username}`);

        const response = await fetch(PANEL_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        // LOG 3: Registra o status da resposta do seu painel
        console.log(`Painel respondeu com status: ${response.status}`);
        
        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch (jsonError) {
            // LOG 4: Se a resposta não for JSON, este log é crucial!
            console.error("ERRO: A resposta do painel não é um JSON válido. Resposta recebida:", responseText);
            // Lança um erro para ser pego pelo catch principal.
            throw new Error("O painel retornou uma resposta em formato inesperado (não-JSON).");
        }
        
        if (response.ok) {
            console.log("Autenticação bem-sucedida para o usuário:", username);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, token: data.token })
            };
        } else {
            console.warn(`Falha na autenticação para usuário ${username}. Mensagem do painel: ${data.message}`);
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ message: data.message || 'Credenciais inválidas.' })
            };
        }

    } catch (error) {
        // LOG 5: O log mais importante. Captura o erro completo.
        console.error("ERRO CRÍTICO NA FUNÇÃO DE AUTENTICAÇÃO:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Ocorreu um erro inesperado no servidor.' })
        };
    }
};
